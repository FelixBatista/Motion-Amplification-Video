"""
Standalone Motion Amplification Video Application
Serves both the API and frontend from a single executable
"""
import os
import sys
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import subprocess

# Create necessary directories
os.makedirs("data/uploads", exist_ok=True)
os.makedirs("data/vids", exist_ok=True)
os.makedirs("data/output", exist_ok=True)

app = FastAPI(title="Motion Amplification Video")

# CORS - allow all origins for local use
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class InputParameters(BaseModel):
    phase: str = "run"
    config_file: str = "o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3.conf"
    config_spec: str = "configs/configspec.conf"
    vid_dir: str = "data/vids"
    frame_ext: str = "png"
    out_dir: str = "data/output"
    amplification_factor: int = 30
    velocity_mag: bool = False
    fl: float = 0.04
    fh: float = 0.4
    fs: float = 30.0
    n_filter_tap: int = 2
    filter_type: str = "differenceOfIIR"
    Temporal: bool = True

class ProcessRequest(BaseModel):
    videoPath: str
    inputParameters: InputParameters
    
    model_config = {"extra": "allow"}  # Allow extra fields for flexibility

# Serve static files (frontend build) if it exists
static_dir = Path("frontend/build")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir / "static")), name="static")

# API Routes
@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Motion Amplification Video API"}

@app.get("/api/videos")
async def list_videos():
    """List all uploaded videos"""
    upload_dir = Path("data/uploads")
    videos = []
    if upload_dir.exists():
        for file in upload_dir.glob("*.mp4"):
            videos.append({
                "name": file.name,
                "path": f"/api/video/{file.name}",
                "size": file.stat().st_size
            })
    return {"videos": videos}

@app.get("/api/video/{filename}")
async def get_video(filename: str):
    """Serve a video file"""
    video_path = Path("data/uploads") / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(str(video_path), media_type="video/mp4")

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file"""
    if not file.filename.endswith(('.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only video files are allowed.")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save uploaded file
    upload_path = upload_dir / file.filename
    with open(upload_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    return {
        "message": "Video uploaded successfully",
        "filename": file.filename,
        "path": f"/api/video/{file.filename}",
        "size": upload_path.stat().st_size
    }

@app.post("/api/process")
async def process_video(request: ProcessRequest):
    """Process a video with motion amplification"""
    try:
        video_path = Path(request.videoPath.replace("/api/video/", "data/uploads/"))
        if not video_path.exists():
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Extract video name
        name = video_path.stem
        vid_dir = Path(f"data/vids/{name}")
        vid_dir.mkdir(parents=True, exist_ok=True)
        
        # Convert video to frames using ffmpeg
        print(f"Converting video to frames...")
        print(f"Video path: {video_path}")
        print(f"Output directory: {vid_dir}")
        ffmpeg_cmd = f'ffmpeg -i "{video_path}" "{vid_dir}/%06d.png"'
        print(f"FFmpeg command: {ffmpeg_cmd}")
        result = subprocess.run(ffmpeg_cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            error_msg = f"FFmpeg error: {result.stderr}\nStdout: {result.stdout}"
            print(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)
        
        # Build processing command
        params = request.inputParameters
        # Ensure config_file has correct path
        config_file = params.config_file
        if not config_file.startswith("configs/") and not "/" in config_file:
            config_file = f"configs/{config_file}"
        
        # Use Python 3.10 for main.py (TensorFlow compatibility)
        python_cmd = "py -3.10"
        
        # Quote paths that might contain spaces
        vid_dir_quoted = f'"{vid_dir}"'
        out_dir_base = f"data/output/{name}_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3"
        out_dir_quoted = f'"{out_dir_base}"'
        config_file_quoted = f'"{config_file}"'
        
        if params.Temporal:
            command = (
                f'{python_cmd} main.py --config_file={config_file_quoted} --phase=run_temporal '
                f'--vid_dir={vid_dir_quoted} --out_dir={out_dir_quoted} '
                f'--amplification_factor={params.amplification_factor} '
                f'--fl={params.fl} --fh={params.fh} --fs={params.fs} '
                f'--n_filter_tap={params.n_filter_tap} --filter_type={params.filter_type}'
            )
            folder = f"{name}_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl{params.fl}_fh{params.fh}_fs{params.fs}_n{params.n_filter_tap}_{params.filter_type}"
        else:
            command = (
                f'{python_cmd} main.py --config_file={config_file_quoted} --phase=run '
                f'--vid_dir={vid_dir_quoted} --out_dir={out_dir_quoted} '
                f'--amplification_factor={params.amplification_factor}'
            )
            folder = f"{name}_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3"
        
        # Run processing
        print(f"Processing video (this may take a while)...")
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Processing error: {result.stderr}")
        
        # Check for output file
        output_file = Path(f"data/output/{folder}/{folder}_259002.mp4")
        if not output_file.exists():
            raise HTTPException(status_code=500, detail="Processing completed but output file not found")
        
        # Re-encode video for Windows compatibility (H.264 with proper pixel format)
        print(f"Re-encoding video for Windows compatibility...")
        final_output = Path("data/uploads") / f"{name}_processed.mp4"
        final_output.parent.mkdir(parents=True, exist_ok=True)
        
        # Use FFmpeg to re-encode with Windows-compatible codecs
        # Use baseline profile and yuv420p for maximum compatibility
        reencode_cmd = (
            f'ffmpeg -y -i "{output_file}" '
            f'-c:v libx264 -preset fast -crf 18 '
            f'-pix_fmt yuv420p -profile:v baseline -level 3.0 '
            f'-an -movflags +faststart '
            f'"{final_output}"'
        )
        print(f"Re-encoding command: {reencode_cmd}")
        result = subprocess.run(reencode_cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            # If re-encoding fails, try with different settings
            print(f"First re-encode attempt failed, trying alternative settings: {result.stderr[:200]}")
            reencode_cmd_alt = (
                f'ffmpeg -y -i "{output_file}" '
                f'-c:v libx264 -preset medium -crf 23 '
                f'-pix_fmt yuv420p '
                f'-an -movflags +faststart '
                f'"{final_output}"'
            )
            result = subprocess.run(reencode_cmd_alt, shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                # If re-encoding still fails, copy the original
                print(f"Re-encoding failed, copying original: {result.stderr[:200]}")
                print("Note: The video may not play in Windows Media Player. Try VLC or another player.")
                shutil.copy2(output_file, final_output)
            else:
                print(f"Video re-encoded successfully with alternative settings: {final_output}")
        else:
            print(f"Video re-encoded successfully: {final_output}")
        
        return {
            "message": "Video processed successfully",
            "outputPath": f"/api/video/{final_output.name}",
            "inputParameters": params.dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# Serve index.html for all non-API routes (SPA routing) - must be LAST
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    if full_path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Static file not found")
    static_dir = Path("frontend/build")
    index_path = static_dir / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Frontend not built. Run 'cd frontend && npm run build' first."}

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    
    print("=" * 60)
    print("Motion Amplification Video - Standalone Application")
    print("=" * 60)
    print(f"Starting server on http://localhost:{port}")
    print("=" * 60)
    print("Note: If port is in use, stop the existing server or set PORT environment variable")
    print("=" * 60)
    
    # Auto-open browser
    import webbrowser
    import threading
    
    def open_browser():
        import time
        time.sleep(1.5)  # Wait for server to start
        webbrowser.open(f"http://localhost:{port}")
    
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    try:
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
    except OSError as e:
        if "10048" in str(e) or "address already in use" in str(e).lower():
            print(f"\nERROR: Port {port} is already in use!")
            print(f"Please stop the existing server or use a different port:")
            print(f"  set PORT=8001")
            print(f"  python app.py")
            print("\nOr run: stop_server.bat")
        else:
            raise


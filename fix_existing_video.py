"""Fix existing video file encoding for Windows compatibility"""
import subprocess
import sys
from pathlib import Path

def find_ffmpeg():
    """FFmpeg should work with shell=True like in app.py"""
    # Just return 'ffmpeg' - we'll use shell=True which should work
    # (This is how app.py successfully calls FFmpeg)
    return 'ffmpeg'

def fix_video(input_file, output_file):
    """Re-encode video with Windows-compatible settings"""
    ffmpeg_path = find_ffmpeg()
    if not ffmpeg_path:
        print("ERROR: FFmpeg not found! Please ensure FFmpeg is installed and in PATH.")
        return False
    
    input_path = Path(input_file)
    output_path = Path(output_file)
    
    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}")
        return False
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Use Windows-compatible encoding settings
    # Build command string for shell=True (like app.py does)
    cmd_str = (
        f'ffmpeg -y -i "{input_path}" '
        f'-c:v libx264 -preset fast -crf 18 '
        f'-pix_fmt yuv420p -profile:v baseline -level 3.0 '
        f'-an -movflags +faststart '
        f'"{output_path}"'
    )
    
    print(f"Re-encoding video...")
    print(f"Input: {input_path}")
    print(f"Output: {output_path}")
    print(f"Command: {cmd_str}")
    
    # Always use shell=True like app.py does
    result = subprocess.run(cmd_str, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"ERROR: Re-encoding failed!")
        print(f"FFmpeg output: {result.stderr[:500]}")
        return False
    
    print(f"SUCCESS! Fixed video saved to: {output_path}")
    return True

if __name__ == "__main__":
    input_file = r"data\output\Vibration on wheel at speed_ (online-video-cutter.com)_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl0.04_fh0.4_fs30.0_n2_differenceOfIIR\Vibration on wheel at speed_ (online-video-cutter.com)_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl0.04_fh0.4_fs30.0_n2_differenceOfIIR_259002.mp4"
    output_file = r"data\uploads\Vibration on wheel at speed_ (online-video-cutter.com)_processed.mp4"
    
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    
    success = fix_video(input_file, output_file)
    sys.exit(0 if success else 1)


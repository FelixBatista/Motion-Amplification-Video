# Motion Amplification Video - Standalone Version

A simplified, standalone version that runs completely locally with no external dependencies.

## Quick Start

### Option 1: Run Directly (Development)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn python-multipart
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```
   Or on Windows:
   ```bash
   run_standalone.bat
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8000`

### Option 2: Create Windows Executable

1. **Install PyInstaller:**
   ```bash
   pip install pyinstaller
   ```

2. **Build executable:**
   ```bash
   python build_exe.py
   ```
   Or manually:
   ```bash
   pyinstaller --onefile --name "MotionAmplification" --add-data "frontend/build;frontend/build" app.py
   ```

3. **Run the executable:**
   Find `MotionAmplification.exe` in the `dist` folder and double-click to run.

## Features

✅ **No Authentication** - Just upload and process videos
✅ **Local Storage** - All videos stored in `data/uploads/`
✅ **No Internet Required** - Everything runs locally
✅ **Single Executable** - Can be packaged as one file
✅ **Browser Interface** - Clean, modern web UI

## Directory Structure

```
data/
  uploads/     - Uploaded videos (created automatically)
  vids/        - Video frames during processing
  output/      - Processed videos
```

## API Endpoints

The application runs a local API server on port 8000:

- `GET /api/health` - Health check
- `GET /api/videos` - List uploaded videos
- `GET /api/video/{filename}` - Get video file
- `POST /api/upload` - Upload video (multipart/form-data)
- `POST /api/process` - Process video with motion amplification

## Requirements

- Python 3.8+
- Node.js (for building frontend, not needed for executable)
- FFmpeg (for video processing)
- TensorFlow and other ML dependencies (see requirements.txt)

## Troubleshooting

### Frontend not found
Make sure you've built the frontend: `cd frontend && npm run build`

### Port already in use
Change the port in `app.py` or set environment variable: `set PORT=8001`

### Video processing fails
- Check that FFmpeg is installed and in PATH
- Check that TensorFlow models are in the correct location
- Check the console output for error messages

## What Was Removed

- ❌ User authentication (login/signup)
- ❌ MongoDB database
- ❌ AWS S3 cloud storage
- ❌ Node.js backend server
- ❌ Multiple service dependencies

Everything now runs from a single Python application!


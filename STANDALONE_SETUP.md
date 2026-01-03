# Standalone Application Setup

This application has been simplified to run as a standalone Windows application with no external dependencies (no MongoDB, no AWS).

## What Changed

1. **Removed Authentication** - No login/signup required
2. **Removed MongoDB** - Videos stored locally on disk
3. **Removed AWS/S3** - All files stored in `data/` directory
4. **Single Server** - One Python server serves both API and frontend

## Running the Application

### Development Mode

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

4. **Open browser:**
   Navigate to `http://localhost:8000`

### Creating Windows Executable

1. **Install PyInstaller:**
   ```bash
   pip install pyinstaller
   ```

2. **Build executable:**
   ```bash
   pyinstaller --onefile --name "MotionAmplification" --add-data "frontend/build;frontend/build" app.py
   ```

3. **Run the executable:**
   The executable will be in the `dist` folder

## Directory Structure

```
data/
  uploads/     - Uploaded videos
  vids/        - Video frames (created during processing)
  output/      - Processed videos
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/videos` - List all uploaded videos
- `GET /api/video/{filename}` - Get a video file
- `POST /api/upload` - Upload a video (multipart/form-data)
- `POST /api/process` - Process a video with motion amplification

## Notes

- All videos are stored locally in `data/uploads/`
- No internet connection required
- No database needed
- Processing happens on your local machine


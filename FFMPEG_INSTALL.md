# Installing FFmpeg on Windows

FFmpeg is required for video processing. Here are the installation options:

## Option 1: Using winget (Recommended - Easiest)

If you have Windows 10/11 with winget:

```powershell
winget install FFmpeg
```

After installation, restart your terminal/command prompt and verify:
```powershell
ffmpeg -version
```

## Option 2: Manual Installation

1. **Download FFmpeg:**
   - Go to https://www.gyan.dev/ffmpeg/builds/
   - Download "ffmpeg-release-essentials.zip" (or latest version)
   - Extract the ZIP file to a location like `C:\ffmpeg`

2. **Add to PATH:**
   - Open "Environment Variables" (search in Start menu)
   - Under "System variables", find and select "Path", then click "Edit"
   - Click "New" and add: `C:\ffmpeg\bin` (or wherever you extracted ffmpeg)
   - Click "OK" on all dialogs
   - **Restart your terminal/command prompt**

3. **Verify installation:**
   ```powershell
   ffmpeg -version
   ```

## Option 3: Using Chocolatey

If you have Chocolatey installed:

```powershell
choco install ffmpeg
```

## After Installation

1. Close and restart your terminal/command prompt
2. Verify FFmpeg is installed: `ffmpeg -version`
3. Restart the application: `python app.py`

The video processing should now work!


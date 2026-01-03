@echo off
echo ========================================
echo Fixing Video Encoding for Windows
echo ========================================
echo.

set "INPUT=data\output\Vibration on wheel at speed_ (online-video-cutter.com)_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl0.04_fh0.4_fs30.0_n2_differenceOfIIR\Vibration on wheel at speed_ (online-video-cutter.com)_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl0.04_fh0.4_fs30.0_n2_differenceOfIIR_259002.mp4"
set "OUTPUT=data\uploads\Vibration on wheel at speed_ (online-video-cutter.com)_processed.mp4"

if not exist "%INPUT%" (
    echo ERROR: Input file not found!
    echo Looking for: %INPUT%
    pause
    exit /b 1
)

if not exist "data\uploads" mkdir "data\uploads"

echo Re-encoding video with Windows-compatible settings...
echo This may take a few minutes...
echo.

ffmpeg -y -i "%INPUT%" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -profile:v baseline -level 3.0 -an -movflags +faststart "%OUTPUT%"

if errorlevel 1 (
    echo.
    echo ERROR: Re-encoding failed!
    echo Make sure FFmpeg is installed and in your PATH.
    echo.
    echo You can install FFmpeg with: winget install ffmpeg
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo Fixed video saved to: %OUTPUT%
echo You can now open it with Windows Media Player or any video player.
echo.
pause


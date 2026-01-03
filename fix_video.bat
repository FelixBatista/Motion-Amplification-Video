@echo off
echo Fixing video encoding for Windows compatibility...
echo.

set "INPUT=data\output\Vibration on wheel at speed_ (online-video-cutter.com)_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl0.04_fh0.4_fs30.0_n2_differenceOfIIR\Vibration on wheel at speed_ (online-video-cutter.com)_o3f_hmhm2_bg_qnoise_mix4_nl_n_t_ds3_fl0.04_fh0.4_fs30.0_n2_differenceOfIIR_259002.mp4"
set "OUTPUT=data\uploads\Vibration on wheel at speed_ (online-video-cutter.com)_processed.mp4"

if not exist "%INPUT%" (
    echo Error: Input file not found: %INPUT%
    pause
    exit /b 1
)

if not exist "data\uploads" mkdir "data\uploads"

echo Re-encoding video...
ffmpeg -y -i "%INPUT%" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -an -movflags +faststart "%OUTPUT%"

if errorlevel 1 (
    echo Re-encoding failed!
    pause
    exit /b 1
)

echo.
echo Success! Fixed video saved to: %OUTPUT%
echo You can now open it with Windows Media Player or any video player.
pause


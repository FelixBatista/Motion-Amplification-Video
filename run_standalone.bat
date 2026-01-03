@echo off
echo Stopping any existing servers on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul 2>&1
echo.
echo Building Motion Amplification Video Application...
echo.

echo Step 1: Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Step 2: Installing Python dependencies...
py -3.10 -c "import fastapi, uvicorn, multipart" 2>nul
if errorlevel 1 (
    echo Installing required packages...
    py -3.10 -m pip install fastapi uvicorn python-multipart
    if errorlevel 1 (
        echo Failed to install Python dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Step 3: Starting application...
echo.
echo ============================================================
echo Application will be available at: http://localhost:8000
echo Press Ctrl+C to stop
echo ============================================================
echo.

py -3.10 app.py

pause

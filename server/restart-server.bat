@echo off
echo Stopping existing server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)
echo Starting server...
start "Backend Server" cmd /k "cd /d %~dp0 && npm start"
echo Server is starting on port 3001...
timeout /t 2 /nobreak >nul
echo Done!


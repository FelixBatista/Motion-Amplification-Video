@echo off
echo Stopping servers on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Stopping process %%a...
    taskkill /PID %%a /F
)
echo Done.
pause

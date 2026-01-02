@echo off
echo Finding process on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping process %%a...
    taskkill /PID %%a /F
    echo Server stopped.
    goto :done
)
echo No server found on port 3001.
:done
pause


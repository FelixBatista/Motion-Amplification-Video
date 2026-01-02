@echo off
echo Starting Motion Amplification Video Services...
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd server && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Python API Server (Port 8080)...
start "Python API" cmd /k "python api.py"

echo.
echo All services are starting...
echo - Backend Server: http://localhost:3001
echo - Frontend: http://localhost:3000
echo - Python API: http://localhost:8080
echo.
echo Press any key to exit this window (services will continue running)...
pause >nul


@echo off
echo Starting AI Image Studio servers...

echo Checking for existing processes on ports 3000 and 8000...
netstat -ano | findstr :3000 && (
    echo Killing processes on port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a 2>nul
)

netstat -ano | findstr :8000 && (
    echo Killing processes on port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /f /pid %%a 2>nul
)

echo Starting backend server on port 8000...
start "Backend" cmd /k "cd /d "backend" && venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000"

timeout /t 3

echo Starting frontend server on port 3000...
start "Frontend" cmd /k "cd /d "frontend" && npm run dev"

echo Servers starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
pause
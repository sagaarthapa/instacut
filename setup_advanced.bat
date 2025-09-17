@echo off
echo AI Image Studio - Advanced Setup (Windows)
echo ==========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.9 or higher.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

echo Setting up backend environment...
mkdir backend 2>nul
cd backend

:: Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install Python packages
if exist "requirements_advanced.txt" (
    echo Installing Python dependencies...
    pip install --upgrade pip
    pip install -r requirements_advanced.txt
    echo Python dependencies installed successfully
) else (
    echo WARNING: requirements_advanced.txt not found
)

:: Check CUDA availability
echo Checking CUDA availability...
python -c "import torch; print('CUDA available:', torch.cuda.is_available())" 2>nul

cd ..

echo.
echo Setting up frontend environment...
mkdir frontend 2>nul
cd frontend

:: Install Node.js dependencies
if exist "package_advanced.json" (
    copy package_advanced.json package.json
    echo Installing Node.js dependencies...
    npm install
    echo Node.js dependencies installed successfully
) else if exist "package.json" (
    echo Installing Node.js dependencies...
    npm install
    echo Node.js dependencies installed successfully
) else (
    echo WARNING: package.json not found
)

cd ..

echo.
echo Creating startup scripts...

:: Create backend startup script
echo @echo off > start_backend.bat
echo echo Starting AI Image Studio Backend... >> start_backend.bat
echo cd backend >> start_backend.bat
echo call venv\Scripts\activate.bat >> start_backend.bat
echo echo Starting Celery worker in background... >> start_backend.bat
echo start /B celery -A main_advanced.celery worker --loglevel=info --pool=solo >> start_backend.bat
echo echo Starting FastAPI server... >> start_backend.bat
echo python main_advanced.py >> start_backend.bat

:: Create frontend startup script
echo @echo off > start_frontend.bat
echo echo Starting AI Image Studio Frontend... >> start_frontend.bat
echo cd frontend >> start_frontend.bat
echo npm run dev >> start_frontend.bat

:: Create combined startup script
echo @echo off > start_all.bat
echo echo Starting AI Image Studio - Complete Stack... >> start_all.bat
echo echo. >> start_all.bat
echo echo Starting backend... >> start_all.bat
echo start "Backend" start_backend.bat >> start_all.bat
echo timeout /t 5 >> start_all.bat
echo echo Starting frontend... >> start_all.bat
echo start "Frontend" start_frontend.bat >> start_all.bat
echo echo. >> start_all.bat
echo echo AI Image Studio is starting! >> start_all.bat
echo echo Frontend: http://localhost:3000 >> start_all.bat
echo echo Backend API: http://localhost:8000 >> start_all.bat
echo echo API Docs: http://localhost:8000/docs >> start_all.bat
echo pause >> start_all.bat

echo.
echo Setup completed successfully!
echo.
echo Next Steps:
echo 1. Start the complete application: start_all.bat
echo 2. Or start services individually:
echo    Backend:  start_backend.bat
echo    Frontend: start_frontend.bat
echo.
echo Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Documentation: http://localhost:8000/docs
echo.
echo NOTE: You may need to install Redis separately or use Docker
echo For Docker Redis: docker run -d -p 6379:6379 redis:alpine
echo.
echo AI Image Studio - Advanced Edition is ready!
pause
@echo off
echo ========================================
echo   AI Image Studio - Windows Setup
echo ========================================
echo.
echo Installing all dependencies...
echo.

REM Navigate to project root
cd /d "c:\Users\SAM\Desktop\ai image generator\ai-image-studio"

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install

REM Navigate to backend directory
echo.
echo Installing backend dependencies...
cd ..\backend

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Activating virtual environment and installing packages...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Navigate back to project root
cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the development servers:
echo.
echo Frontend (Next.js):
echo   cd frontend
echo   npm run dev
echo.
echo Backend (FastAPI):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python main.py
echo.
echo Your superior AI Image Studio will be running at:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000
echo.
echo Ready to outperform Pixelcut.ai!
echo.
pause
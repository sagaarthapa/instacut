@echo off
REM AI Image Studio - Superior Installation Script for Windows
REM Better setup experience than any competitor

echo 🚀 Setting up AI Image Studio - The Superior Pixelcut Alternative
echo ==================================================================

REM Check system requirements
echo 📋 Checking system requirements...

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

for /f "tokens=2 delims= " %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% found

REM Check GPU (optional but recommended)
where nvidia-smi >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ NVIDIA GPU detected - AI processing will be accelerated
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits
) else (
    echo ⚠️  No GPU detected - AI processing will use CPU ^(slower but functional^)
)

echo.
echo 🏗️  Installing AI Image Studio...

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

if %errorlevel% equ 0 (
    echo ✅ Frontend dependencies installed successfully
) else (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd ..\backend

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install requirements
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo ✅ Backend dependencies installed successfully
) else (
    echo ❌ Backend installation failed
    pause
    exit /b 1
)

REM Setup environment files
echo ⚙️  Setting up environment configuration...

cd ..

REM Frontend environment
(
echo # Frontend Environment Variables
echo NEXT_PUBLIC_API_URL=http://localhost:8000
echo NEXT_PUBLIC_APP_NAME=AI Image Studio
echo NEXT_PUBLIC_APP_VERSION=1.0.0
echo NEXT_PUBLIC_ENABLE_ANALYTICS=false
) > frontend\.env.local

REM Backend environment
(
echo # Backend Environment Variables
echo DATABASE_URL=sqlite:///./ai_studio.db
echo SECRET_KEY=your-super-secret-key-change-this-in-production
echo ALLOWED_HOSTS=["http://localhost:3000", "http://127.0.0.1:3000"]
echo DEBUG=true
echo.
echo # AI Service Configuration
echo OPENAI_API_KEY=your-openai-api-key-here
echo STABILITY_AI_KEY=your-stability-ai-key-here
echo REMOVE_BG_API_KEY=your-remove-bg-key-here
echo.
echo # File Storage
echo UPLOAD_FOLDER=uploads
echo MAX_FILE_SIZE=10485760
echo SUPPORTED_FORMATS=["jpg", "jpeg", "png", "webp"]
echo.
echo # Performance Settings
echo ENABLE_GPU=true
echo MAX_CONCURRENT_JOBS=4
echo CACHE_RESULTS=true
) > backend\.env

echo ✅ Environment files created

REM Create necessary directories
echo 📁 Creating directories...
mkdir backend\uploads 2>nul
mkdir backend\processed 2>nul
mkdir backend\temp 2>nul
mkdir frontend\public\uploads 2>nul

echo ✅ Directories created

echo.
echo 🎉 Installation Complete!
echo ========================
echo.
echo 🚀 Quick Start:
echo.
echo 1. Start the backend ^(in one terminal^):
echo    cd backend
echo    venv\Scripts\activate.bat
echo    python main.py
echo.
echo 2. Start the frontend ^(in another terminal^):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open your browser:
echo    Frontend: http://localhost:3000
echo    API Docs: http://localhost:8000/api/docs
echo.
echo 💡 Pro Tips:
echo    • Add your API keys to backend\.env for commercial AI services
echo    • Use a GPU for 10x faster AI processing
echo    • Check the admin panel at /admin for configuration
echo.
echo 📚 Documentation: README.md
echo.
echo 🎯 Ready to create something amazing that beats Pixelcut? Let's go!
echo.
pause
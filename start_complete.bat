@echo off
echo 🚀 Starting AI Image Studio - Advanced Edition
echo ============================================

echo.
echo 📡 Starting Backend Server...
start "AI Studio Backend" /D "C:\Users\SAM\Desktop\ai image generator\ai-image-studio\backend" cmd /k "venv\Scripts\activate.bat && python main_advanced_noredis.py"

timeout /t 8 /nobreak > nul

echo.
echo 🎨 Starting Frontend Server...
start "AI Studio Frontend" /D "C:\Users\SAM\Desktop\ai image generator\ai-image-studio\frontend" cmd /k "npm run dev"

echo.
echo ✅ AI Image Studio is starting!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to open the application...
pause > nul

start http://localhost:3000
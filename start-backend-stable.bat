@echo off
echo Starting AI Image Studio Backend (Production Mode)...
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
echo Starting server without reload to prevent interruptions...
python -m uvicorn main:app --port 8000 --timeout-keep-alive 600
pause
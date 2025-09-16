@echo off
echo Starting AI Image Studio Backend (Stable - No Reload)...

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
pip install -r requirements.txt

REM Start the server with extended timeouts and no reload for stability
uvicorn main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 600 --timeout-graceful-shutdown 600

pause
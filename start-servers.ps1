# AI Image Studio Server Starter
Write-Host "🚀 Starting AI Image Studio servers..." -ForegroundColor Green

# Function to kill processes on a specific port
function Kill-ProcessOnPort {
    param([int]$Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Killing processes on port $Port..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            try {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "Killed process ID: $($_.OwningProcess)" -ForegroundColor Red
            } catch {
                # Process already terminated or access denied
            }
        }
    }
}

# Kill existing processes on our ports
Kill-ProcessOnPort 3000
Kill-ProcessOnPort 8000

Write-Host "🐍 Starting backend server on port 8000..." -ForegroundColor Blue
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'backend'; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --port 8000 --timeout-keep-alive 300"

Start-Sleep 5

Write-Host "⚛️ Starting frontend server on port 3000..." -ForegroundColor Blue  
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Servers are starting with improved configuration!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 New features:" -ForegroundColor Yellow
Write-Host "   • Real-ESRGAN upscaling installed ✅" -ForegroundColor White
Write-Host "   • Extended timeouts (4min backend, 2min frontend) ✅" -ForegroundColor White
Write-Host "   • Improved error handling ✅" -ForegroundColor White
Write-Host "   • Better tile processing for large images ✅" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
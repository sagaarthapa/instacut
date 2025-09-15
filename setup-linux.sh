#!/bin/bash

echo "========================================"
echo "   AI Image Studio - Linux/Mac Setup"
echo "========================================"
echo ""
echo "Installing all dependencies..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Navigate to backend directory
echo ""
echo "Installing backend dependencies..."
cd ../backend

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ from your package manager"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment and installing packages..."
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# Navigate back to project root
cd ..

echo ""
echo "========================================"
echo "   Setup Complete!"
echo "========================================"
echo ""
echo "To start the development servers:"
echo ""
echo "Frontend (Next.js):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Backend (FastAPI):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "Your superior AI Image Studio will be running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""
echo "Ready to outperform Pixelcut.ai!"
echo ""
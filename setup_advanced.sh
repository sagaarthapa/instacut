#!/bin/bash

# AI Image Studio - Advanced Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 AI Image Studio - Advanced Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows (Git Bash/WSL)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    print_warning "Detected Windows environment"
    WINDOWS=true
else
    WINDOWS=false
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Python
if command_exists python; then
    PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
    print_status "Python version: $PYTHON_VERSION"
else
    print_error "Python not found. Please install Python 3.9 or higher."
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check if Redis is available
if command_exists redis-server; then
    print_status "Redis server found"
    REDIS_AVAILABLE=true
elif command_exists docker; then
    print_status "Docker found - will use Docker for Redis"
    REDIS_AVAILABLE=true
    REDIS_DOCKER=true
else
    print_warning "Redis not found. Please install Redis or Docker."
    REDIS_AVAILABLE=false
fi

echo ""
print_status "Setting up backend environment..."

# Create backend directory if it doesn't exist
mkdir -p backend
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
if [ "$WINDOWS" = true ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

print_status "Activated virtual environment"

# Install Python packages
if [ -f "requirements_advanced.txt" ]; then
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements_advanced.txt
    print_status "Python dependencies installed successfully"
else
    print_warning "requirements_advanced.txt not found. Skipping Python package installation."
fi

# Check CUDA availability
print_status "Checking CUDA availability..."
python -c "
import torch
if torch.cuda.is_available():
    print('✓ CUDA is available')
    print(f'✓ GPU: {torch.cuda.get_device_name(0)}')
    print(f'✓ CUDA Version: {torch.version.cuda}')
else:
    print('⚠ CUDA not available - using CPU (will be slower)')
" 2>/dev/null || print_warning "Could not check CUDA availability"

cd ..

echo ""
print_status "Setting up frontend environment..."

# Create frontend directory if it doesn't exist
mkdir -p frontend
cd frontend

# Install Node.js dependencies
if [ -f "package_advanced.json" ]; then
    # Copy the advanced package.json
    cp package_advanced.json package.json
    print_status "Installing Node.js dependencies..."
    npm install
    print_status "Node.js dependencies installed successfully"
elif [ -f "package.json" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
    print_status "Node.js dependencies installed successfully"
else
    print_warning "package.json not found. Skipping Node.js package installation."
fi

cd ..

echo ""
print_status "Setting up Redis..."

if [ "$REDIS_AVAILABLE" = true ]; then
    if [ "$REDIS_DOCKER" = true ]; then
        print_status "Starting Redis with Docker..."
        docker run -d --name ai-image-redis -p 6379:6379 redis:alpine || print_warning "Redis container may already be running"
    else
        print_status "Redis server is available"
    fi
else
    print_warning "Please install Redis manually or use Docker"
fi

echo ""
print_status "Creating startup scripts..."

# Create backend startup script
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "Starting AI Image Studio Backend..."

# Activate virtual environment
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source backend/venv/Scripts/activate
else
    source backend/venv/bin/activate
fi

cd backend

echo "Starting Celery worker in background..."
celery -A main_advanced.celery worker --loglevel=info --pool=solo &
CELERY_PID=$!

echo "Starting FastAPI server..."
python main_advanced.py

# Cleanup on exit
trap "kill $CELERY_PID" EXIT
EOF

# Create frontend startup script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "Starting AI Image Studio Frontend..."
cd frontend
npm run dev
EOF

# Create combined startup script
cat > start_all.sh << 'EOF'
#!/bin/bash
echo "Starting AI Image Studio - Complete Stack..."

# Start Redis if using Docker
if command -v docker >/dev/null 2>&1; then
    echo "Starting Redis..."
    docker start ai-image-redis 2>/dev/null || docker run -d --name ai-image-redis -p 6379:6379 redis:alpine
fi

# Start backend in background
echo "Starting backend..."
./start_backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
./start_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "🚀 AI Image Studio is starting!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interruption
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

# Make scripts executable
chmod +x start_backend.sh
chmod +x start_frontend.sh
chmod +x start_all.sh

echo ""
print_status "Setup completed successfully!"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Start the complete application:"
echo "   ./start_all.sh"
echo ""
echo "2. Or start services individually:"
echo "   Backend:  ./start_backend.sh"
echo "   Frontend: ./start_frontend.sh"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "   See README_ADVANCED.md for detailed information"
echo ""
echo -e "${GREEN}🎉 AI Image Studio - Advanced Edition is ready!${NC}"
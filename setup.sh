#!/bin/bash

# AI Image Studio - Superior Installation Script
# Better setup experience than any competitor

echo "🚀 Setting up AI Image Studio - The Superior Pixelcut Alternative"
echo "=================================================================="

# Check system requirements
echo "📋 Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION found. Please upgrade to Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "✅ Python $PYTHON_VERSION found"

# Check GPU (optional but recommended)
if command -v nvidia-smi &> /dev/null; then
    echo "✅ NVIDIA GPU detected - AI processing will be accelerated"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits
else
    echo "⚠️  No GPU detected - AI processing will use CPU (slower but functional)"
fi

echo ""
echo "🏗️  Installing AI Image Studio..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Frontend installation failed"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Backend installation failed"
    exit 1
fi

# Setup environment files
echo "⚙️  Setting up environment configuration..."

cd ..

# Frontend environment
cat > frontend/.env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AI Image Studio
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF

# Backend environment
cat > backend/.env << EOF
# Backend Environment Variables
DATABASE_URL=sqlite:///./ai_studio.db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_HOSTS=["http://localhost:3000", "http://127.0.0.1:3000"]
DEBUG=true

# AI Service Configuration
OPENAI_API_KEY=your-openai-api-key-here
STABILITY_AI_KEY=your-stability-ai-key-here
REMOVE_BG_API_KEY=your-remove-bg-key-here

# File Storage
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=10485760
SUPPORTED_FORMATS=["jpg", "jpeg", "png", "webp"]

# Performance Settings
ENABLE_GPU=true
MAX_CONCURRENT_JOBS=4
CACHE_RESULTS=true
EOF

echo "✅ Environment files created"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/processed  
mkdir -p backend/temp
mkdir -p frontend/public/uploads

echo "✅ Directories created"

# Download AI models (optional)
echo "🤖 Setting up AI models..."
echo "Note: This will download several GB of AI models for optimal performance"
echo "You can skip this and models will be downloaded on first use"

read -p "Download AI models now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    source venv/bin/activate
    python -c "
import rembg
# Download default models
rembg.new_session('u2net')
rembg.new_session('birefnet')
print('✅ Background removal models downloaded')

# Note: Real-ESRGAN models are downloaded automatically on first use
print('✅ AI models setup completed')
"
    cd ..
else
    echo "⏩ Skipping model download - models will be downloaded on first use"
fi

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "🚀 Quick Start:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python main.py"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/api/docs"
echo ""
echo "💡 Pro Tips:"
echo "   • Add your API keys to backend/.env for commercial AI services"
echo "   • Use a GPU for 10x faster AI processing"
echo "   • Check the admin panel at /admin for configuration"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: https://github.com/your-repo/issues"
echo ""
echo "🎯 Ready to create something amazing that beats Pixelcut? Let's go!"
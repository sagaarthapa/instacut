# AI Image Studio - Advanced Edition

A state-of-the-art AI image enhancement platform built with Real-ESRGAN, FastAPI, and Next.js 14. This is the most advanced version featuring enterprise-grade architecture, real-time processing updates, and comprehensive AI model integration.

## 🌟 Key Features

### Advanced AI Processing
- **Real-ESRGAN Models**: x2plus, x4plus, anime_6B, general_x4v3
- **GFPGAN Face Enhancement**: Professional portrait restoration
- **Adaptive Processing**: Intelligent tile-based processing for large images
- **Multiple Enhancement Modes**: Tailored for different image types

### Modern Architecture
- **Next.js 14**: App Router with Server Components and Partial Prerendering (PPR)
- **FastAPI Backend**: High-performance async API with WebSocket support
- **Real-time Updates**: WebSocket-based progress tracking
- **Redis Queue**: Background task processing with Celery
- **Advanced Caching**: Multi-layer caching for optimal performance

### Professional UI/UX
- **Advanced File Upload**: Drag & drop with preview and validation
- **Real-time Processing**: Live progress updates with WebSocket
- **Responsive Design**: Mobile-first responsive layout
- **Modern Components**: Radix UI primitives with Tailwind CSS
- **Smooth Animations**: Framer Motion transitions

### Enterprise Features
- **Monitoring & Analytics**: Comprehensive processing metrics
- **Error Handling**: Robust error recovery and user feedback
- **Performance Optimization**: Image compression and efficient processing
- **Scalability**: Queue-based architecture for high load

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ with CUDA support (for GPU acceleration)
- Node.js 18+ and npm/yarn
- Redis server (for queue management)

### Backend Setup

1. **Install Python Dependencies**
```bash
cd ai-image-studio/backend
pip install -r requirements_advanced.txt
```

2. **Download AI Models**
```bash
# Models will be automatically downloaded on first use
# Or manually download to ~/.cache/realesrgan/
```

3. **Start Redis Server**
```bash
# On Windows with WSL or Docker
docker run -d -p 6379:6379 redis:alpine

# On Linux/Mac
redis-server
```

4. **Start Celery Worker**
```bash
celery -A main_advanced.celery worker --loglevel=info --pool=solo
```

5. **Start FastAPI Backend**
```bash
python main_advanced.py
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd ai-image-studio/frontend
npm install
# or
yarn install
```

2. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

3. **Open Application**
```
http://localhost:3000
```

## 🏗️ Architecture Overview

### Backend Architecture
```
FastAPI Application
├── Advanced AI Processor
│   ├── Real-ESRGAN Integration
│   ├── GFPGAN Face Enhancement
│   ├── Tile Processing Engine
│   └── Model Management
├── WebSocket Manager
│   ├── Real-time Updates
│   ├── Progress Tracking
│   └── Error Reporting
├── Redis Queue System
│   ├── Background Processing
│   ├── Task Management
│   └── Result Caching
└── API Endpoints
    ├── Enhancement API
    ├── Health Checks
    ├── Statistics
    └── Model Management
```

### Frontend Architecture
```
Next.js 14 Application
├── App Router
│   ├── Server Components
│   ├── Client Components
│   └── API Routes
├── Advanced Components
│   ├── File Upload System
│   ├── Processing Interface
│   ├── Real-time Updates
│   └── Results Preview
├── State Management
│   ├── React Hooks
│   ├── WebSocket Integration
│   └── Error Handling
└── UI/UX Framework
    ├── Tailwind CSS
    ├── Radix UI
    ├── Framer Motion
    └── React Hot Toast
```

## 🔧 Configuration

### Backend Configuration (`main_advanced.py`)
```python
# AI Processing Settings
TILE_SIZE = 512  # Tile size for large images
TILE_PADDING = 32  # Padding for seamless tiles
MAX_WORKERS = 4  # Parallel processing workers
CACHE_TTL = 3600  # Result cache duration

# Model Settings
MODELS_PATH = "~/.cache/realesrgan"
DEFAULT_MODEL = "x4plus"
FACE_ENHANCE_DEFAULT = True
```

### Frontend Configuration (`next.config_advanced.js`)
```javascript
// Next.js Configuration
experimental: {
  ppr: true,  // Partial Prerendering
  serverComponentsExternalPackages: []
},
images: {
  domains: ['localhost', 'your-domain.com'],
  formats: ['image/webp', 'image/avif']
}
```

## 📊 Performance Benchmarks

### Processing Performance
- **Small Images** (< 1MP): ~2-5 seconds
- **Medium Images** (1-4MP): ~5-15 seconds  
- **Large Images** (4-16MP): ~15-45 seconds
- **Very Large Images** (> 16MP): Tile-based processing

### System Requirements
- **GPU**: NVIDIA GTX 1060+ (6GB VRAM) recommended
- **CPU**: 4+ cores for parallel processing
- **RAM**: 8GB+ (16GB recommended for large images)
- **Storage**: 5GB+ for models and cache

## 🔬 AI Models Explained

### Real-ESRGAN x2plus
- **Scale**: 2x upscaling
- **Best For**: Quick enhancement, web images
- **Model Size**: ~67MB
- **Processing Time**: Fastest

### Real-ESRGAN x4plus  
- **Scale**: 4x upscaling
- **Best For**: General purpose, photos
- **Model Size**: ~67MB
- **Processing Time**: Moderate

### Real-ESRGAN anime_6B
- **Scale**: 4x upscaling
- **Best For**: Anime, illustrations, artwork
- **Model Size**: ~17MB
- **Processing Time**: Fast

### General x4v3
- **Scale**: 4x upscaling
- **Best For**: Mixed content, general use
- **Model Size**: ~67MB
- **Processing Time**: Moderate

### GFPGAN Face Enhancement
- **Purpose**: Face restoration and enhancement
- **Best For**: Portraits, faces, people
- **Model Size**: ~348MB
- **Processing Time**: Additional ~2-3 seconds

## 🛠️ Advanced Features

### Real-time WebSocket Updates
```javascript
// WebSocket connection for live progress
const ws = new WebSocket(`ws://localhost:8000/ws/${taskId}`)
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  updateProgress(data.progress)
  updateStatus(data.status)
}
```

### Intelligent Tile Processing
```python
# Automatic tile processing for large images
if image.size[0] * image.size[1] > MAX_PIXELS:
    result = process_with_tiles(image, model, tile_size=512)
else:
    result = process_direct(image, model)
```

### Advanced Caching System
```python
# Multi-layer caching strategy
@lru_cache(maxsize=128)
def get_model(model_name: str):
    return load_realesrgan_model(model_name)

# Redis result caching
redis_cache.setex(f"result:{task_id}", 3600, processed_image)
```

## 📈 Monitoring & Analytics

### Processing Metrics
- Total images processed
- Average processing time
- Success rate
- Model usage statistics
- Error tracking

### Performance Monitoring
- GPU utilization
- Memory usage  
- Queue length
- WebSocket connections
- API response times

## 🔒 Security Features

- Input validation and sanitization
- File type verification
- Size limits and resource protection
- Rate limiting (planned)
- CSRF protection
- Secure headers

## 🐛 Troubleshooting

### Common Issues

**GPU Not Detected**
```bash
# Check CUDA installation
python -c "import torch; print(torch.cuda.is_available())"
```

**Models Not Downloading**
```bash
# Manual model download
mkdir -p ~/.cache/realesrgan
# Download models from GitHub releases
```

**WebSocket Connection Failed**
- Check if backend is running on port 8000
- Verify Redis server is accessible
- Check firewall settings

**Processing Stuck**
- Restart Celery worker
- Clear Redis queue
- Check GPU memory

## 📝 Development

### Adding New Models
1. Add model configuration in `main_advanced.py`
2. Update model download logic
3. Add UI options in frontend
4. Test with various image types

### Custom Enhancement Pipeline
```python
# Extend the AdvancedAIProcessor class
class CustomProcessor(AdvancedAIProcessor):
    def custom_enhance(self, image, **kwargs):
        # Your custom processing logic
        return enhanced_image
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Real-ESRGAN**: Xinntao for the amazing super-resolution models
- **GFPGAN**: Xinntao for face enhancement technology  
- **FastAPI**: Sebastian Ramirez for the excellent API framework
- **Next.js**: Vercel team for the React framework
- **Open Source Community**: For all the amazing libraries and tools

## 🔗 Links

- [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN)
- [GFPGAN GitHub](https://github.com/TencentARC/GFPGAN)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**AI Image Studio v2.0** - The most advanced AI image enhancement platform available. Built with modern architecture, enterprise features, and comprehensive AI model integration.
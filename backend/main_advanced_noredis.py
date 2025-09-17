"""
AI Image Studio - Advanced Backend (No Redis Version)
A production-ready FastAPI backend for AI image enhancement with Real-ESRGAN and GFPGAN.
"""

import os
import uuid
import asyncio
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path
import shutil

import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
import aiofiles

# AI Processing imports
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet
from gfpgan import GFPGANer
import cv2
import numpy as np
from PIL import Image
import torch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    UPLOAD_DIR = Path("uploads")
    PROCESSED_DIR = Path("processed")
    MODELS_DIR = Path("weights")
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".webp", ".tiff"}
    
    # AI Model Settings
    TILE_SIZE = 512
    TILE_PADDING = 32
    DEFAULT_MODEL = "x4plus"
    FACE_ENHANCE_DEFAULT = True

# Ensure directories exist
for directory in [Config.UPLOAD_DIR, Config.PROCESSED_DIR, Config.MODELS_DIR]:
    directory.mkdir(exist_ok=True)

# Pydantic models
class ProcessingRequest(BaseModel):
    enhancement: str = Field(default="x4", description="Enhancement model")
    face_enhance: bool = Field(default=True, description="Enable face enhancement")
    denoise: int = Field(default=1, description="Denoise level 0-3")
    outscale: int = Field(default=4, description="Output scale factor")

class ProcessingResponse(BaseModel):
    task_id: str
    status: str
    original_url: str
    message: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    models_loaded: Dict[str, bool]
    gpu_available: bool

# Advanced AI Processor
class AdvancedAIProcessor:
    def __init__(self):
        self.models = {}
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.gfpgan = None
        logger.info(f"🔧 Initialized AI Processor with device: {self.device}")
        
    def get_model(self, model_name: str) -> RealESRGANer:
        """Load and cache Real-ESRGAN model"""
        if model_name not in self.models:
            logger.info(f"📥 Loading model: {model_name}")
            
            # Model configurations
            model_configs = {
                'x2': {
                    'model_name': 'RealESRGAN_x2plus',
                    'model_path': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
                    'scale': 2
                },
                'x4': {
                    'model_name': 'RealESRGAN_x4plus',
                    'model_path': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
                    'scale': 4
                },
                'anime': {
                    'model_name': 'RealESRGAN_x4plus_anime_6B',
                    'model_path': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth',
                    'scale': 4
                },
                'general': {
                    'model_name': 'realesr-general-x4v3',
                    'model_path': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth',
                    'scale': 4
                }
            }
            
            config = model_configs.get(model_name, model_configs['x4'])
            
            # Create RRDBNet model
            if 'anime' in model_name:
                model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=config['scale'])
            else:
                model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=config['scale'])
            
            # Create upsampler
            self.models[model_name] = RealESRGANer(
                scale=config['scale'],
                model_path=config['model_path'],
                model=model,
                tile=Config.TILE_SIZE,
                tile_pad=Config.TILE_PADDING,
                pre_pad=0,
                half=True if self.device == 'cuda' else False,
                device=self.device
            )
            
            logger.info(f"✅ Model {model_name} loaded successfully")
        
        return self.models[model_name]
    
    def get_gfpgan(self) -> GFPGANer:
        """Load and cache GFPGAN model for face enhancement"""
        if self.gfpgan is None:
            logger.info("📥 Loading GFPGAN for face enhancement")
            self.gfpgan = GFPGANer(
                model_path='https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth',
                upscale=4,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=None,
                device=self.device
            )
            logger.info("✅ GFPGAN loaded successfully")
        
        return self.gfpgan
    
    async def process_image(
        self,
        input_path: Path,
        output_path: Path,
        enhancement: str = "x4",
        face_enhance: bool = True,
        denoise: int = 1,
        outscale: int = 4,
        progress_callback=None
    ) -> Dict[str, Any]:
        """Process image with Real-ESRGAN and optionally GFPGAN"""
        start_time = datetime.now()
        
        try:
            # Load image
            logger.info(f"📸 Processing image: {input_path}")
            image = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
            original_height, original_width = image.shape[:2]
            
            if progress_callback:
                await progress_callback(10, "Image loaded, starting enhancement...")
            
            # Get Real-ESRGAN model
            upsampler = self.get_model(enhancement)
            
            if progress_callback:
                await progress_callback(30, "Model loaded, enhancing image...")
            
            # Process with Real-ESRGAN
            enhanced_image, _ = upsampler.enhance(image, outscale=outscale)
            
            if progress_callback:
                await progress_callback(70, "Enhancement complete, applying face restoration...")
            
            # Apply face enhancement if requested
            if face_enhance:
                try:
                    gfpgan = self.get_gfpgan()
                    _, _, enhanced_image = gfpgan.enhance(
                        enhanced_image, 
                        has_aligned=False, 
                        only_center_face=False, 
                        paste_back=True
                    )
                    logger.info("✨ Face enhancement applied")
                except Exception as e:
                    logger.warning(f"Face enhancement failed: {e}")
            
            if progress_callback:
                await progress_callback(90, "Saving enhanced image...")
            
            # Save result
            cv2.imwrite(str(output_path), enhanced_image)
            
            # Calculate metrics
            processing_time = (datetime.now() - start_time).total_seconds()
            enhanced_height, enhanced_width = enhanced_image.shape[:2]
            
            # Get file size
            file_size = output_path.stat().st_size / (1024 * 1024)  # MB
            
            result = {
                "status": "completed",
                "processing_time": round(processing_time, 2),
                "original_size": f"{original_width}x{original_height}",
                "enhanced_size": f"{enhanced_width}x{enhanced_height}",
                "file_size_mb": round(file_size, 2),
                "enhancement_model": enhancement,
                "face_enhance_used": face_enhance,
                "output_path": str(output_path)
            }
            
            if progress_callback:
                await progress_callback(100, "Processing complete!")
            
            logger.info(f"✅ Image processed successfully in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"❌ Processing failed: {e}")
            if progress_callback:
                await progress_callback(0, f"Error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Initialize processor
processor = AdvancedAIProcessor()

# FastAPI app
app = FastAPI(
    title="AI Image Studio - Advanced Edition",
    description="Enterprise-grade AI image enhancement with Real-ESRGAN and GFPGAN",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/uploads", StaticFiles(directory=Config.UPLOAD_DIR), name="uploads")
app.mount("/processed", StaticFiles(directory=Config.PROCESSED_DIR), name="processed")

# In-memory storage for task tracking
tasks: Dict[str, Dict[str, Any]] = {}
connections: Dict[str, WebSocket] = {}

# Utility functions
def generate_task_id() -> str:
    """Generate unique task ID"""
    return str(uuid.uuid4())

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file"""
    if file.size > Config.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {Config.MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in Config.SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format. Supported: {', '.join(Config.SUPPORTED_FORMATS)}"
        )

# Background processing function
async def background_process_image(
    task_id: str,
    input_path: Path,
    output_path: Path,
    config: ProcessingRequest
):
    """Background image processing with WebSocket updates"""
    async def progress_callback(progress: int, message: str):
        # Update task status
        if task_id in tasks:
            tasks[task_id].update({
                "progress": progress,
                "message": message,
                "updated_at": datetime.now().isoformat()
            })
        
        # Send WebSocket update
        if task_id in connections:
            try:
                await connections[task_id].send_json({
                    "task_id": task_id,
                    "progress": progress,
                    "message": message,
                    "status": "processing" if progress < 100 else "completed"
                })
            except:
                # Remove disconnected client
                if task_id in connections:
                    del connections[task_id]
    
    try:
        # Process image
        result = await processor.process_image(
            input_path=input_path,
            output_path=output_path,
            enhancement=config.enhancement,
            face_enhance=config.face_enhance,
            denoise=config.denoise,
            outscale=config.outscale,
            progress_callback=progress_callback
        )
        
        # Update task with final result
        if task_id in tasks:
            tasks[task_id].update({
                "status": "completed",
                "progress": 100,
                "result": result,
                "result_url": f"/processed/{output_path.name}",
                "completed_at": datetime.now().isoformat()
            })
        
        # Send final WebSocket update
        if task_id in connections:
            try:
                await connections[task_id].send_json({
                    "task_id": task_id,
                    "status": "completed",
                    "progress": 100,
                    "message": "Processing complete!",
                    "result_url": f"/processed/{output_path.name}",
                    "metrics": result
                })
            except:
                pass
                
    except Exception as e:
        # Update task with error
        if task_id in tasks:
            tasks[task_id].update({
                "status": "error",
                "error": str(e),
                "updated_at": datetime.now().isoformat()
            })
        
        # Send error WebSocket update
        if task_id in connections:
            try:
                await connections[task_id].send_json({
                    "task_id": task_id,
                    "status": "error",
                    "error": str(e)
                })
            except:
                pass

# API Endpoints

@app.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    models_status = {}
    for model_name in ["x2", "x4", "anime", "general"]:
        try:
            processor.get_model(model_name)
            models_status[model_name] = True
        except:
            models_status[model_name] = False
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        models_loaded=models_status,
        gpu_available=torch.cuda.is_available()
    )

@app.get("/health")
async def simple_health():
    """Simple health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/v1/enhance", response_model=ProcessingResponse)
async def enhance_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    enhancement: str = "x4",
    face_enhance: bool = True,
    denoise: int = 1,
    outscale: int = 4
):
    """Upload and process image with AI enhancement"""
    # Validate file
    validate_file(file)
    
    # Generate task ID and paths
    task_id = generate_task_id()
    file_ext = Path(file.filename).suffix
    input_filename = f"{task_id}_input{file_ext}"
    output_filename = f"{task_id}_enhanced.png"
    
    input_path = Config.UPLOAD_DIR / input_filename
    output_path = Config.PROCESSED_DIR / output_filename
    
    try:
        # Save uploaded file
        async with aiofiles.open(input_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create task record
        tasks[task_id] = {
            "task_id": task_id,
            "status": "queued",
            "progress": 0,
            "message": "Task queued for processing",
            "created_at": datetime.now().isoformat(),
            "input_path": str(input_path),
            "output_path": str(output_path),
            "config": {
                "enhancement": enhancement,
                "face_enhance": face_enhance,
                "denoise": denoise,
                "outscale": outscale
            }
        }
        
        # Start background processing
        config = ProcessingRequest(
            enhancement=enhancement,
            face_enhance=face_enhance,
            denoise=denoise,
            outscale=outscale
        )
        
        background_tasks.add_task(
            background_process_image,
            task_id,
            input_path,
            output_path,
            config
        )
        
        logger.info(f"🚀 Started processing task: {task_id}")
        
        return ProcessingResponse(
            task_id=task_id,
            status="queued",
            original_url=f"/uploads/{input_filename}",
            message="Image uploaded and queued for processing"
        )
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/task/{task_id}")
async def get_task_status(task_id: str):
    """Get task status and progress"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return tasks[task_id]

@app.websocket("/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    """WebSocket endpoint for real-time progress updates"""
    await websocket.accept()
    connections[task_id] = websocket
    
    try:
        # Send current task status if available
        if task_id in tasks:
            await websocket.send_json({
                "task_id": task_id,
                "status": tasks[task_id].get("status", "unknown"),
                "progress": tasks[task_id].get("progress", 0),
                "message": tasks[task_id].get("message", "")
            })
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
    except Exception as e:
        logger.info(f"WebSocket disconnected for task {task_id}: {e}")
    finally:
        if task_id in connections:
            del connections[task_id]

@app.get("/api/v1/stats")
async def get_stats():
    """Get processing statistics"""
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks.values() if t.get("status") == "completed"])
    
    # Calculate average processing time
    completed_with_time = [
        t for t in tasks.values() 
        if t.get("status") == "completed" and t.get("result", {}).get("processing_time")
    ]
    
    avg_time = 0
    if completed_with_time:
        avg_time = sum(t["result"]["processing_time"] for t in completed_with_time) / len(completed_with_time)
    
    success_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 100
    
    return {
        "totalProcessed": completed_tasks,
        "averageTime": round(avg_time, 1),
        "successRate": round(success_rate, 1)
    }

@app.get("/api/v1/models")
async def get_available_models():
    """Get available AI models"""
    return {
        "models": {
            "x2": {
                "name": "Real-ESRGAN x2plus",
                "scale": 2,
                "description": "2x upscaling, fastest processing"
            },
            "x4": {
                "name": "Real-ESRGAN x4plus", 
                "scale": 4,
                "description": "4x upscaling, general purpose"
            },
            "anime": {
                "name": "Real-ESRGAN anime",
                "scale": 4, 
                "description": "4x upscaling, optimized for anime/artwork"
            },
            "general": {
                "name": "General x4v3",
                "scale": 4,
                "description": "4x upscaling, best general quality"
            }
        },
        "face_enhance": {
            "name": "GFPGAN",
            "description": "Face restoration and enhancement"
        }
    }

# Development server
if __name__ == "__main__":
    print("🚀 Starting AI Image Studio - Advanced Backend")
    print("📍 Health: http://localhost:8000/health")
    print("📍 Docs: http://localhost:8000/docs") 
    print("📍 API: http://localhost:8000/api/v1/enhance")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
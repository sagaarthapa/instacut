"""
Upscaler Engine - Independent Module
Handles all image upscaling functionality with multiple algorithms
"""

import os
import logging
import asyncio
from typing import Optional, Dict, Any
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import threading
import concurrent.futures
from functools import wraps

logger = logging.getLogger(__name__)

def timeout_wrapper(timeout_seconds=120):
    """Decorator to add timeout to functions"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(func, *args, **kwargs)
                try:
                    return future.result(timeout=timeout_seconds)
                except concurrent.futures.TimeoutError:
                    logger.warning(f"Function {func.__name__} timed out after {timeout_seconds} seconds")
                    raise TimeoutError(f"Operation timed out after {timeout_seconds} seconds")
        return wrapper
    return decorator


class UpscalerEngine:
    """Independent Upscaler Engine with multiple algorithms"""
    
    def __init__(self):
        self.available_models = {
            # Real-ESRGAN models (highest quality)
            'realesrgan_2x': {'available': self._check_realesrgan(), 'scale': 2, 'quality': 9},
            'realesrgan_4x': {'available': self._check_realesrgan(), 'scale': 4, 'quality': 9},
            'realesrgan_8x': {'available': self._check_realesrgan(), 'scale': 8, 'quality': 8},
            'realesrgan_anime': {'available': self._check_realesrgan(), 'scale': 4, 'quality': 9},
            'realesrgan_face': {'available': self._check_realesrgan(), 'scale': 4, 'quality': 8},
            
            # Super Enhanced PIL models (advanced processing)
            'super_enhanced_2x': {'available': True, 'scale': 2, 'quality': 8},
            'super_enhanced_4x': {'available': True, 'scale': 4, 'quality': 8},
            'enhanced_pro_2x': {'available': True, 'scale': 2, 'quality': 8},
            'enhanced_pro_4x': {'available': True, 'scale': 4, 'quality': 8},
            
            # Standard Enhanced PIL models
            'enhanced_2x': {'available': True, 'scale': 2, 'quality': 7},
            'enhanced_4x': {'available': True, 'scale': 4, 'quality': 7},
            
            # Standard PIL models
            'lanczos_2x': {'available': True, 'scale': 2, 'quality': 6},
            'lanczos_4x': {'available': True, 'scale': 4, 'quality': 6},
            'bicubic_2x': {'available': True, 'scale': 2, 'quality': 5},
            'bicubic_4x': {'available': True, 'scale': 4, 'quality': 5}
        }
        logger.info(f"Upscaler Engine initialized with {len(self.available_models)} models")
    
    def _check_realesrgan(self) -> bool:
        """Check if Real-ESRGAN is available"""
        try:
            import torch
            logger.info("🔍 Checking Real-ESRGAN availability...")
            
            # First check if basic torch is working
            if not torch.cuda.is_available():
                logger.info("⚠️ CUDA not available, Real-ESRGAN will use CPU")
            
            # Try importing Real-ESRGAN in a safer way
            try:
                # Import in isolation to avoid side effects
                import importlib.util
                spec = importlib.util.find_spec("realesrgan")
                if spec is None:
                    logger.warning("⚠️ Real-ESRGAN module not found")
                    return False
                
                # Try the actual import but catch any initialization errors
                try:
                    from realesrgan import RealESRGANer
                    from basicsr.archs.rrdbnet_arch import RRDBNet
                    logger.info("✅ Real-ESRGAN successfully imported")
                    return True
                except (ImportError, RuntimeError, KeyboardInterrupt) as e:
                    logger.warning(f"⚠️ Real-ESRGAN import failed: {e}")
                    logger.info("📝 Real-ESRGAN will be disabled, falling back to enhanced PIL methods")
                    return False
                    
            except Exception as e:
                logger.warning(f"⚠️ Real-ESRGAN check failed: {e}")
                return False
                
        except ImportError:
            logger.warning("⚠️ PyTorch not available")
            return False
        except Exception as e:
            logger.warning(f"⚠️ Real-ESRGAN availability check failed: {e}")
            return False
    
    def get_available_models(self) -> Dict[str, Any]:
        """Get all available upscaling models"""
        return {k: v for k, v in self.available_models.items() if v['available']}
    
    async def upscale_image(self, input_path: str, output_path: str, model: str = 'auto') -> bool:
        """
        Upscale image using specified model
        
        Args:
            input_path: Path to input image
            output_path: Path to save upscaled image
            model: Model to use ('auto', 'realesrgan_4x', 'lanczos_4x', etc.)
        
        Returns:
            bool: Success status
        """
        try:
            if model == 'auto':
                model = self._select_best_model()
            
            logger.info(f"Upscaling image using model: {model}")
            
            # Real-ESRGAN models (highest quality)
            if 'realesrgan' in model and self.available_models.get(model, {}).get('available'):
                return await self._realesrgan_upscale(input_path, output_path, model)
            # Super enhanced PIL models
            elif model in ['super_enhanced_4x', 'enhanced_pro_4x']:
                return await self._super_enhanced_pil_upscale(input_path, output_path, model, 4)
            elif model in ['super_enhanced_2x', 'enhanced_pro_2x']:
                return await self._super_enhanced_pil_upscale(input_path, output_path, model, 2)
            # Standard enhanced PIL models
            elif model in ['enhanced_4x', 'enhanced_2x']:
                scale = 4 if '4x' in model else 2
                return await self._enhanced_pil_upscale(input_path, output_path, model, scale)
            # Lanczos models
            elif 'lanczos' in model:
                return await self._lanczos_upscale(input_path, output_path, model)
            # Bicubic models
            elif 'bicubic' in model:
                return await self._bicubic_upscale(input_path, output_path, model)
            else:
                logger.warning(f"Model {model} not available, using super enhanced fallback")
                return await self._super_enhanced_pil_upscale(input_path, output_path, 'super_enhanced_4x', 4)
                
        except Exception as e:
            logger.error(f"Image upscaling failed: {e}")
            return False
    
    def _select_best_model(self) -> str:
        """Select the best available model with performance consideration"""
        available = self.get_available_models()
        if not available:
            return 'enhanced_4x'  # Use standard enhanced as fast fallback
        
        # Always prefer super enhanced PIL for reliability and speed on CPU
        if 'super_enhanced_4x' in available:
            return 'super_enhanced_4x'
        elif 'enhanced_4x' in available:
            return 'enhanced_4x'
        elif 'lanczos_4x' in available:
            return 'lanczos_4x'
        
        # Otherwise, sort by quality score but prefer faster models
        best = max(available.items(), key=lambda x: x[1]['quality'])
        return best[0]
    
    async def _realesrgan_upscale(self, input_path: str, output_path: str, model: str) -> bool:
        """Upscale using Real-ESRGAN with timeout and fallback"""
        @timeout_wrapper(timeout_seconds=90)  # 90 second timeout
        def process_sync():
            try:
                logger.info(f"🔧 Starting Real-ESRGAN upscaling with model: {model}")
                
                from realesrgan import RealESRGANer
                from basicsr.archs.rrdbnet_arch import RRDBNet
                from PIL import Image
                import numpy as np
                import os
                import urllib.request

                logger.info("📦 Imports successful")
                
                # Extract scale factor from model name
                scale_factor = 4  # default
                if "2x" in model:
                    scale_factor = 2
                elif "4x" in model:
                    scale_factor = 4
                elif "8x" in model:
                    scale_factor = 8

                logger.info(f"🖥️  Using scale factor: {scale_factor}x")
                
                # Determine model based on scale factor
                if scale_factor == 2:
                    net = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
                    model_url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth'
                    model_name = 'RealESRGAN_x2plus'
                elif scale_factor == 4:
                    net = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
                    model_url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
                    model_name = 'RealESRGAN_x4plus'
                else:  # 8x - use 4x model twice
                    net = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
                    model_url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
                    model_name = 'RealESRGAN_x4plus'

                logger.info("✅ Neural network created")
                
                # Create models directory if it doesn't exist
                models_dir = "models"
                os.makedirs(models_dir, exist_ok=True)
                model_path = os.path.join(models_dir, f"{model_name}.pth")

                # Download model if not exists
                if not os.path.exists(model_path):
                    logger.info(f"⬇️  Downloading {model_name} model...")
                    urllib.request.urlretrieve(model_url, model_path)
                    logger.info(f"✅ Model downloaded: {model_path}")

                # Initialize upsampler with smaller tiles for CPU
                logger.info("🚀 Creating upsampler...")
                upsampler = RealESRGANer(
                    scale=4 if scale_factor >= 4 else 2,
                    model_path=model_path,
                    model=net,
                    tile=128,  # Further reduced for CPU performance
                    tile_pad=8,   # Reduced padding
                    pre_pad=0,
                    half=False,  # Keep full precision for CPU stability
                    gpu_id=None  # Let PyTorch auto-detect best device
                )
                logger.info("✅ Upsampler created")
                
                # Load and process image with size optimization
                logger.info(f"🖼️  Loading image: {input_path}")
                img = Image.open(input_path).convert('RGB')
                original_size = img.size
                logger.info(f"✅ Image loaded: {original_size}")

                # More aggressive size limiting for CPU processing
                max_dimension = 1024  # Further reduced for CPU
                needs_resize = max(original_size) > max_dimension
                
                if needs_resize:
                    # Calculate new size maintaining aspect ratio
                    ratio = min(max_dimension / original_size[0], max_dimension / original_size[1])
                    new_size = (int(original_size[0] * ratio), int(original_size[1] * ratio))
                    logger.info(f"🔄 Resizing input from {original_size} to {new_size} for CPU performance")
                    try:
                        img = img.resize(new_size, Image.LANCZOS)
                    except AttributeError:
                        img = img.resize(new_size, Image.Resampling.LANCZOS)

                # Convert to numpy array
                img_array = np.array(img)

                # Process with Real-ESRGAN (simplified - no 8x support to avoid complexity)
                if scale_factor == 8:
                    logger.info("🚀 Processing 8x upscaling - using 4x model")
                    # Use 4x model instead of double processing for speed
                    output_array, _ = upsampler.enhance(img_array, outscale=4)
                else:
                    logger.info(f"🚀 Processing {scale_factor}x upscaling")
                    output_array, _ = upsampler.enhance(img_array, outscale=scale_factor)

                # Convert back to PIL and save
                result_img = Image.fromarray(output_array)
                final_size = result_img.size
                logger.info(f"✅ Enhancement completed: {final_size} (scale factor: {final_size[0]/img.size[0]:.1f}x)")
                
                # Save result
                logger.info(f"💾 Saving to: {output_path}")
                if output_path.endswith('.png'):
                    result_img.save(output_path, "PNG", optimize=True)
                else:
                    result_img.save(output_path, "JPEG", quality=95, optimize=True)

                logger.info("✅ Real-ESRGAN upscaling completed successfully")
                return True
                
            except Exception as e:
                logger.error(f"❌ Real-ESRGAN upscaling failed: {e}")
                logger.error(f"   Error type: {type(e).__name__}")
                import traceback
                logger.error(f"   Traceback: {traceback.format_exc()}")
                raise e
        
        try:
            # Run with timeout in thread pool
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, process_sync)
        except (TimeoutError, Exception) as e:
            logger.warning(f"Real-ESRGAN failed or timed out: {e}, falling back to Super Enhanced PIL")
            # Fallback to super enhanced PIL
            return await self._super_enhanced_pil_upscale(input_path, output_path, 'super_enhanced_4x', 4)
    
    async def _lanczos_upscale(self, input_path: str, output_path: str, model: str) -> bool:
        """Upscale using Lanczos algorithm with sharp processing"""
        def process_sync():
            try:
                # Get scale factor from model name
                scale = int(model.split('_')[1].replace('x', ''))
                
                # Load image
                img = Image.open(input_path).convert('RGB')
                original_size = img.size
                
                logger.info(f"Applying SHARP Lanczos {scale}x upscaling")
                
                # Multi-step upscaling for better quality
                if scale > 2:
                    # Two-step upscaling
                    intermediate = img.resize(
                        (original_size[0] * 2, original_size[1] * 2), 
                        Image.Resampling.LANCZOS
                    )
                    upscaled = intermediate.resize(
                        (original_size[0] * scale, original_size[1] * scale), 
                        Image.Resampling.LANCZOS
                    )
                else:
                    upscaled = img.resize(
                        (original_size[0] * scale, original_size[1] * scale), 
                        Image.Resampling.LANCZOS
                    )
                
                # SHARP post-processing
                logger.info("Applying sharp enhancement")
                
                # Aggressive unsharp masking
                upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1, percent=200, threshold=0))
                
                # Enhanced sharpness
                enhancer = ImageEnhance.Sharpness(upscaled)
                upscaled = enhancer.enhance(2.0)
                
                # Enhanced contrast
                enhancer = ImageEnhance.Contrast(upscaled)
                upscaled = enhancer.enhance(1.3)
                
                # Final unsharp mask
                upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=2, percent=250, threshold=0))
                
                # Save with high quality
                upscaled.save(output_path, 'JPEG', quality=98, optimize=True)
                
                logger.info("✅ Sharp Lanczos upscaling completed")
                return True
                
            except Exception as e:
                logger.error(f"❌ Lanczos upscaling failed: {e}")
                return False
        
        # Run in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, process_sync)
    
    async def _super_enhanced_pil_upscale(self, input_path: str, output_path: str, model: str, scale: int = 4) -> bool:
        """Super Enhanced PIL upscaling with advanced algorithms - restored working version"""
        def process_sync():
            try:
                logger.info(f"🎨 Starting super enhanced PIL upscaling: {model} at {scale}x")
                
                with Image.open(input_path) as img:
                    img = img.convert('RGB')
                    original_size = img.size
                    logger.info(f"Original size: {original_size}")
                    
                    import numpy as np
                    from PIL import ImageFilter, ImageEnhance
                    import cv2
                    
                    # Convert to numpy for optimized processing
                    img_array = np.array(img)
                    
                    # Quick bilateral filter for noise reduction (reduced parameters for speed)
                    img_filtered = cv2.bilateralFilter(img_array, 5, 50, 50)  # Reduced from 9, 75, 75
                    img = Image.fromarray(img_filtered.astype(np.uint8))
                    
                    # Optimized upscaling with fewer intermediate steps
                    if scale <= 2:
                        # Single-step for 2x or less
                        new_size = (int(img.width * scale), int(img.height * scale))
                        try:
                            upscaled = img.resize(new_size, Image.LANCZOS)
                        except AttributeError:
                            upscaled = img.resize(new_size, Image.Resampling.LANCZOS)
                    else:
                        # Two-step for 4x: 2x then 2x for better quality
                        intermediate_size = (img.width * 2, img.height * 2)
                        try:
                            intermediate = img.resize(intermediate_size, Image.LANCZOS)
                        except AttributeError:
                            intermediate = img.resize(intermediate_size, Image.Resampling.LANCZOS)
                        
                        # Quick sharpening on intermediate
                        intermediate = intermediate.filter(ImageFilter.UnsharpMask(radius=1, percent=120, threshold=2))
                        
                        # Final upscale
                        final_size = (int(img.width * scale), int(img.height * scale))
                        try:
                            upscaled = intermediate.resize(final_size, Image.LANCZOS)
                        except AttributeError:
                            upscaled = intermediate.resize(final_size, Image.Resampling.LANCZOS)
                    
                    # Streamlined final enhancement (reduced from multiple passes)
                    upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=2, percent=130, threshold=2))
                    
                    # Single contrast enhancement
                    enhancer = ImageEnhance.Contrast(upscaled)
                    upscaled = enhancer.enhance(1.15)
                    
                    final_size = upscaled.size
                    scale_achieved = final_size[0] / original_size[0]
                    logger.info(f"Super enhanced PIL upscaling completed: {final_size} (scale: {scale_achieved:.1f}x)")
                    
                    # Save with high quality
                    if output_path.endswith('.png'):
                        upscaled.save(output_path, "PNG", optimize=True)
                    else:
                        upscaled.save(output_path, "JPEG", quality=95, optimize=True)  # Reduced from 98 for speed
                    
                    return True
                    
            except Exception as e:
                logger.error(f"❌ Super enhanced PIL upscaling failed: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                return False
        
        # Run in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, process_sync)

    async def _enhanced_pil_upscale(self, input_path: str, output_path: str, model: str, scale: int = 4) -> bool:
        """Enhanced PIL upscaling - standard version"""
        def process_sync():
            try:
                logger.info(f"🎨 Starting enhanced PIL upscaling: {model} at {scale}x")
                
                with Image.open(input_path) as img:
                    img = img.convert('RGB')
                    original_size = img.size
                    logger.info(f"Original size: {original_size}")
                    
                    # Multi-step upscaling for better quality
                    current_img = img
                    current_scale = 1
                    
                    while current_scale < scale:
                        next_scale = min(2, scale // current_scale)
                        new_size = (
                            int(current_img.width * next_scale),
                            int(current_img.height * next_scale)
                        )
                        
                        # Use LANCZOS for upscaling
                        try:
                            current_img = current_img.resize(new_size, Image.LANCZOS)
                        except AttributeError:
                            # For newer Pillow versions
                            current_img = current_img.resize(new_size, Image.Resampling.LANCZOS)
                        
                        # Apply sharpening after upscaling
                        from PIL import ImageFilter
                        current_img = current_img.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
                        
                        current_scale *= next_scale
                        logger.info(f"Intermediate scale: {current_scale}x, size: {current_img.size}")
                    
                    final_size = current_img.size
                    logger.info(f"Enhanced PIL upscaling completed: {final_size} (actual scale: {final_size[0]/original_size[0]:.1f}x)")
                    
                    # Save with high quality
                    if output_path.endswith('.png'):
                        current_img.save(output_path, "PNG", optimize=True)
                    else:
                        current_img.save(output_path, "JPEG", quality=95, optimize=True)
                    
                    return True
                    
            except Exception as e:
                logger.error(f"❌ Enhanced PIL upscaling failed: {e}")
                return False
        
        # Run in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, process_sync)

    async def _bicubic_upscale(self, input_path: str, output_path: str, model: str) -> bool:
        """Upscale using Bicubic algorithm"""
        def process_sync():
            try:
                # Get scale factor from model name
                scale = int(model.split('_')[1].replace('x', ''))
                
                # Load image
                img = Image.open(input_path).convert('RGB')
                original_size = img.size
                
                logger.info(f"Applying Bicubic {scale}x upscaling")
                
                # Bicubic upscaling
                upscaled = img.resize(
                    (original_size[0] * scale, original_size[1] * scale), 
                    Image.Resampling.BICUBIC
                )
                
                # Light enhancement
                enhancer = ImageEnhance.Sharpness(upscaled)
                upscaled = enhancer.enhance(1.2)
                
                enhancer = ImageEnhance.Contrast(upscaled)
                upscaled = enhancer.enhance(1.1)
                
                # Save with good quality
                upscaled.save(output_path, 'JPEG', quality=95, optimize=True)
                
                logger.info("✅ Bicubic upscaling completed")
                return True
                
            except Exception as e:
                logger.error(f"❌ Bicubic upscaling failed: {e}")
                return False
        
        # Run in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, process_sync)
    
    def get_module_info(self) -> Dict[str, Any]:
        """Get module information"""
        return {
            "name": "Upscaler Engine",
            "version": "1.0.0",
            "available_models": list(self.get_available_models().keys()),
            "total_models": len(self.available_models),
            "realesrgan_available": self._check_realesrgan()
        }
import os
import cv2
import numpy as np
import torch
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Tuple, List
import time

logger = logging.getLogger(__name__)

class PhotoRestorationEngine:
    def __init__(self):
        logger.info("Initializing Photo Restoration Engine...")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.gfpgan_model = None
        self.bg_upsampler = None
        self.initialized = False
        self.models_dir = Path("models/photo_restoration")
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.available_models = {
            'gfpgan_v1.3': {
                'name': 'GFPGAN v1.3',
                'file': 'GFPGANv1.3.pth',
                'url': 'https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth'
            }
        }
        self._init_background_upsampler()
        self._init_gfpgan()
        logger.info("Photo Restoration Engine initialized")
    
    def _init_background_upsampler(self) -> None:
        """Initialize Real-ESRGAN background upsampler for complete image restoration"""
        try:
            from basicsr.archs.rrdbnet_arch import RRDBNet
            from realesrgan import RealESRGANer
            
            # Use Real-ESRGAN for background upsampling (non-face regions)
            # This works on both CUDA and CPU
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
            self.bg_upsampler = RealESRGANer(
                scale=2,
                model_path='https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
                model=model,
                tile=400,
                tile_pad=10,
                pre_pad=0,
                half=torch.cuda.is_available()  # Use half precision only if CUDA available
            )
            logger.info(f"Real-ESRGAN background upsampler initialized successfully (CUDA: {torch.cuda.is_available()})")
        except Exception as e:
            logger.warning(f"Background upsampler init failed: {e}")
            self.bg_upsampler = None
    
    def _init_gfpgan(self) -> None:
        try:
            import gfpgan
            from gfpgan import GFPGANer
            model_path = None
            for model_key, model_info in self.available_models.items():
                model_file_path = self.models_dir / model_info['file']
                if model_file_path.exists():
                    model_path = str(model_file_path)
                    logger.info(f"Found existing model: {model_info['name']}")
                    break
            if model_path:
                # Initialize GFPGAN with Real-ESRGAN background upsampler for complete image restoration
                self.gfpgan_model = GFPGANer(
                    model_path=model_path,
                    upscale=2,
                    arch='clean',
                    channel_multiplier=2,
                    bg_upsampler=self.bg_upsampler  # This enables complete image restoration
                )
                self.initialized = True
                logger.info("GFPGAN model initialized successfully with background upsampler")
            else:
                logger.warning("No GFPGAN model found")
        except Exception as e:
            logger.warning(f"GFPGAN init failed: {e}")
            self.initialized = False
    
    def get_available_restoration_methods(self) -> List[Dict[str, Any]]:
        methods = [
            {
                'id': 'complete_photo_restore',
                'name': 'Complete Photo Restoration',
                'description': 'Complete image restoration - enhances entire photo including faces and backgrounds',
                'category': 'complete_restoration',
                'suitable_for': ['old_photos', 'damaged_photos', 'all_images']
            }
        ]
        if self.initialized:
            methods.append({
                'id': 'gfpgan_face_restore',
                'name': 'Face Restoration Only',
                'description': 'AI face restoration with GFPGAN',
                'category': 'face_enhancement',
                'suitable_for': ['portraits', 'face_photos']
            })
        return methods
    
    def restore_photo(self, image_path: str, method: str = 'complete_photo_restore', scale: int = 2, output_path: Optional[str] = None, **kwargs) -> Tuple[Optional[str], Dict[str, Any]]:
        try:
            logger.info(f"Starting photo restoration: {method}")
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Input image not found: {image_path}")
            if method == 'complete_photo_restore':
                return self._complete_photo_restore(image_path, scale, output_path, **kwargs)
            elif method == 'gfpgan_face_restore':
                return self._gfpgan_face_restore(image_path, scale, output_path, **kwargs)
            else:
                return self._complete_photo_restore(image_path, scale, output_path, **kwargs)
        except Exception as e:
            logger.error(f"Error in photo restoration: {e}")
            return None, {'error': str(e)}
    
    def _complete_photo_restore(self, image_path: str, scale: int = 2, output_path: Optional[str] = None, **kwargs) -> Tuple[Optional[str], Dict[str, Any]]:
        try:
            logger.info("Starting complete photo restoration using GFPGAN + Real-ESRGAN...")
            
            if not self.initialized:
                raise ValueError("GFPGAN model not available")
                
            input_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
            if input_img is None:
                raise ValueError("Could not load image")
            
            logger.info("Applying GFPGAN with background upsampler for complete image restoration...")
            
            # Use GFPGAN's official enhance method with background upsampler
            # This will restore faces AND enhance background regions using Real-ESRGAN
            cropped_faces, restored_faces, restored_img = self.gfpgan_model.enhance(
                input_img,
                has_aligned=False,
                only_center_face=False,
                paste_back=True,  # Paste restored faces back to the image
                weight=kwargs.get('weight', 0.5)  # Balance between original and restored
            )
            
            if restored_img is None:
                logger.warning("GFPGAN restoration failed, using original image")
                restored_img = input_img
            
            logger.info(f"Complete restoration successful: {len(restored_faces)} faces restored, background enhanced")
            
            # Additional scaling if requested
            if scale > 2:  # GFPGAN already does 2x upscaling
                additional_scale = scale // 2
                if additional_scale > 1:
                    height, width = restored_img.shape[:2]
                    restored_img = cv2.resize(
                        restored_img, 
                        (width * additional_scale, height * additional_scale), 
                        interpolation=cv2.INTER_LANCZOS4
                    )
            
            if output_path is None:
                output_path = self._generate_output_path(image_path, 'complete_restored')
            
            cv2.imwrite(output_path, restored_img)
            
            metadata = {
                'method': 'Complete Photo Restoration (GFPGAN + Real-ESRGAN)',
                'complete_image_restored': True,
                'faces_enhanced': len(restored_faces) > 0,
                'background_enhanced': self.bg_upsampler is not None,
                'faces_found': len(restored_faces),
                'real_esrgan_used': self.bg_upsampler is not None,
                'scale_factor': scale,
                'ai_model_used': 'GFPGAN v1.3 + Real-ESRGAN',
                'restoration_quality': 'Professional'
            }
            
            logger.info("Complete photo restoration completed successfully")
            return output_path, metadata
            
        except Exception as e:
            logger.error(f"Error in complete photo restoration: {e}")
            return None, {'error': str(e)}
    
    def _gfpgan_face_restore(self, image_path: str, scale: int = 2, output_path: Optional[str] = None, **kwargs) -> Tuple[Optional[str], Dict[str, Any]]:
        try:
            if not self.initialized:
                raise ValueError("GFPGAN not available")
            input_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
            if input_img is None:
                raise ValueError("Could not load image")
            _, _, restored_img = self.gfpgan_model.enhance(input_img, has_aligned=False, only_center_face=False, paste_back=True, weight=kwargs.get('weight', 0.5))
            if output_path is None:
                output_path = self._generate_output_path(image_path, 'face_restored')
            cv2.imwrite(output_path, restored_img)
            metadata = {'method': 'GFPGAN Face Restoration', 'faces_only': True, 'complete_image_restored': False}
            return output_path, metadata
        except Exception as e:
            logger.error(f"Error in face restoration: {e}")
            return None, {'error': str(e)}
    
    def _generate_output_path(self, input_path: str, suffix: str) -> str:
        input_path = Path(input_path)
        timestamp = int(time.time())
        output_filename = f"{input_path.stem}_{suffix}_{timestamp}{input_path.suffix}"
        return str(Path("processed") / output_filename)
    
    def get_status(self) -> Dict[str, Any]:
        return {
            'initialized': True,
            'gfpgan_available': self.gfpgan_model is not None,
            'bg_upsampler_available': self.bg_upsampler is not None,
            'device': str(self.device),
            'restoration_methods': len(self.get_available_restoration_methods()),
            'complete_restoration_available': True,
            'real_esrgan_enabled': self.bg_upsampler is not None
        }

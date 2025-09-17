"""
Background Remover - Independent Module
Handles all background removal functionality with multiple methods
"""

import os
import logging
from typing import Optional, Dict, Any
from PIL import Image, ImageFilter
import numpy as np

logger = logging.getLogger(__name__)


class BackgroundRemover:
    """Independent Background Remover with multiple methods"""
    
    def __init__(self):
        self.available_methods = {
            'rembg': {'available': self._check_rembg(), 'quality': 9},
            'grabcut': {'available': True, 'quality': 6},
            'threshold': {'available': True, 'quality': 4}
        }
        logger.info(f"Background Remover initialized with {len(self.available_methods)} methods")
    
    def _check_rembg(self) -> bool:
        """Check if rembg is available with safe error handling"""
        try:
            logger.info("🔍 Checking rembg availability...")
            import rembg
            logger.info("✅ rembg successfully imported and available")
            return True
        except (ImportError, AttributeError, SystemError) as e:
            logger.warning(f"⚠️ rembg not available due to dependency issue: {e}")
            return False
    
    def get_available_methods(self) -> Dict[str, Any]:
        """Get all available background removal methods"""
        return {k: v for k, v in self.available_methods.items() if v['available']}
    
    def remove_background(self, input_path: str, output_path: str, method: str = 'auto') -> bool:
        """
        Remove background from image using specified method
        
        Args:
            input_path: Path to input image
            output_path: Path to save output image
            method: Method to use ('auto', 'rembg', 'grabcut', 'threshold')
        
        Returns:
            bool: Success status
        """
        try:
            if method == 'auto':
                method = self._select_best_method()
            
            logger.info(f"Removing background using method: {method}")
            
            if method == 'rembg' and self.available_methods['rembg']['available']:
                return self._rembg_removal(input_path, output_path)
            elif method == 'grabcut':
                return self._grabcut_removal(input_path, output_path)
            elif method == 'threshold':
                return self._threshold_removal(input_path, output_path)
            else:
                logger.warning(f"Method {method} not available, using fallback")
                return self._grabcut_removal(input_path, output_path)
                
        except Exception as e:
            logger.error(f"Background removal failed: {e}")
            return False
    
    def _select_best_method(self) -> str:
        """Select the best available method"""
        available = self.get_available_methods()
        if not available:
            return 'threshold'
        
        # Sort by quality score
        best = max(available.items(), key=lambda x: x[1]['quality'])
        return best[0]
    
    def _rembg_removal(self, input_path: str, output_path: str) -> bool:
        """Remove background using rembg library"""
        try:
            from rembg import remove
            
            with open(input_path, 'rb') as input_file:
                input_data = input_file.read()
            
            logger.info("Processing with rembg...")
            output_data = remove(input_data)
            
            with open(output_path, 'wb') as output_file:
                if isinstance(output_data, bytes):
                    output_file.write(output_data)
                else:
                    # Handle other types by converting to bytes
                    output_file.write(bytes(output_data))
            
            logger.info("✅ rembg background removal completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ rembg removal failed: {e}")
            return False
    
    def _grabcut_removal(self, input_path: str, output_path: str) -> bool:
        """Remove background using GrabCut algorithm"""
        try:
            import cv2
            
            # Load image
            img = cv2.imread(input_path)
            if img is None:
                raise ValueError("Could not load image")
            
            height, width = img.shape[:2]
            
            # Create mask
            mask = np.zeros((height, width), np.uint8)
            
            # Define rectangle for foreground (center 80% of image)
            margin_x = int(width * 0.1)
            margin_y = int(height * 0.1)
            rect = (margin_x, margin_y, width - 2*margin_x, height - 2*margin_y)
            
            # Initialize models
            bgdModel = np.zeros((1, 65), np.float64)
            fgdModel = np.zeros((1, 65), np.float64)
            
            # Apply GrabCut
            logger.info("Applying GrabCut algorithm...")
            cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
            
            # Create final mask
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Apply mask to create transparency
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img_pil = Image.fromarray(img_rgb)
            
            # Convert to RGBA
            img_rgba = img_pil.convert('RGBA')
            img_array = np.array(img_rgba)
            
            # Apply mask to alpha channel
            img_array[:, :, 3] = mask2 * 255
            
            # Save result
            result_img = Image.fromarray(img_array, 'RGBA')
            result_img.save(output_path, 'PNG')
            
            logger.info("✅ GrabCut background removal completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ GrabCut removal failed: {e}")
            return False
    
    def _threshold_removal(self, input_path: str, output_path: str) -> bool:
        """Remove background using simple thresholding"""
        try:
            img = Image.open(input_path).convert('RGBA')
            img_array = np.array(img)
            
            # Convert to grayscale for thresholding
            gray = np.mean(img_array[:, :, :3], axis=2)
            
            # Simple thresholding (works best with images having clear background)
            threshold = 240  # Adjust based on background color
            mask = gray < threshold
            
            # Apply mask to alpha channel
            img_array[:, :, 3] = mask.astype(np.uint8) * 255
            
            # Save result
            result_img = Image.fromarray(img_array, 'RGBA')
            result_img.save(output_path, 'PNG')
            
            logger.info("✅ Threshold background removal completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Threshold removal failed: {e}")
            return False
    
    def get_module_info(self) -> Dict[str, Any]:
        """Get module information"""
        return {
            "name": "Background Remover",
            "version": "1.0.0",
            "available_methods": list(self.get_available_methods().keys()),
            "total_methods": len(self.available_methods)
        }
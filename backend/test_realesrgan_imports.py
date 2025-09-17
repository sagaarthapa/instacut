#!/usr/bin/env python3
"""
Test Real-ESRGAN imports and basic functionality
"""

import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_realesrgan_imports():
    """Test if Real-ESRGAN can be imported correctly"""
    try:
        logger.info("Testing Real-ESRGAN imports...")
        
        # Test 1: Basic imports
        from realesrgan import RealESRGANer
        logger.info("✅ RealESRGANer imported successfully")
        
        from basicsr.archs.rrdbnet_arch import RRDBNet
        logger.info("✅ RRDBNet imported successfully")
        
        # Test 2: Other dependencies
        import torch
        import cv2
        import numpy as np
        from PIL import Image
        logger.info("✅ PyTorch, OpenCV, NumPy, PIL imported successfully")
        
        # Test 3: Check CUDA availability
        if torch.cuda.is_available():
            logger.info(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
        else:
            logger.info("ℹ️ CUDA not available, will use CPU")
        
        logger.info("🎉 All Real-ESRGAN imports successful!")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False

def test_realesrgan_basic():
    """Test basic Real-ESRGAN functionality"""
    try:
        from realesrgan import RealESRGANer
        from basicsr.archs.rrdbnet_arch import RRDBNet
        import torch
        
        logger.info("Testing Real-ESRGAN basic functionality...")
        
        # Test creating a model (without loading weights)
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        logger.info("✅ RRDBNet model created successfully")
        
        # Test device detection
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"✅ Device detected: {device}")
        
        logger.info("🎉 Basic Real-ESRGAN functionality test passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Basic functionality test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Real-ESRGAN Dependency Test")
    print("=" * 50)
    
    # Test imports
    import_success = test_realesrgan_imports()
    
    # Test basic functionality
    if import_success:
        basic_success = test_realesrgan_basic()
        
        if basic_success:
            print("✅ All tests passed! Real-ESRGAN is ready to use.")
            sys.exit(0)
        else:
            print("❌ Basic functionality test failed.")
            sys.exit(1)
    else:
        print("❌ Import test failed.")
        sys.exit(1)
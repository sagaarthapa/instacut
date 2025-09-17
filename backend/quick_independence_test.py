#!/usr/bin/env python3
"""
Quick test script to isolate upscaling issues
"""

import requests
import base64
from PIL import Image
import io
import numpy as np
import time

def create_simple_test_image():
    """Create a minimal test image"""
    # Create a simple 50x50 RGB test image
    img_array = np.zeros((50, 50, 3), dtype=np.uint8)
    img_array[10:40, 10:40] = [0, 255, 0]  # Green square
    img_array[:, :, 0] = 30  # Add some red background
    
    img = Image.fromarray(img_array, 'RGB')
    return img

def test_upscaling_directly():
    """Test upscaling functionality directly"""
    print("🧪 Testing Upscaling Module Directly...")
    
    # Create and save test image
    test_image_path = "quick_upscale_test.png"
    try:
        img = create_simple_test_image()
        img.save(test_image_path)
        print(f"   Created test image: {img.size}")
        
        # Test with file upload
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_upscale.png', f, 'image/png')}
            data = {'operation': 'upscale', 'model': 'lanczos_2x'}
            
            print("   Sending upscale request...")
            response = requests.post('http://localhost:8000/api/v1/process', files=files, data=data)
            
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upscaling: SUCCESS")
            print(f"   Model used: {result.get('model_used', 'unknown')}")
            print(f"   Processing time: {result.get('processing_time', 0):.3f}s")
            if 'output_size' in result:
                print(f"   Output size: {result['output_size']}")
            return True
        else:
            print(f"❌ Upscaling: FAILED")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Upscaling: ERROR - {e}")
        return False
    finally:
        # Clean up
        import os
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def test_background_removal_directly():
    """Test background removal functionality directly"""
    print("\n🧪 Testing Background Removal Module Directly...")
    
    # Create and save test image
    test_image_path = "quick_bg_test.png"
    try:
        img = create_simple_test_image()
        img.save(test_image_path)
        print(f"   Created test image: {img.size}")
        
        # Test with file upload
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_bg.png', f, 'image/png')}
            data = {'operation': 'remove_background', 'model': 'threshold'}
            
            print("   Sending background removal request...")
            response = requests.post('http://localhost:8000/api/v1/process', files=files, data=data)
            
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Background Removal: SUCCESS")
            print(f"   Model used: {result.get('model_used', 'unknown')}")
            print(f"   Processing time: {result.get('processing_time', 0):.3f}s")
            return True
        else:
            print(f"❌ Background Removal: FAILED")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Background Removal: ERROR - {e}")
        return False
    finally:
        # Clean up
        import os
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def main():
    print("🚀 Quick Module Independence Test")
    print("=" * 50)
    
    # Test both modules
    bg_ok = test_background_removal_directly()
    upscale_ok = test_upscaling_directly()
    
    print("\n" + "=" * 50)
    print("📊 Independence Test Results:")
    print(f"   Background Removal: {'✅ INDEPENDENT' if bg_ok else '❌ BROKEN'}")
    print(f"   Upscaling: {'✅ INDEPENDENT' if upscale_ok else '❌ BROKEN'}")
    
    if bg_ok and upscale_ok:
        print("\n🎉 Both modules working INDEPENDENTLY!")
    else:
        print("\n⚠️ Module independence issues detected.")

if __name__ == "__main__":
    main()
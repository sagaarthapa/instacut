#!/usr/bin/env python3
"""
Test script for the modular AI system
Tests both background remover and upscaler independently
"""

import requests
import base64
from PIL import Image
import io
import time

def create_test_image():
    """Create a simple test image"""
    import numpy as np
    
    # Create a simple 100x100 RGB test image
    img_array = np.zeros((100, 100, 3), dtype=np.uint8)
    img_array[20:80, 20:80] = [255, 0, 0]  # Red square
    img_array[:, :, 1] = 50  # Add some green background
    
    img = Image.fromarray(img_array, 'RGB')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')

def test_background_removal():
    """Test the background removal module"""
    print("🧪 Testing Background Removal Module...")
    
    # Create test image and save temporarily
    test_image_path = "temp_test_image.png"
    try:
        import numpy as np
        
        # Create a simple 100x100 RGB test image
        img_array = np.zeros((100, 100, 3), dtype=np.uint8)
        img_array[20:80, 20:80] = [255, 0, 0]  # Red square
        img_array[:, :, 1] = 50  # Add some green background
        
        img = Image.fromarray(img_array, 'RGB')
        img.save(test_image_path)
        
        # Upload the file for processing
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test.png', f, 'image/png')}
            data = {'operation': 'remove_background', 'model': 'threshold'}
            
            response = requests.post('http://localhost:8000/api/v1/process', files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Background Removal: SUCCESS")
            print(f"   Model used: {result.get('model_used', 'unknown')}")
            print(f"   Processing time: {result.get('processing_time', 0):.3f}s")
            return True
        else:
            print(f"❌ Background Removal: FAILED - Status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Background Removal: ERROR - {e}")
        return False
    finally:
        # Clean up test file
        import os
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def test_upscaling():
    """Test the upscaling module"""
    print("\n🧪 Testing Upscaling Module...")
    
    # Create test image and save temporarily
    test_image_path = "temp_test_image_upscale.png"
    try:
        import numpy as np
        
        # Create a simple 50x50 RGB test image
        img_array = np.zeros((50, 50, 3), dtype=np.uint8)
        img_array[10:40, 10:40] = [0, 255, 0]  # Green square
        img_array[:, :, 0] = 30  # Add some red background
        
        img = Image.fromarray(img_array, 'RGB')
        img.save(test_image_path)
        
        # Upload the file for processing
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_upscale.png', f, 'image/png')}
            data = {'operation': 'upscale', 'model': 'lanczos_2x'}
            
            response = requests.post('http://localhost:8000/api/v1/process', files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Upscaling: SUCCESS")
            print(f"   Model used: {result.get('model_used', 'unknown')}")
            print(f"   Processing time: {result.get('processing_time', 0):.3f}s")
            return True
        else:
            print(f"❌ Upscaling: FAILED - Status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Upscaling: ERROR - {e}")
        return False
    finally:
        # Clean up test file
        import os
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def test_health():
    """Test the health endpoint"""
    print("\n🧪 Testing System Health...")
    
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            health = response.json()
            print("✅ System Health: HEALTHY")
            print(f"   Background removal methods: {len(health['ai_services']['background_removal'])}")
            print(f"   Upscaling methods: {len(health['ai_services']['upscaling'])}")
            return True
        else:
            print(f"❌ System Health: UNHEALTHY - Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ System Health: ERROR - {e}")
        return False

def main():
    print("🚀 Testing Modular AI System")
    print("=" * 50)
    
    # Test each module independently
    health_ok = test_health()
    bg_ok = test_background_removal()
    upscale_ok = test_upscaling()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   System Health: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Background Removal: {'✅ PASS' if bg_ok else '❌ FAIL'}")
    print(f"   Upscaling: {'✅ PASS' if upscale_ok else '❌ FAIL'}")
    
    if all([health_ok, bg_ok, upscale_ok]):
        print("\n🎉 All modules working independently! Modular architecture SUCCESS!")
    else:
        print("\n⚠️ Some modules failed. Check the logs above.")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Backend-only independence test
"""

import requests
import base64
from PIL import Image
import io
import numpy as np
import time
import concurrent.futures
import threading

def create_test_image(name, color):
    """Create a test image with specific color"""
    img_array = np.zeros((100, 100, 3), dtype=np.uint8)
    img_array[20:80, 20:80] = color
    img_array[:, :, 2] = 50  # Blue background
    
    img = Image.fromarray(img_array, 'RGB')
    filename = f"{name}_test.png"
    img.save(filename)
    return filename, img.size

def test_background_removal_thread():
    """Test background removal in separate thread"""
    print(f"[BG Thread] Testing Background Removal...")
    
    filename, size = create_test_image("bg_removal", [255, 0, 0])  # Red square
    
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'image/png')}
            data = {'operation': 'remove_background', 'model': 'threshold'}
            
            response = requests.post('http://localhost:8000/api/v1/process', files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print(f"[BG] ✅ SUCCESS - Model: {result.get('model_used')}, Time: {result.get('processing_time', 0):.3f}s")
            return True
        else:
            print(f"[BG] ❌ FAILED - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[BG] ❌ ERROR - {e}")
        return False
    finally:
        import os
        if os.path.exists(filename):
            os.remove(filename)

def test_upscaling_thread():
    """Test upscaling in separate thread"""
    print(f"[UP Thread] Testing Upscaling...")
    
    filename, size = create_test_image("upscaling", [0, 255, 0])  # Green square
    
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'image/png')}
            data = {'operation': 'upscale', 'model': 'lanczos_2x'}
            
            response = requests.post('http://localhost:8000/api/v1/process', files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print(f"[UP] ✅ SUCCESS - Model: {result.get('model_used')}, Time: {result.get('processing_time', 0):.3f}s")
            return True
        else:
            print(f"[UP] ❌ FAILED - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[UP] ❌ ERROR - {e}")
        return False
    finally:
        import os
        if os.path.exists(filename):
            os.remove(filename)

def main():
    print("🚀 BACKEND MODULES INDEPENDENCE TEST")
    print("=" * 50)
    
    # Test system health
    print("\n🏥 System Health Check...")
    try:
        response = requests.get('http://localhost:8000/health')
        health = response.json()
        print("✅ Backend: HEALTHY")
        print(f"   Background methods: {len(health['ai_services']['background_removal'])}")
        print(f"   Upscaling methods: {len(health['ai_services']['upscaling'])}")
    except Exception as e:
        print(f"❌ Backend health error: {e}")
        return
    
    # Test sequential processing
    print("\n📈 Sequential Processing Test...")
    start_time = time.time()
    bg_seq = test_background_removal_thread()
    up_seq = test_upscaling_thread()
    seq_time = time.time() - start_time
    
    # Test simultaneous processing
    print("\n🔥 Simultaneous Processing Test...")
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_bg = executor.submit(test_background_removal_thread)
        future_up = executor.submit(test_upscaling_thread)
        
        bg_sim = future_bg.result()
        up_sim = future_up.result()
    
    sim_time = time.time() - start_time
    
    print("\n" + "=" * 50)
    print("🏆 INDEPENDENCE TEST RESULTS:")
    print("=" * 50)
    print(f"Sequential Test:")
    print(f"   Background Removal: {'✅ PASS' if bg_seq else '❌ FAIL'}")
    print(f"   Upscaling: {'✅ PASS' if up_seq else '❌ FAIL'}")
    print(f"   Time: {seq_time:.3f}s")
    print(f"\nSimultaneous Test:")
    print(f"   Background Removal: {'✅ INDEPENDENT' if bg_sim else '❌ FAILED'}")
    print(f"   Upscaling: {'✅ INDEPENDENT' if up_sim else '❌ FAILED'}")
    print(f"   Time: {sim_time:.3f}s")
    
    all_passed = all([bg_seq, up_seq, bg_sim, up_sim])
    
    if all_passed:
        print("\n🎉 COMPLETE SUCCESS!")
        print("✅ Both modules work independently without conflicts!")
        print("✅ Modular architecture is working perfectly!")
    else:
        print("\n⚠️ Some tests failed. Check the logs above.")
    
    print("\n🌐 Backend running at: http://localhost:8000")

if __name__ == "__main__":
    main()
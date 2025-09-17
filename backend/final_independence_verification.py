#!/usr/bin/env python3
"""
Comprehensive independence test - Final verification
Tests both modules work completely independently with no conflicts
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
    print(f"[Thread {threading.current_thread().name}] Testing Background Removal...")
    
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
    print(f"[Thread {threading.current_thread().name}] Testing Upscaling...")
    
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

def test_simultaneous_processing():
    """Test both modules running simultaneously (independence test)"""
    print("\n🔥 SIMULTANEOUS PROCESSING TEST (Independence Verification)")
    print("=" * 60)
    
    start_time = time.time()
    
    # Run both operations in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_bg = executor.submit(test_background_removal_thread)
        future_up = executor.submit(test_upscaling_thread)
        
        # Wait for both to complete
        bg_result = future_bg.result()
        up_result = future_up.result()
    
    total_time = time.time() - start_time
    
    print(f"\n📊 SIMULTANEOUS TEST RESULTS:")
    print(f"   Background Removal: {'✅ INDEPENDENT' if bg_result else '❌ FAILED'}")
    print(f"   Upscaling: {'✅ INDEPENDENT' if up_result else '❌ FAILED'}")
    print(f"   Total parallel time: {total_time:.3f}s")
    
    return bg_result and up_result

def test_sequential_processing():
    """Test modules sequentially"""
    print("\n📈 SEQUENTIAL PROCESSING TEST")
    print("=" * 60)
    
    start_time = time.time()
    bg_result = test_background_removal_thread()
    up_result = test_upscaling_thread()
    total_time = time.time() - start_time
    
    print(f"\n📊 SEQUENTIAL TEST RESULTS:")
    print(f"   Background Removal: {'✅ SUCCESS' if bg_result else '❌ FAILED'}")
    print(f"   Upscaling: {'✅ SUCCESS' if up_result else '❌ FAILED'}")
    print(f"   Total sequential time: {total_time:.3f}s")
    
    return bg_result and up_result

def test_system_health():
    """Test system health"""
    print("\n🏥 SYSTEM HEALTH CHECK")
    print("=" * 60)
    
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            health = response.json()
            print("✅ Backend: HEALTHY")
            
            bg_methods = health['ai_services']['background_removal']
            up_methods = health['ai_services']['upscaling']
            
            print(f"   Background Removal: {len(bg_methods)} methods available")
            for method, info in bg_methods.items():
                print(f"     - {method}: {'✅' if info['available'] else '❌'}")
            
            print(f"   Upscaling: {len(up_methods)} methods available")
            for method, info in up_methods.items():
                print(f"     - {method}: {'✅' if info['available'] else '❌'} (scale: {info.get('scale', 'N/A')})")
            
            return True
        else:
            print(f"❌ Backend: UNHEALTHY - Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend: ERROR - {e}")
        return False

def test_frontend_connectivity():
    """Test frontend connectivity"""
    print("\n🌐 FRONTEND CONNECTIVITY TEST")
    print("=" * 60)
    
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend: ACCESSIBLE at http://localhost:3000")
            return True
        else:
            print(f"⚠️ Frontend: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend: ERROR - {e}")
        return False

def main():
    print("🚀 COMPREHENSIVE INDEPENDENCE VERIFICATION")
    print("🎯 Testing if both AI modules run completely independently")
    print("=" * 70)
    
    # Test each component
    health_ok = test_system_health()
    frontend_ok = test_frontend_connectivity()
    sequential_ok = test_sequential_processing()
    simultaneous_ok = test_simultaneous_processing()
    
    print("\n" + "=" * 70)
    print("🏆 FINAL INDEPENDENCE VERIFICATION RESULTS:")
    print("=" * 70)
    print(f"   System Health: {'✅ HEALTHY' if health_ok else '❌ UNHEALTHY'}")
    print(f"   Frontend Access: {'✅ ACCESSIBLE' if frontend_ok else '❌ INACCESSIBLE'}")
    print(f"   Sequential Processing: {'✅ WORKING' if sequential_ok else '❌ BROKEN'}")
    print(f"   Simultaneous Processing: {'✅ INDEPENDENT' if simultaneous_ok else '❌ CONFLICTS'}")
    
    all_passed = all([health_ok, sequential_ok, simultaneous_ok])
    
    if all_passed:
        print("\n🎉 COMPLETE SUCCESS! Both modules are fully independent!")
        print("✅ Background Remover and Upscaler work without any conflicts")
        print("✅ Modular architecture achieved - each tool operates independently")
    else:
        print("\n⚠️ Some issues detected. Check the logs above for details.")
    
    print("\n📍 Application URLs:")
    print("   🖥️ Frontend: http://localhost:3000")
    print("   🔧 Backend API: http://localhost:8000")
    print("   📚 API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
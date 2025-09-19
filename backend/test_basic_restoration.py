#!/usr/bin/env python3
"""
Test script to verify photo restoration parameter fixes using basic methods
"""
import requests
import os
import time

# Configuration
BASE_URL = "http://localhost:8000"
TEST_IMAGE_PATH = "test_image.jpg"

def test_basic_photo_restoration():
    """Test the photo restoration endpoint with basic enhancement (no GFPGAN needed)"""
    print("🧪 Testing basic photo restoration methods...")
    
    # First, check if the API is running
    try:
        health_response = requests.get(f"{BASE_URL}/health")
        if health_response.status_code != 200:
            print(f"❌ API is not running. Health check failed: {health_response.status_code}")
            return False
        print("✅ API is running")
    except Exception as e:
        print(f"❌ Could not connect to API: {e}")
        return False
    
    # Test uploading an image for basic photo restoration
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"❌ Test image {TEST_IMAGE_PATH} not found")
        return False
    
    # Test basic sharpen method (should work without GFPGAN)
    for method in ['basic_sharpen', 'contrast_enhance']:
        try:
            print(f"\n📤 Testing {method} method...")
            
            with open(TEST_IMAGE_PATH, 'rb') as f:
                files = {
                    'file': (TEST_IMAGE_PATH, f, 'image/jpeg')
                }
                data = {
                    'operation': 'photo_restoration',
                    'method': method,
                    'scale': 2
                }
                
                response = requests.post(f"{BASE_URL}/api/v1/process", files=files, data=data)
                
                print(f"📋 Response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ {method} successful!")
                    print(f"📋 Result: {result}")
                    
                    # Check if we have a processed_image_url for download
                    if 'processed_image_url' in result:
                        print(f"🔗 Download URL: {result['processed_image_url']}")
                        
                        # Test the download
                        download_url = f"{BASE_URL}{result['processed_image_url']}"
                        download_response = requests.get(download_url)
                        
                        if download_response.status_code == 200:
                            print(f"✅ {method} download successful!")
                            print(f"📊 Downloaded {len(download_response.content)} bytes")
                        else:
                            print(f"❌ {method} download failed: {download_response.status_code}")
                            return False
                    else:
                        print(f"❌ No processed_image_url in {method} response")
                        return False
                        
                else:
                    print(f"❌ {method} failed: {response.status_code}")
                    print(f"📋 Response: {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ {method} test failed with exception: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting basic photo restoration parameter fix test...")
    success = test_basic_photo_restoration()
    
    if success:
        print("\n🎉 All basic photo restoration tests passed!")
        print("✅ Parameter fixes are working correctly.")
        print("📋 The 'No processed file available for download' error should now be resolved!")
    else:
        print("\n💥 Tests failed! Photo restoration needs more fixes.")
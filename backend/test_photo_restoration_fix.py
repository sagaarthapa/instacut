#!/usr/bin/env python3
"""
Test script to verify photo restoration parameter fixes
"""
import requests
import os
import time

# Configuration
BASE_URL = "http://localhost:8000"
TEST_IMAGE_PATH = "test_image.jpg"

def test_photo_restoration():
    """Test the photo restoration endpoint with parameter fixes"""
    print("🧪 Testing photo restoration with parameter fixes...")
    
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
    
    # Test uploading an image for photo restoration
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"❌ Test image {TEST_IMAGE_PATH} not found")
        return False
    
    try:
        # Upload and process with photo restoration
        with open(TEST_IMAGE_PATH, 'rb') as f:
            files = {
                'file': (TEST_IMAGE_PATH, f, 'image/jpeg')
            }
            data = {
                'operation': 'photo_restoration',
                'method': 'gfpgan_face_restore',
                'scale': 2
            }
            
            print("📤 Uploading image for photo restoration...")
            response = requests.post(f"{BASE_URL}/api/v1/process", files=files, data=data)
            
            print(f"📋 Response status: {response.status_code}")
            print(f"📋 Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Photo restoration successful!")
                print(f"📋 Result: {result}")
                
                # Check if we have a processed_image_url for download
                if 'processed_image_url' in result:
                    print(f"🔗 Download URL: {result['processed_image_url']}")
                    
                    # Test the download
                    download_url = f"{BASE_URL}{result['processed_image_url']}"
                    download_response = requests.get(download_url)
                    
                    if download_response.status_code == 200:
                        print("✅ Download successful!")
                        print(f"📊 Downloaded {len(download_response.content)} bytes")
                        return True
                    else:
                        print(f"❌ Download failed: {download_response.status_code}")
                        print(f"📋 Download response: {download_response.text}")
                        return False
                else:
                    print("❌ No processed_image_url in response")
                    return False
                    
            else:
                print(f"❌ Photo restoration failed: {response.status_code}")
                print(f"📋 Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting photo restoration parameter fix test...")
    success = test_photo_restoration()
    
    if success:
        print("🎉 All tests passed! Photo restoration is working correctly.")
    else:
        print("💥 Tests failed! Photo restoration needs more fixes.")
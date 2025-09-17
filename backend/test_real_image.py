"""
Simple test to download a real image and test processing
"""

import requests
import os
from urllib.request import urlretrieve

def download_test_image():
    """Download a simple test image"""
    url = "https://httpbin.org/image/jpeg"  # Simple test JPEG
    filename = "simple_test.jpg"
    
    try:
        print("📥 Downloading test image...")
        urlretrieve(url, filename)
        print(f"✅ Downloaded: {filename}")
        return filename
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return None

def test_with_real_image():
    """Test processing with a real downloaded image"""
    
    # Download a test image
    image_file = download_test_image()
    if not image_file:
        return
    
    try:
        with open(image_file, 'rb') as f:
            files = {'file': (image_file, f, 'image/jpeg')}
            data = {
                'operation': 'upscale',
                'model': 'realesrgan_2x'  # Try 2x first, simpler
            }
            
            print("📤 Testing with real image...")
            response = requests.post(
                'http://localhost:8000/api/v1/process',
                files=files,
                data=data,
                timeout=120  # 2 minute timeout
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Clean up
        if os.path.exists(image_file):
            os.remove(image_file)

if __name__ == "__main__":
    test_with_real_image()
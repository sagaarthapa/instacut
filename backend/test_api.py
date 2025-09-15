import requests
import io
from PIL import Image
import time

# Create a simple test image
img = Image.new('RGB', (100, 100), color='red')
img_bytes = io.BytesIO()
img.save(img_bytes, format='PNG')
img_bytes = img_bytes.getvalue()

print("Testing background removal API...")

# Test upload first
try:
    response = requests.post('http://localhost:8000/api/upload', 
                           files={'file': ('test.png', img_bytes, 'image/png')},
                           timeout=10)
    print(f"Upload status: {response.status_code}")
    if response.status_code == 200:
        print("✅ Upload successful")
    else:
        print(f"❌ Upload failed: {response.text}")
except Exception as e:
    print(f"❌ Upload error: {e}")

# Test processing
try:
    print("\nTesting processing...")
    start_time = time.time()
    
    response = requests.post('http://localhost:8000/api/v1/process',
                           files={'file': ('test.png', img_bytes, 'image/png')},
                           data={'operation': 'background_removal', 'model': 'rembg'},
                           timeout=60)
    
    processing_time = time.time() - start_time
    print(f"Processing took {processing_time:.2f} seconds")
    print(f"Processing status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Processing successful!")
        print(f"Result: {result}")
    else:
        print(f"❌ Processing failed: {response.text}")
        
except requests.exceptions.Timeout:
    print("❌ Processing timed out after 60 seconds")
except Exception as e:
    print(f"❌ Processing error: {e}")
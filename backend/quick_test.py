#!/usr/bin/env python3
import requests
from PIL import Image
import time

print("🧪 QUICK UPSCALING TEST")
print("Testing with Lanczos (no model download)")

# Create small test image
img = Image.new('RGB', (50, 50), color='red')
img.save('quick_test.png')

try:
    with open('quick_test.png', 'rb') as f:
        response = requests.post('http://localhost:8000/api/v1/process', 
                               files={'file': ('test.png', f, 'image/png')},
                               data={'operation': 'upscaling', 'model': 'lanczos'},
                               timeout=30)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS with Lanczos!")
        print(f"Result: {result['status']}")
        print(f"Output: {result.get('result', {}).get('output_filename')}")
    else:
        print(f"❌ ERROR: {response.text}")

except requests.exceptions.Timeout:
    print("❌ REQUEST TIMEOUT - server is stuck")
except Exception as e:
    print(f"❌ ERROR: {e}")

import os
if os.path.exists('quick_test.png'):
    os.remove('quick_test.png')
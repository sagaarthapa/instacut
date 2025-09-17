#!/usr/bin/env python3
import requests
from PIL import Image
import os

print("🧪 TESTING CORRECT MODEL NAME")

# Create test image
img = Image.new('RGB', (50, 50), color='purple')  
img.save('test_model.png')

try:
    with open('test_model.png', 'rb') as f:
        response = requests.post('http://localhost:8000/api/v1/process',
                               files={'file': ('test.png', f, 'image/png')},
                               data={'operation': 'upscaling', 'model': 'lanczos_4x'})
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Outer status: {result.get('status')}")
        inner = result.get('result', {})
        print(f"Inner status: {inner.get('status')}")
        if inner.get('status') == 'error':
            print(f"Error: {inner.get('error')}")
        else:
            print(f"Output filename: {inner.get('output_filename')}")
            print(f"Output path: {inner.get('output_path')}")
    else:
        print(f"HTTP Error: {response.text}")
        
except Exception as e:
    print(f"Exception: {e}")

# Cleanup
if os.path.exists('test_model.png'):
    os.remove('test_model.png')
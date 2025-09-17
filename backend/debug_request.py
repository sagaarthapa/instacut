#!/usr/bin/env python3
import requests
from PIL import Image
import time

print("🔧 DEBUGGING UPSCALING REQUEST")

# Create test image
img = Image.new('RGB', (100, 100), color='blue')
img.save('debug_test.png')
print("✅ Created test image")

# Test health endpoint first
try:
    health = requests.get('http://localhost:8000/health', timeout=5)
    print(f"✅ Health check: {health.status_code}")
except Exception as e:
    print(f"❌ Health check failed: {e}")
    exit(1)

# Test processing endpoint
print("\n📤 Testing processing endpoint...")
try:
    with open('debug_test.png', 'rb') as f:
        files = {'file': ('test.png', f, 'image/png')}
        data = {'operation': 'upscaling', 'model': 'lanczos'}
        
        print("Making request...")
        response = requests.post('http://localhost:8000/api/v1/process', 
                               files=files, data=data, timeout=60)
        
        print(f"📨 Status: {response.status_code}")
        print(f"📨 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"📋 Response: {result}")
            
            inner_result = result.get('result')
            if inner_result:
                print(f"📋 Inner result: {inner_result}")
                print(f"   Status: {inner_result.get('status')}")
                print(f"   Output file: {inner_result.get('output_filename')}")
                print(f"   Output path: {inner_result.get('output_path')}")
            else:
                print("❌ No 'result' field in response")
        else:
            print(f"❌ Response: {response.text}")
            
except requests.exceptions.Timeout:
    print("❌ Request timed out")
except Exception as e:
    print(f"❌ Request failed: {e}")

import os
if os.path.exists('debug_test.png'):
    os.remove('debug_test.png')
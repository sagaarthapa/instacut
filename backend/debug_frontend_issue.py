#!/usr/bin/env python3
"""
Test the EXACT frontend workflow to identify the processing issue
"""

import requests
import json
import os
from PIL import Image
import time

def test_frontend_workflow():
    print("🔍 DEBUGGING FRONTEND PROCESSING ISSUE")
    print("=" * 50)
    
    # 1. Check both servers
    print("\n1. Checking server status...")
    try:
        backend_response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"   Backend: {backend_response.status_code} ✅")
    except:
        print("   Backend: NOT RUNNING ❌")
        return False
        
    try:
        frontend_response = requests.get('http://localhost:3000', timeout=5)
        print(f"   Frontend: {frontend_response.status_code} ✅")
    except:
        print("   Frontend: NOT RUNNING ❌")
        return False
    
    # 2. Create test image (like user upload)
    print("\n2. Creating test image (simulating user upload)...")
    test_file = 'frontend_test.png'
    img = Image.new('RGB', (300, 300), color='green')
    img.save(test_file)
    print(f"   Created: {test_file}")
    
    # 3. Test the EXACT API call that frontend makes
    print("\n3. Testing EXACT frontend API call...")
    try:
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'image/png')}
            data = {
                'operation': 'upscaling',  # This is what frontend sends after our fix
                'model': 'realesrgan_4x'   # This is the default model
            }
            
            print(f"   📤 POST /api/v1/process")
            print(f"   📋 Data: {data}")
            
            # Time the request
            start_time = time.time()
            response = requests.post('http://localhost:8000/api/v1/process', 
                                   files=files, data=data, timeout=60)
            end_time = time.time()
            
            print(f"   ⏱️  Request took: {end_time - start_time:.2f} seconds")
            print(f"   📨 Response: {response.status_code}")
            
            if response.status_code != 200:
                print(f"   ❌ HTTP ERROR: {response.text}")
                return False
            
            # Parse response
            result = response.json()
            print(f"   📋 Response structure:")
            print(f"      status: {result.get('status')}")
            print(f"      message: {result.get('message')}")
            
            # Check the nested result structure (this is where frontend looks)
            if 'result' not in result:
                print("   ❌ NO 'result' KEY IN RESPONSE!")
                print(f"   📋 Available keys: {list(result.keys())}")
                return False
            
            inner_result = result['result']
            print(f"   📋 Inner result:")
            print(f"      status: {inner_result.get('status')}")
            
            if inner_result.get('status') == 'error':
                print(f"   ❌ PROCESSING ERROR: {inner_result.get('error')}")
                return False
            elif inner_result.get('status') == 'success':
                print("   ✅ Processing successful!")
                
                # Check file paths (what frontend needs for download)
                output_path = inner_result.get('output_path')
                output_filename = inner_result.get('output_filename')
                
                print(f"      output_path: {output_path}")
                print(f"      output_filename: {output_filename}")
                
                if not output_path or not output_filename:
                    print("   ❌ MISSING OUTPUT PATH OR FILENAME!")
                    return False
                
                # 4. Test file existence
                print(f"\n4. Checking if output file exists...")
                if os.path.exists(output_path):
                    size = os.path.getsize(output_path)
                    print(f"   ✅ File exists: {output_path} ({size} bytes)")
                else:
                    print(f"   ❌ FILE NOT FOUND: {output_path}")
                    return False
                
                # 5. Test download (what frontend does)
                print(f"\n5. Testing download endpoint...")
                download_url = f"http://localhost:8000/api/v1/download/{output_filename}"
                print(f"   📥 Testing: {download_url}")
                
                download_response = requests.get(download_url)
                if download_response.status_code == 200:
                    print(f"   ✅ Download works! ({len(download_response.content)} bytes)")
                    print("\n🎉 COMPLETE SUCCESS! Frontend should work perfectly!")
                    return True
                else:
                    print(f"   ❌ Download failed: {download_response.status_code}")
                    print(f"   📋 Error: {download_response.text}")
                    return False
            else:
                print(f"   ❌ UNKNOWN STATUS: {inner_result.get('status')}")
                return False
                
    except requests.exceptions.Timeout:
        print("   ❌ REQUEST TIMEOUT!")
        return False
    except Exception as e:
        print(f"   ❌ REQUEST FAILED: {e}")
        return False
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    success = test_frontend_workflow()
    print("\n" + "=" * 50)
    if success:
        print("🎉 WORKFLOW IS WORKING!")
        print("The issue might be in the frontend JavaScript/React code.")
    else:
        print("❌ WORKFLOW FAILED!")
        print("There's a backend processing issue.")
    print("=" * 50)
#!/usr/bin/env python3
"""
Complete End-to-End Test for AI Image Studio
This script tests the exact workflow that the frontend uses
"""

import requests
import json
import os
from PIL import Image

def test_complete_workflow():
    print("🚀 AI Image Studio - Complete End-to-End Test")
    print("=" * 50)
    
    # 1. Backend Health Check
    print("\n1. Testing backend health...")
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            health = response.json()
            print(f"   Services: {list(health.get('ai_services', {}).keys())}")
        else:
            print("   ❌ Backend not healthy")
            return False
    except Exception as e:
        print(f"   ❌ Backend not accessible: {e}")
        return False
    
    # 2. Create test image
    print("\n2. Creating test image...")
    test_filename = 'workflow_test.png'
    test_image = Image.new('RGB', (150, 150), color='red')
    test_image.save(test_filename)
    print(f"   ✅ Created {test_filename}")
    
    # 3. Test upscaling processing (exact frontend parameters)
    print("\n3. Testing upscaling processing...")
    try:
        with open(test_filename, 'rb') as f:
            files = {'file': (test_filename, f, 'image/png')}
            data = {
                'operation': 'upscaling',  # Frontend sends this
                'model': 'realesrgan_4x'   # Frontend default model
            }
            
            print("   📤 Sending request to /api/v1/process...")
            response = requests.post('http://localhost:8000/api/v1/process', 
                                   files=files, data=data, timeout=60)
            
            print(f"   📨 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("   📋 Response structure:")
                print(f"      Top level status: {result.get('status')}")
                print(f"      Model used: {result.get('model_used')}")
                print(f"      Processing time: {result.get('processing_time')}")
                
                # Check inner result
                if 'result' in result:
                    inner = result['result']
                    print(f"      Inner status: {inner.get('status')}")
                    
                    if inner.get('status') == 'success':
                        output_filename = inner.get('output_filename')
                        output_path = inner.get('output_path')
                        print(f"      ✅ Output filename: {output_filename}")
                        print(f"      ✅ Output path: {output_path}")
                        
                        # 4. Test file existence
                        print("\n4. Testing file existence...")
                        if output_path and os.path.exists(output_path):
                            file_size = os.path.getsize(output_path)
                            print(f"   ✅ File exists: {output_path} ({file_size} bytes)")
                            
                            # 5. Test download endpoint
                            print("\n5. Testing download endpoint...")
                            if output_filename:
                                download_url = f'http://localhost:8000/api/v1/download/{output_filename}'
                                print(f"   📥 Testing: {download_url}")
                                
                                download_response = requests.get(download_url)
                                print(f"   📨 Download status: {download_response.status_code}")
                                
                                if download_response.status_code == 200:
                                    download_size = len(download_response.content)
                                    print(f"   ✅ Download successful ({download_size} bytes)")
                                    
                                    # 6. Test frontend access pattern
                                    print("\n6. Testing frontend access patterns...")
                                    print("   Frontend checks:")
                                    print(f"      result.result?.output_path: {result.get('result', {}).get('output_path')}")
                                    print(f"      result.result?.output_filename: {result.get('result', {}).get('output_filename')}")
                                    
                                    if (result.get('result', {}).get('output_path') and 
                                        result.get('result', {}).get('output_filename')):
                                        print("   ✅ Frontend should be able to access download!")
                                        return True
                                    else:
                                        print("   ❌ Frontend access pattern will fail")
                                        return False
                                else:
                                    print(f"   ❌ Download failed: {download_response.text}")
                                    return False
                            else:
                                print("   ❌ No output filename for download test")
                                return False
                        else:
                            print(f"   ❌ Output file not found: {output_path}")
                            return False
                    elif inner.get('status') == 'error':
                        print(f"   ❌ Processing error: {inner.get('error')}")
                        return False
                    else:
                        print(f"   ❌ Unknown inner status: {inner.get('status')}")
                        return False
                else:
                    print("   ❌ No 'result' object in response")
                    return False
            else:
                print(f"   ❌ HTTP Error {response.status_code}: {response.text}")
                return False
                
    except Exception as e:
        print(f"   ❌ Processing failed: {e}")
        return False
    
    # Cleanup
    if os.path.exists(test_filename):
        os.remove(test_filename)
        
    return False

if __name__ == "__main__":
    success = test_complete_workflow()
    print("\n" + "=" * 50)
    if success:
        print("🎉 COMPLETE WORKFLOW SUCCESS!")
        print("   Frontend should work correctly now.")
    else:
        print("❌ WORKFLOW FAILED!")
        print("   There are issues that need to be fixed.")
    print("=" * 50)
#!/usr/bin/env python3
"""
Complete Frontend-Backend Integration Test
Tests the exact same workflow a user would follow
"""

import requests
import json
from PIL import Image
import time
import os

def test_complete_user_workflow():
    print("🧪 TESTING COMPLETE USER WORKFLOW")
    print("=" * 50)
    
    # Step 1: Check both servers are running
    print("\n1️⃣ Checking servers...")
    
    try:
        backend_response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"   ✅ Backend: {backend_response.status_code}")
        health_data = backend_response.json()
        print(f"   📋 Available services: {', '.join(health_data.get('services', {}).keys())}")
    except Exception as e:
        print(f"   ❌ Backend: {e}")
        return False
        
    try:
        frontend_response = requests.get('http://localhost:3000', timeout=10)
        print(f"   ✅ Frontend: {frontend_response.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend: {e}")
        return False
    
    # Step 2: Create test image (like user upload)
    print("\n2️⃣ Creating test image...")
    test_image_name = 'user_test_image.png'
    img = Image.new('RGB', (200, 150), color='green')
    img.save(test_image_name)
    print(f"   ✅ Created {test_image_name} ({img.size})")
    
    # Step 3: Test the EXACT API call that frontend makes
    print("\n3️⃣ Testing upscaling request (same as frontend)...")
    
    try:
        with open(test_image_name, 'rb') as f:
            # These are the exact parameters frontend sends
            files = {'file': (test_image_name, f, 'image/png')}
            data = {
                'operation': 'upscaling',  # Fixed operation name
                'model': 'realesrgan_4x'   # Default model from frontend
            }
            
            print(f"   📤 Sending request...")
            print(f"   📋 Operation: {data['operation']}")
            print(f"   📋 Model: {data['model']}")
            
            start_time = time.time()
            response = requests.post('http://localhost:8000/api/v1/process', 
                                   files=files, data=data, timeout=120)
            end_time = time.time()
            
            print(f"   ⏱️  Processing took: {end_time - start_time:.2f} seconds")
            print(f"   📨 HTTP Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ SUCCESS!")
                
                # Print the exact structure frontend expects
                print(f"\n📋 Response Structure (what frontend sees):")
                print(f"   - result.status: {result.get('status')}")
                print(f"   - result.message: {result.get('message')}")
                
                # Check nested result structure
                inner_result = result.get('result')
                if inner_result:
                    print(f"   - result.result.status: {inner_result.get('status')}")
                    print(f"   - result.result.output_filename: {inner_result.get('output_filename')}")
                    print(f"   - result.result.output_path: {inner_result.get('output_path')}")
                    
                    # Step 4: Test file creation
                    output_path = inner_result.get('output_path')
                    output_filename = inner_result.get('output_filename')
                    
                    if output_path and os.path.exists(output_path):
                        file_size = os.path.getsize(output_path)
                        print(f"   ✅ Output file exists: {file_size} bytes")
                        
                        # Check dimensions
                        with Image.open(output_path) as processed_img:
                            print(f"   📏 Original: {img.size} → Processed: {processed_img.size}")
                            scale_factor = processed_img.width / img.width
                            print(f"   🔍 Scale factor: {scale_factor}x")
                    else:
                        print(f"   ❌ Output file missing: {output_path}")
                        return False
                    
                    # Step 5: Test download endpoint (what frontend uses)
                    if output_filename:
                        print(f"\n4️⃣ Testing download endpoint...")
                        download_url = f"http://localhost:8000/api/v1/download/{output_filename}"
                        print(f"   📥 URL: {download_url}")
                        
                        download_response = requests.get(download_url)
                        if download_response.status_code == 200:
                            print(f"   ✅ Download works: {len(download_response.content)} bytes")
                            
                            # Save downloaded file to verify
                            with open('downloaded_test.jpg', 'wb') as f:
                                f.write(download_response.content)
                            print(f"   💾 Saved as downloaded_test.jpg")
                            
                            print(f"\n🎉 COMPLETE SUCCESS!")
                            print(f"✅ Backend processing: Working")
                            print(f"✅ File generation: Working")
                            print(f"✅ Download endpoint: Working")
                            print(f"✅ Frontend should work perfectly!")
                            
                            return True
                        else:
                            print(f"   ❌ Download failed: {download_response.status_code}")
                            return False
                    else:
                        print(f"   ❌ No output filename provided")
                        return False
                else:
                    print(f"   ❌ No 'result' in response!")
                    print(f"   📋 Keys: {list(result.keys())}")
                    return False
            else:
                print(f"   ❌ HTTP ERROR: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                return False
                
    except requests.exceptions.Timeout:
        print(f"   ❌ Request timeout!")
        return False
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False
    
    finally:
        # Cleanup
        for file in [test_image_name, 'downloaded_test.jpg']:
            if os.path.exists(file):
                try:
                    os.remove(file)
                except:
                    pass

if __name__ == "__main__":
    success = test_complete_user_workflow()
    print("\n" + "=" * 50)
    if success:
        print("🎉 USER WORKFLOW IS WORKING!")
        print("The frontend should now work perfectly for upscaling!")
    else:
        print("❌ WORKFLOW STILL BROKEN!")
        print("There's still an issue that needs to be fixed.")
    print("=" * 50)
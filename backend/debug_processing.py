"""
Test the processing endpoint with a real image to debug the issue
"""

import requests
import json
import os

def test_processing():
    """Test the /api/v1/process endpoint with proper parameters"""
    
    # Check if there's a test image
    test_image_path = "downloaded_test.jpg"
    if not os.path.exists(test_image_path):
        test_image_path = "test_image.jpg"
        if not os.path.exists(test_image_path):
            print("❌ No test images found")
            return
    
    print(f"🧪 Testing processing endpoint with {test_image_path}")
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': (test_image_path, f, 'image/jpeg')}
            data = {
                'operation': 'upscale',
                'model': 'realesrgan_4x'
            }
            
            print("📤 Sending request to /api/v1/process...")
            print(f"   Operation: {data['operation']}")
            print(f"   Model: {data['model']}")
            
            response = requests.post(
                'http://localhost:8000/api/v1/process', 
                files=files, 
                data=data,
                timeout=60  # 1 minute timeout
            )
            
            print(f"📨 Response Status: {response.status_code}")
            print(f"📨 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    print("✅ Processing successful!")
                    print(f"📋 Response: {json.dumps(result, indent=2)}")
                    
                    # Check if output path exists
                    if 'result' in result and 'output_path' in result['result']:
                        output_path = result['result']['output_path']
                        if os.path.exists(output_path):
                            print(f"✅ Output file exists: {output_path}")
                        else:
                            print(f"❌ Output file missing: {output_path}")
                    
                except json.JSONDecodeError:
                    print(f"❌ Response is not valid JSON: {response.text}")
            else:
                print(f"❌ Processing failed: {response.status_code}")
                print(f"📄 Error response: {response.text}")
                
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 60 seconds")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure backend is running on localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_processing()
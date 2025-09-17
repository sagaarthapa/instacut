"""
Test the current 422 error with a simple upload
"""

import requests
import json

def test_upload_with_missing_fields():
    """Test upload without operation and model fields"""
    print("🧪 Testing upload with missing fields (should get 422)")
    
    # Create a simple test file
    test_file_content = b"fake image content"
    
    files = {'file': ('test.jpg', test_file_content, 'image/jpeg')}
    
    try:
        response = requests.post('http://localhost:8000/api/upload', files=files)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server on localhost:8000")
        print("Make sure a backend server is running!")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_upload_with_all_fields():
    """Test upload with all required fields"""
    print("\n🧪 Testing upload with all required fields")
    
    # Create a simple test file
    test_file_content = b"fake image content"
    
    files = {'file': ('test.jpg', test_file_content, 'image/jpeg')}
    data = {
        'operation': 'upscale',
        'model': 'realesrgan_4x'
    }
    
    try:
        response = requests.post('http://localhost:8000/api/upload', files=files, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server on localhost:8000")
        print("Make sure a backend server is running!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_upload_with_missing_fields()
    test_upload_with_all_fields()
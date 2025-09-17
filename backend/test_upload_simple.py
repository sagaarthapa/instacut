import requests
from PIL import Image
import io

# Create a simple test image
def create_test_image():
    """Create a simple 100x100 test image"""
    img = Image.new('RGB', (100, 100), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_upload_endpoint():
    """Test the upload endpoint directly"""
    try:
        print("Creating test image...")
        test_image = create_test_image()
        
        print("Sending request to upload endpoint...")
        
        # Prepare the request
        files = {
            'file': ('test_upload.png', test_image, 'image/png')
        }
        
        # Send request
        response = requests.post(
            'http://localhost:8000/api/upload',
            files=files,
            timeout=30
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Result: {result}")
            return True
        else:
            print(f"Error response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the server running on port 8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing upload endpoint...")
    success = test_upload_endpoint()
    if success:
        print("✅ Upload endpoint is working!")
    else:
        print("❌ Upload endpoint has issues!")
import requests
import io
from PIL import Image
import os

# Create a simple test image
def create_test_image():
    """Create a simple 100x100 test image"""
    img = Image.new('RGB', (100, 100), color='red')
    
    # Add some pattern to make upscaling visible
    for i in range(0, 100, 10):
        for j in range(0, 100, 10):
            if (i + j) % 20 == 0:
                for x in range(i, min(i+10, 100)):
                    for y in range(j, min(j+10, 100)):
                        img.putpixel((x, y), (0, 255, 0))
    
    # Save as bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_upscaling_endpoint():
    """Test the upscaling endpoint directly"""
    try:
        print("Creating test image...")
        test_image = create_test_image()
        
        print("Sending request to upscaling endpoint...")
        
        # Prepare the request
        files = {
            'file': ('test.png', test_image, 'image/png')
        }
        data = {
            'operation': 'upscaling',
            'model': 'realesrgan_2x',
            'options': '{}'
        }
        
        # Send request with longer timeout
        response = requests.post(
            'http://localhost:8000/api/v1/process',
            files=files,
            data=data,
            timeout=120  # 2 minute timeout
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Result: {result}")
        else:
            print(f"Error response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the server running on port 8000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing upscaling endpoint...")
    test_upscaling_endpoint()
import requests
import io
from PIL import Image

def test_simple_processing():
    """Test if the backend can receive and process a simple request"""
    try:
        print("🔍 Testing backend connectivity...")
        
        # Test basic connectivity
        response = requests.get('http://localhost:8000/')
        print(f"✅ Backend connectivity: {response.status_code}")
        
        # Create a very small test image
        print("🖼️ Creating simple test image...")
        img = Image.new('RGB', (50, 50), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        print("📤 Sending upscaling request...")
        files = {'file': ('test.png', img_bytes, 'image/png')}
        data = {
            'operation': 'upscaling',
            'model': 'realesrgan_2x',
            'options': '{}'
        }
        
        # Send with shorter timeout first
        response = requests.post(
            'http://localhost:8000/api/v1/process',
            files=files,
            data=data,
            timeout=30  # 30 second test timeout
        )
        
        print(f"📨 Response status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Processing result: {result}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - backend might be taking too long")
    except requests.exceptions.ConnectionError:
        print("🔌 Connection error - backend might not be running")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_simple_processing()
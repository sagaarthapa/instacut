import requests
import os

def test_upscaling_with_progress():
    """Test upscaling endpoint with fixed PIL fallback"""
    backend_url = "http://localhost:8000"
    
    # Use a simple test image (we'll use a small placeholder)
    test_image_path = "test_image.png"
    
    # Create a simple test image
    from PIL import Image
    img = Image.new('RGB', (100, 100), color='red')
    img.save(test_image_path)
    print(f"✅ Created test image: {test_image_path}")
    
    try:
        # Upload and process the image
        with open(test_image_path, 'rb') as f:
            files = {'file': (test_image_path, f, 'image/png')}
            data = {
                'operation': 'upscaling',
                'model': 'realesrgan_2x'
            }
            
            print("🚀 Starting upscaling request...")
            response = requests.post(
                f"{backend_url}/api/v1/process",
                files=files,
                data=data,
                timeout=60  # 1 minute timeout for test
            )
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Upscaling successful!")
            print(f"� Full result: {result}")
            print(f"�📁 Output file: {result.get('result', {}).get('output_path')}")
            print(f"⏱️  Processing time: {result.get('processing_time', 'Unknown')}")
            
            # Check if output file exists using the correct path
            output_path = result.get('result', {}).get('output_path', '')
            if output_path and os.path.exists(output_path):
                print(f"✅ Output file exists: {output_path}")
                # Check file size
                size = os.path.getsize(output_path)
                print(f"📊 Output file size: {size} bytes")
            else:
                print(f"❌ Output file not found: {output_path}")
                # List processed directory contents
                if os.path.exists('processed'):
                    files = os.listdir('processed')
                    print(f"📂 Files in processed directory: {files}")
                else:
                    print("📂 Processed directory does not exist")
        else:
            print(f"❌ Upscaling failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out after 1 minute")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Clean up test image
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print(f"🧹 Cleaned up test image")

if __name__ == "__main__":
    test_upscaling_with_progress()
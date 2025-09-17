import requests
import os
import time
from PIL import Image

def test_real_esrgan():
    """Test Real-ESRGAN with a more realistic image"""
    backend_url = "http://localhost:8000"
    
    # Create a more complex test image with patterns that will show AI enhancement
    test_image_path = "detailed_test.png"
    
    # Create a more detailed test image
    img = Image.new('RGB', (50, 50), color='white')
    # Add some patterns that will show enhancement differences
    pixels = img.load()
    for i in range(50):
        for j in range(50):
            # Create a pattern that should benefit from AI upscaling
            if (i + j) % 10 < 3:
                pixels[i, j] = (255, 0, 0)  # Red
            elif (i + j) % 10 < 6:
                pixels[i, j] = (0, 255, 0)  # Green
            else:
                pixels[i, j] = (0, 0, 255)  # Blue
    
    img.save(test_image_path)
    print(f"✅ Created detailed test image: {test_image_path} ({img.size})")
    
    try:
        start_time = time.time()
        
        # Upload and process the image
        with open(test_image_path, 'rb') as f:
            files = {'file': (test_image_path, f, 'image/png')}
            data = {
                'operation': 'upscaling',
                'model': 'realesrgan_2x'
            }
            
            print("🚀 Starting detailed upscaling request...")
            response = requests.post(
                f"{backend_url}/api/v1/process",
                files=files,
                data=data,
                timeout=120  # 2 minutes timeout for Real-ESRGAN
            )
            
        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upscaling successful!")
            print(f"⏱️  Client-side processing time: {processing_time:.2f}s")
            print(f"📊 Server reported time: {result.get('processing_time', 'Unknown')}")
            
            # Check if output file exists
            output_path = result.get('result', {}).get('output_path', '')
            if output_path and os.path.exists(output_path):
                print(f"✅ Output file exists: {output_path}")
                # Check file size and dimensions
                size = os.path.getsize(output_path)
                out_img = Image.open(output_path)
                print(f"📊 Output file size: {size} bytes")
                print(f"📐 Output dimensions: {out_img.size}")
                print(f"📈 Scale achieved: {out_img.size[0]/50:.1f}x")
                
                # If processing was fast (<5s), it likely used PIL fallback
                # If processing took longer (>10s), it likely used Real-ESRGAN
                if processing_time < 5:
                    print("⚠️  Fast processing suggests PIL fallback was used")
                else:
                    print("🎯 Slower processing suggests Real-ESRGAN was used")
                    
            else:
                print(f"❌ Output file not found: {output_path}")
        else:
            print(f"❌ Upscaling failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - this might indicate Real-ESRGAN is working but taking time")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Clean up test image
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print(f"🧹 Cleaned up test image")

if __name__ == "__main__":
    test_real_esrgan()
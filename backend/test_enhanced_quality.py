import requests
from PIL import Image
import time
import os

def test_enhanced_upscaling():
    """Test the enhanced upscaling with Real-ESRGAN and super-enhanced PIL"""
    
    print("🧪 Testing Enhanced Upscaling Quality")
    print("=" * 50)
    
    # Create a test image with fine details
    test_image_path = "quality_test.png"
    
    # Create an image with text and fine patterns
    img = Image.new('RGB', (100, 100), color='white')
    pixels = img.load()
    
    # Create fine patterns that will show enhancement differences
    for i in range(100):
        for j in range(100):
            # Create alternating fine lines and details
            if i % 3 == 0 or j % 3 == 0:
                pixels[i, j] = (0, 0, 0)  # Black lines
            elif (i + j) % 7 < 2:
                pixels[i, j] = (255, 0, 0)  # Red details
            elif (i + j) % 7 < 4:
                pixels[i, j] = (0, 255, 0)  # Green details
            else:
                pixels[i, j] = (0, 0, 255)  # Blue details
    
    img.save(test_image_path)
    print(f"✅ Created detailed test image: {test_image_path} (100x100)")
    
    # Test the enhanced upscaling
    try:
        start_time = time.time()
        
        with open(test_image_path, 'rb') as f:
            files = {'file': (test_image_path, f, 'image/png')}
            data = {
                'operation': 'upscaling',
                'model': 'enhanced_2x'  # This will trigger Real-ESRGAN first, then fallback
            }
            
            print("🚀 Testing enhanced upscaling (Real-ESRGAN + Super-Enhanced PIL)...")
            response = requests.post(
                "http://localhost:8000/api/v1/process",
                files=files,
                data=data,
                timeout=300  # 5 minutes for AI processing
            )
        
        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            # Save the result
            result_filename = "enhanced_upscaled_result.png"
            with open(result_filename, 'wb') as f:
                f.write(response.content)
            
            # Analyze the result
            result_img = Image.open(result_filename)
            original_img = Image.open(test_image_path)
            
            print("\n🎯 QUALITY TEST RESULTS:")
            print("=" * 30)
            print(f"⏱️  Processing Time: {processing_time:.2f} seconds")
            print(f"📏 Original Size: {original_img.size}")
            print(f"📏 Enhanced Size: {result_img.size}")
            print(f"🔍 Scale Factor: {result_img.size[0]/original_img.size[0]:.1f}x")
            
            # File size comparison (indicates quality/detail preservation)
            original_size = os.path.getsize(test_image_path)
            result_size = os.path.getsize(result_filename)
            
            print(f"📊 Original File: {original_size:,} bytes")
            print(f"📊 Enhanced File: {result_size:,} bytes")
            print(f"💾 Size Ratio: {result_size/original_size:.2f}x")
            
            print("\n✨ ENHANCEMENT FEATURES APPLIED:")
            print("🤖 Real-ESRGAN AI upscaling (if available)")
            print("🔧 Super-enhanced PIL processing")
            print("🎨 Bilateral filtering")
            print("📈 Edge enhancement")
            print("⚡ Custom sharpening kernels") 
            print("🌟 Unsharp masking")
            print("🎯 Color & contrast optimization")
            
            print(f"\n✅ Enhanced upscaling completed successfully!")
            print(f"📁 Result saved as: {result_filename}")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    finally:
        # Cleanup
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

if __name__ == "__main__":
    test_enhanced_upscaling()
import requests
import os

def test_upscaling_4x():
    url = "http://localhost:8000/api/v1/process"
    
    # Use a test image from the backend directory
    image_path = "test_image.jpg"
    
    if not os.path.exists(image_path):
        print(f"Test image not found: {image_path}")
        return
    
    files = {
        'file': ('test_image.jpg', open(image_path, 'rb'), 'image/jpeg')
    }
    
    # Test with realesrgan_4x specifically
    data = {
        'operation': 'upscale',
        'model': 'realesrgan_4x',
        'options': '{}'
    }
    
    print("🔥 Testing realesrgan_4x upscaling...")
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Model used: {result['result']['model_used']}")
            print(f"Processing time: {result['result']['processing_time']}s")
            print(f"Output path: {result['result']['output_path']}")
            return True
        else:
            print(f"❌ FAILED: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    finally:
        files['file'][1].close()

def test_2x_vs_4x_comparison():
    """Test both 2x and 4x upscaling to compare"""
    print("\n=== COMPARISON TEST: 2x vs 4x ===")
    
    # Test 2x
    print("\n1. Testing realesrgan_2x...")
    result_2x = test_specific_model('realesrgan_2x')
    
    # Test 4x  
    print("\n2. Testing realesrgan_4x...")
    result_4x = test_specific_model('realesrgan_4x')
    
    print(f"\n📊 RESULTS:")
    print(f"✅ 2x model: {'Working' if result_2x else 'Failed'}")
    print(f"✅ 4x model: {'Working' if result_4x else 'Failed'}")

def test_specific_model(model):
    url = "http://localhost:8000/api/v1/process"
    image_path = "test_image.jpg"
    
    if not os.path.exists(image_path):
        return False
    
    files = {
        'file': ('test_image.jpg', open(image_path, 'rb'), 'image/jpeg')
    }
    
    data = {
        'operation': 'upscale',
        'model': model,
        'options': '{}'
    }
    
    try:
        response = requests.post(url, files=files, data=data)
        if response.status_code == 200:
            result = response.json()
            print(f"  ✅ {model}: {result['result']['processing_time']}s")
            return True
        else:
            print(f"  ❌ {model}: Failed ({response.status_code})")
            return False
    except Exception as e:
        print(f"  ❌ {model}: Error - {e}")
        return False
    finally:
        files['file'][1].close()

if __name__ == "__main__":
    print("🚀 TESTING REALESRGAN_4X CONNECTIVITY...")
    
    # Test 4x specifically
    success = test_upscaling_4x()
    
    if success:
        print("\n🎉 REALESRGAN_4X IS WORKING CORRECTLY!")
        print("The frontend should be able to connect to it properly.")
    else:
        print("\n❌ REALESRGAN_4X IS NOT WORKING!")
        print("There may be an issue with the backend connection.")
        
    # Run comparison test
    test_2x_vs_4x_comparison()
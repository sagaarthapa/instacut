"""
Test upscaling functionality
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from ai_services import AIServiceOrchestrator
from PIL import Image
import numpy as np

async def test_upscaling():
    print("🧪 Testing Upscaling Functionality")
    
    # Create test image
    test_img = Image.fromarray(np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8))
    test_path = "test_image_small.png"
    test_img.save(test_path)
    print(f"✅ Created test image: {test_img.size}")
    
    # Initialize AI orchestrator
    ai_orchestrator = AIServiceOrchestrator()
    
    # Test upscaling
    result = await ai_orchestrator.process_image(
        test_path,
        "upscaling",
        "realesrgan_4x"
    )
    
    print(f"📊 Processing result: {result['status']}")
    
    if result["status"] == "success":
        output_path = result["output_path"]
        
        # Check output image size
        if Path(output_path).exists():
            output_img = Image.open(output_path)
            print(f"🔍 Original size: {test_img.size}")
            print(f"🔍 Upscaled size: {output_img.size}")
            
            expected_size = (test_img.size[0] * 4, test_img.size[1] * 4)
            if output_img.size == expected_size:
                print("✅ SUCCESS: Image was properly upscaled!")
            else:
                print(f"❌ FAIL: Expected {expected_size}, got {output_img.size}")
        else:
            print("❌ FAIL: Output file not created")
    else:
        print(f"❌ FAIL: {result.get('error', 'Unknown error')}")
    
    # Cleanup
    Path(test_path).unlink(missing_ok=True)
    if 'output_path' in result:
        Path(result['output_path']).unlink(missing_ok=True)

if __name__ == "__main__":
    asyncio.run(test_upscaling())
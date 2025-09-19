#!/usr/bin/env python3
"""
Direct test of photo restoration parameter fixes
"""
import sys
import os
import cv2
import numpy as np
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from modules.photo_restoration.photo_restoration_engine import PhotoRestorationEngine

def test_photo_restoration_direct():
    """Test photo restoration engine directly"""
    print("🧪 Testing Photo Restoration Engine directly...")
    
    # Initialize the engine
    try:
        engine = PhotoRestorationEngine()
        print("✅ Photo Restoration Engine initialized")
    except Exception as e:
        print(f"❌ Failed to initialize engine: {e}")
        return False
    
    # Create a test image
    test_image_path = "test_image_direct.jpg"
    test_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    cv2.imwrite(test_image_path, test_image)
    print(f"✅ Created test image: {test_image_path}")
    
    # Test basic enhancement methods that don't require GFPGAN
    methods_to_test = ['basic_sharpen', 'contrast_enhance']
    
    for method in methods_to_test:
        try:
            print(f"\n📤 Testing method: {method}")
            
            # This is the call signature that the orchestrator uses
            output_path, metadata = engine.restore_photo(
                image_path=test_image_path,
                method=method,
                scale=2,
                output_path=f"test_output_{method}.jpg"
            )
            
            if output_path and os.path.exists(output_path):
                print(f"✅ {method} successful!")
                print(f"📁 Output saved to: {output_path}")
                print(f"📋 Metadata: {metadata}")
            else:
                print(f"❌ {method} failed - no output file created")
                return False
                
        except Exception as e:
            print(f"❌ {method} failed with exception: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    print("\n🧹 Cleaning up test files...")
    for file in [test_image_path] + [f"test_output_{method}.jpg" for method in methods_to_test]:
        if os.path.exists(file):
            os.remove(file)
    
    return True

if __name__ == "__main__":
    print("🚀 Starting direct photo restoration parameter test...")
    success = test_photo_restoration_direct()
    
    if success:
        print("\n🎉 Direct photo restoration test passed!")
        print("✅ Parameter fixes are working correctly.")
        print("📋 The orchestrator can now properly call photo restoration methods.")
    else:
        print("\n💥 Direct test failed! There are still parameter issues.")
#!/usr/bin/env python3
"""Test the restored upscaler functionality"""

import sys
import asyncio
import logging
from modules.upscaler.upscaler_engine import UpscalerEngine

# Setup logging
logging.basicConfig(level=logging.INFO)

async def test_upscaler():
    print("🔧 Testing Restored Upscaler Engine")
    print("=" * 50)
    
    try:
        # Initialize engine
        engine = UpscalerEngine()
        print("✅ UpscalerEngine initialized successfully")
        
        # Show available models
        available = engine.get_available_models()
        print(f"\n📋 Available Models ({len(available)}):")
        for model, info in available.items():
            status = "✅" if info['available'] else "❌"
            print(f"  {status} {model}: scale={info['scale']}x, quality={info['quality']}")
        
        # Test best model selection
        best = engine._select_best_model()
        print(f"\n🏆 Best model selected: {best}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_upscaler())
    if not success:
        sys.exit(1)
    print("\n🎉 All tests passed!")
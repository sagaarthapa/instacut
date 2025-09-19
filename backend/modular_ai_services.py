"""
Modular AI Services Orchestrator
Coordinates independent AI modules without dependencies conflicts
"""

import logging
import time
import json
import asyncio
from typing import Dict, Any, Optional
from pathlib import Path

# Import independent modules
from modules.background_remover import BackgroundRemover
from modules.upscaler import UpscalerEngine
from modules.photo_restoration import PhotoRestorationEngine

logger = logging.getLogger(__name__)


class ModularAIOrchestrator:
    """
    Modular AI Services Orchestrator
    Each AI tool is independent with its own dependencies
    """
    
    def __init__(self):
        self.modules = {}
        self._initialize_modules()
    
    def _initialize_modules(self):
        """Initialize all independent modules"""
        try:
            # Initialize Background Remover
            logger.info("Initializing Background Remover module...")
            self.modules['background_remover'] = BackgroundRemover()
            
            # Initialize Upscaler Engine
            logger.info("Initializing Upscaler Engine module...")
            self.modules['upscaler'] = UpscalerEngine()
            
            # Initialize Photo Restoration Engine
            logger.info("Initializing Photo Restoration Engine module...")
            self.modules['photo_restoration'] = PhotoRestorationEngine()
            
            logger.info(f"✅ Modular AI Orchestrator initialized with {len(self.modules)} modules")
            
        except Exception as e:
            logger.error(f"Failed to initialize modules: {e}")
            self.modules = {}
    
    def get_available_services(self) -> Dict[str, Any]:
        """Get all available AI services from all modules"""
        services = {}
        
        # Background removal services
        if 'background_remover' in self.modules:
            bg_methods = self.modules['background_remover'].get_available_methods()
            services['background_removal'] = {
                method: {'available': True, 'type': 'background_removal'}
                for method in bg_methods.keys()
            }
        
        # Upscaling services
        if 'upscaler' in self.modules:
            upscale_models = self.modules['upscaler'].get_available_models()
            services['upscaling'] = {
                model: {'available': True, 'type': 'upscaling', 'scale': info['scale']}
                for model, info in upscale_models.items()
            }
        
        # Photo restoration services
        if 'photo_restoration' in self.modules:
            restoration_methods = self.modules['photo_restoration'].get_available_restoration_methods()
            services['photo_restoration'] = {
                method: {'available': True, 'type': 'photo_restoration'}
                for method in restoration_methods.keys()
            }
        
        return services
    
    async def process_image(
        self,
        image_path: str,
        operation: str,
        model: Optional[str] = None,
        options: str = "{}"
    ) -> Dict[str, Any]:
        """
        Process image using the appropriate independent module
        
        Args:
            image_path: Path to input image
            operation: Operation type ('background_removal', 'upscaling')
            model: Specific model/method to use
            options: JSON string with additional options
        
        Returns:
            Processing result dictionary
        """
        start_time = time.time()
        
        try:
            # Parse options
            try:
                parsed_options = json.loads(options)
            except:
                parsed_options = {}
            
            # Create output directory
            Path("processed").mkdir(exist_ok=True)
            
            # Generate output filename
            input_path = Path(image_path)
            
            if operation == "background_removal":
                output_filename = f"bg_removed_{model or 'auto'}_{input_path.stem}.png"
                output_path = f"processed/{output_filename}"
                
                # Use Background Remover module
                if 'background_remover' in self.modules:
                    success = self.modules['background_remover'].remove_background(
                        image_path, output_path, model or 'auto'
                    )
                    
                    if success:
                        processing_time = time.time() - start_time
                        return {
                            "status": "success",
                            "output_path": output_path,
                            "output_filename": output_filename,
                            "model_used": model or 'auto',
                            "operation": operation,
                            "processing_time": round(processing_time, 2),
                            "module": "background_remover",
                            "metadata": {
                                "input_file": input_path.name,
                                "method": model or 'auto'
                            }
                        }
                    else:
                        raise Exception("Background removal failed")
                else:
                    raise Exception("Background Remover module not available")
            
            elif operation == "upscaling":
                output_filename = f"upscaled_{model or 'auto'}_{input_path.stem}.jpg"
                output_path = f"processed/{output_filename}"
                
                # Use Upscaler Engine module
                if 'upscaler' in self.modules:
                    success = await self.modules['upscaler'].upscale_image(
                        image_path, output_path, model or 'auto'
                    )
                    
                    if success:
                        processing_time = time.time() - start_time
                        return {
                            "status": "success",
                            "output_path": output_path,
                            "output_filename": output_filename,
                            "model_used": model or 'auto',
                            "operation": operation,
                            "processing_time": round(processing_time, 2),
                            "module": "upscaler",
                            "metadata": {
                                "input_file": input_path.name,
                                "model": model or 'auto'
                            }
                        }
                    else:
                        raise Exception("Image upscaling failed")
                else:
                    raise Exception("Upscaler Engine module not available")
            
            elif operation == "photo_restoration":
                output_filename = f"restored_{model or 'auto'}_{input_path.stem}.jpg"
                output_path = f"processed/{output_filename}"
                
                # Use Photo Restoration Engine module
                if 'photo_restoration' in self.modules:
                    # Parse options for scale
                    try:
                        parsed_options = json.loads(options)
                        scale = parsed_options.get('scale', 2)
                    except:
                        scale = 2
                    
                    # Call photo restoration (returns tuple: output_path, metadata)
                    output_path_result, metadata = self.modules['photo_restoration'].restore_photo(
                        image_path=image_path,
                        method=model or 'gfpgan_face_restore',
                        scale=scale,
                        output_path=output_path
                    )
                    
                    if output_path_result:
                        processing_time = time.time() - start_time
                        return {
                            "status": "success",
                            "output_path": output_path_result,
                            "output_filename": output_filename,
                            "model_used": model or 'gfpgan_face_restore',
                            "operation": operation,
                            "processing_time": round(processing_time, 2),
                            "module": "photo_restoration",
                            "metadata": {
                                "input_file": input_path.name,
                                "method": model or 'gfpgan_face_restore',
                                "faces_restored": metadata.get('faces_restored', 0),
                                "enhancement_applied": metadata.get('enhancement_applied', False)
                            }
                        }
                    else:
                        error_msg = metadata.get('error', 'Photo restoration failed') if metadata else 'Photo restoration failed'
                        raise Exception(error_msg)
                else:
                    raise Exception("Photo Restoration Engine module not available")
            
            else:
                raise Exception(f"Unknown operation: {operation}")
            
        except Exception as e:
            logger.error(f"Processing failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "processing_time": time.time() - start_time,
                "operation": operation,
                "model_attempted": model or "auto"
            }
    
    def get_module_info(self, module_name: str) -> Dict[str, Any]:
        """Get information about a specific module"""
        if module_name in self.modules:
            return self.modules[module_name].get_module_info()
        else:
            return {"error": f"Module {module_name} not found"}
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get overall system information"""
        services = self.get_available_services()
        
        total_services = sum(len(category) for category in services.values())
        
        return {
            "orchestrator": "Modular AI Services",
            "version": "2.0.0",
            "architecture": "Independent Modules",
            "total_modules": len(self.modules),
            "total_services": total_services,
            "modules": {
                name: module.get_module_info() 
                for name, module in self.modules.items()
            },
            "services": services
        }
    
    def list_available_models(self) -> Dict[str, Any]:
        """List all available models from all modules"""
        models = {}
        services = self.get_available_services()
        
        for category, services_dict in services.items():
            models[category] = list(services_dict.keys())
        
        return models
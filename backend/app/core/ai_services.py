"""
AI Services Orchestrator - The brain of our superior image processing platform
This system intelligently routes requests between self-hosted and commercial APIs
Much more sophisticated than Pixelcut's simple API calls
"""

import asyncio
import time
from typing import Dict, List, Any, Optional, Union
from pathlib import Path
import json
import logging
from PIL import Image
import aiofiles
import aiohttp

# Import AI service classes
from .services.background_removal import BackgroundRemovalService
from .services.image_upscaling import ImageUpscalingService  
from .services.image_generation import ImageGenerationService
from .services.commercial_apis import CommercialAPIService
from .config import settings

logger = logging.getLogger(__name__)

class AIServiceOrchestrator:
    """
    Intelligent AI service orchestrator that provides superior functionality
    compared to Pixelcut's basic API integration
    """
    
    def __init__(self):
        self.services = {}
        self.routing_config = {}
        self.performance_metrics = {}
        self.fallback_chain = {}
        self.cost_tracker = {}
        
    async def initialize(self):
        """Initialize all AI services and load configurations"""
        try:
            # Initialize self-hosted services
            self.services['background_removal'] = BackgroundRemovalService()
            self.services['image_upscaling'] = ImageUpscalingService()
            self.services['image_generation'] = ImageGenerationService()
            
            # Initialize commercial API service
            self.services['commercial_apis'] = CommercialAPIService()
            
            # Load default routing configuration
            self.routing_config = {
                "background_removal": {
                    "primary": "self_hosted.rembg_u2net",
                    "fallback": ["self_hosted.rembg_birefnet", "commercial.remove_bg"],
                    "cost_threshold": 1000,  # Switch to commercial after 1000 operations
                    "performance_threshold": 10.0  # Switch if processing takes >10s
                },
                "image_upscaling": {
                    "primary": "self_hosted.realesrgan_x4",
                    "fallback": ["self_hosted.realesrgan_anime"],
                    "cost_threshold": 500,
                    "performance_threshold": 15.0
                },
                "image_generation": {
                    "primary": "self_hosted.stable_diffusion_xl",
                    "fallback": ["commercial.openai_dalle", "commercial.stability_ai"],
                    "cost_threshold": 100,
                    "performance_threshold": 30.0
                }
            }
            
            # Initialize all services
            for service in self.services.values():
                await service.initialize()
                
            logger.info("🚀 AI Services Orchestrator initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI services: {str(e)}")
            raise
    
    async def process_image(
        self, 
        file_path: str, 
        operations: List[str], 
        options: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Process image with intelligent routing and fallback handling
        Superior to Pixelcut's single-provider approach
        """
        if options is None:
            options = {}
            
        start_time = time.time()
        results = {}
        
        try:
            # Process each operation
            current_image_path = file_path
            
            for operation in operations:
                logger.info(f"Processing operation: {operation}")
                
                # Get the best service for this operation
                service_path = await self._get_optimal_service(operation, options)
                
                # Execute the operation
                result = await self._execute_operation(
                    operation=operation,
                    image_path=current_image_path,
                    service_path=service_path,
                    options=options
                )
                
                results[operation] = result
                current_image_path = result.get('output_path', current_image_path)
                
                # Update performance metrics
                self._update_metrics(service_path, result.get('processing_time', 0))
            
            total_time = time.time() - start_time
            
            return {
                "success": True,
                "results": results,
                "final_output": current_image_path,
                "processing_time": total_time,
                "operations_count": len(operations),
                "performance_score": self._calculate_performance_score(results)
            }
            
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time,
                "partial_results": results
            }
    
    async def _get_optimal_service(self, operation: str, options: Dict[str, Any]) -> str:
        """
        Intelligently select the best service for the operation
        This is where we surpass Pixelcut's simple routing
        """
        config = self.routing_config.get(operation, {})
        primary_service = config.get("primary")
        
        # Check if we should use primary service
        if await self._should_use_primary_service(operation, primary_service, options):
            return primary_service
            
        # Fall back to alternatives
        fallback_services = config.get("fallback", [])
        
        for fallback_service in fallback_services:
            if await self._is_service_available(fallback_service):
                logger.info(f"Using fallback service: {fallback_service}")
                return fallback_service
                
        # Default to primary if no fallbacks available
        return primary_service
    
    async def _execute_operation(
        self,
        operation: str,
        image_path: str,
        service_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute the actual AI operation with the selected service"""
        
        service_type, model_name = service_path.split(".", 1)
        
        if service_type == "self_hosted":
            return await self._execute_self_hosted_operation(
                operation, image_path, model_name, options
            )
        elif service_type == "commercial":
            return await self._execute_commercial_operation(
                operation, image_path, model_name, options
            )
        else:
            raise ValueError(f"Unknown service type: {service_type}")
    
    async def _execute_self_hosted_operation(
        self,
        operation: str,
        image_path: str,
        model_name: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute operation using self-hosted AI models"""
        
        start_time = time.time()
        
        try:
            if operation == "background_removal":
                service = self.services['background_removal']
                result = await service.remove_background(
                    image_path=image_path,
                    model_name=model_name,
                    options=options
                )
            elif operation == "image_upscaling":
                service = self.services['image_upscaling']
                result = await service.upscale_image(
                    image_path=image_path,
                    model_name=model_name,
                    scale_factor=options.get('scale_factor', 4),
                    options=options
                )
            elif operation == "image_generation":
                service = self.services['image_generation']
                result = await service.generate_image(
                    prompt=options.get('prompt', ''),
                    model_name=model_name,
                    options=options
                )
            else:
                raise ValueError(f"Unknown operation: {operation}")
            
            processing_time = time.time() - start_time
            result['processing_time'] = processing_time
            result['service_type'] = 'self_hosted'
            result['model_name'] = model_name
            result['cost'] = 0.001  # Minimal cost for self-hosted
            
            return result
            
        except Exception as e:
            logger.error(f"Self-hosted operation failed: {str(e)}")
            raise
    
    async def _execute_commercial_operation(
        self,
        operation: str,
        image_path: str,
        api_name: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute operation using commercial APIs"""
        
        start_time = time.time()
        
        try:
            service = self.services['commercial_apis']
            
            if operation == "background_removal" and api_name == "remove_bg":
                result = await service.remove_bg_api(image_path, options)
            elif operation == "image_generation" and api_name == "openai_dalle":
                result = await service.openai_dalle_api(
                    prompt=options.get('prompt', ''),
                    options=options
                )
            elif operation == "image_generation" and api_name == "stability_ai":
                result = await service.stability_ai_api(
                    prompt=options.get('prompt', ''),
                    options=options
                )
            else:
                raise ValueError(f"Unknown commercial API: {api_name}")
            
            processing_time = time.time() - start_time
            result['processing_time'] = processing_time
            result['service_type'] = 'commercial'
            result['api_name'] = api_name
            
            return result
            
        except Exception as e:
            logger.error(f"Commercial API operation failed: {str(e)}")
            raise
    
    async def _should_use_primary_service(
        self, 
        operation: str, 
        primary_service: str, 
        options: Dict[str, Any]
    ) -> bool:
        """
        Intelligent decision making for service selection
        This optimization is not available in Pixelcut
        """
        config = self.routing_config.get(operation, {})
        
        # Check cost threshold
        cost_threshold = config.get("cost_threshold", float('inf'))
        current_usage = self.cost_tracker.get(operation, {}).get("operations_count", 0)
        
        if current_usage >= cost_threshold:
            return False
        
        # Check performance threshold
        performance_threshold = config.get("performance_threshold", float('inf'))
        avg_performance = self.performance_metrics.get(primary_service, {}).get("avg_time", 0)
        
        if avg_performance > performance_threshold:
            return False
        
        # Check if service is available
        if not await self._is_service_available(primary_service):
            return False
        
        # Check for priority options
        if options.get("force_commercial", False):
            return "commercial" in primary_service
        
        if options.get("force_self_hosted", False):
            return "self_hosted" in primary_service
        
        return True
    
    async def _is_service_available(self, service_path: str) -> bool:
        """Check if a service is available and operational"""
        try:
            service_type, model_name = service_path.split(".", 1)
            
            if service_type == "self_hosted":
                # Check if self-hosted service is running
                service_name = model_name.split("_")[0]  # e.g., "rembg" from "rembg_u2net"
                service = self.services.get(service_name)
                return service is not None and await service.health_check()
                
            elif service_type == "commercial":
                # Check if commercial API is accessible
                commercial_service = self.services.get('commercial_apis')
                return commercial_service is not None and await commercial_service.health_check(model_name)
                
            return False
            
        except Exception as e:
            logger.error(f"Service availability check failed: {str(e)}")
            return False
    
    def _update_metrics(self, service_path: str, processing_time: float):
        """Update performance metrics for intelligent routing"""
        if service_path not in self.performance_metrics:
            self.performance_metrics[service_path] = {
                "total_time": 0,
                "operation_count": 0,
                "avg_time": 0
            }
        
        metrics = self.performance_metrics[service_path]
        metrics["total_time"] += processing_time
        metrics["operation_count"] += 1
        metrics["avg_time"] = metrics["total_time"] / metrics["operation_count"]
    
    def _calculate_performance_score(self, results: Dict[str, Any]) -> float:
        """Calculate overall performance score for the processing pipeline"""
        if not results:
            return 0.0
        
        total_time = sum(r.get('processing_time', 0) for r in results.values())
        success_count = sum(1 for r in results.values() if r.get('success', False))
        
        # Higher score is better
        success_rate = success_count / len(results)
        speed_score = max(0, 10 - total_time)  # 10 points max for speed
        
        return (success_rate * 50) + (speed_score * 50)
    
    async def configure_routing(self, config: Dict[str, Any]):
        """Configure AI service routing (admin endpoint)"""
        try:
            # Validate configuration
            for operation, op_config in config.items():
                if operation not in self.routing_config:
                    continue
                    
                # Update routing configuration
                self.routing_config[operation].update(op_config)
            
            logger.info("AI service routing configuration updated")
            
        except Exception as e:
            logger.error(f"Failed to configure routing: {str(e)}")
            raise
    
    def get_current_config(self) -> Dict[str, Any]:
        """Get current configuration and metrics"""
        return {
            "routing_config": self.routing_config,
            "performance_metrics": self.performance_metrics,
            "cost_tracker": self.cost_tracker,
            "available_services": list(self.services.keys())
        }
    
    async def preprocess_image(self, file_path: str):
        """Preprocess uploaded image for faster later processing"""
        try:
            # Generate thumbnails and metadata
            with Image.open(file_path) as img:
                # Create thumbnail
                thumbnail = img.copy()
                thumbnail.thumbnail((300, 300), Image.Resampling.LANCZOS)
                
                thumbnail_path = file_path.replace("uploads/", "temp/thumb_")
                thumbnail.save(thumbnail_path)
                
                # Save metadata
                metadata = {
                    "original_size": img.size,
                    "format": img.format,
                    "mode": img.mode,
                    "thumbnail_path": thumbnail_path
                }
                
                metadata_path = file_path.replace("uploads/", "temp/meta_").replace(".jpg", ".json").replace(".png", ".json")
                
                async with aiofiles.open(metadata_path, 'w') as f:
                    await f.write(json.dumps(metadata))
                    
                logger.info(f"Preprocessed image: {file_path}")
                
        except Exception as e:
            logger.error(f"Preprocessing failed: {str(e)}")
    
    async def cleanup(self):
        """Cleanup resources on shutdown"""
        try:
            for service in self.services.values():
                if hasattr(service, 'cleanup'):
                    await service.cleanup()
                    
            logger.info("AI services cleanup completed")
            
        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
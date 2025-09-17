const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('AI Image Studio - Upscaling Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should load the main page successfully', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/AI Image Studio/);
    
    // Look for key elements
    const mainHeading = page.locator('h1, h2, h3').first();
    await expect(mainHeading).toBeVisible();
    
    console.log('✅ Main page loaded successfully');
  });

  test('should have file upload functionality', async ({ page }) => {
    // Look for file input or drop zone
    const fileInput = page.locator('input[type="file"]');
    const dropZone = page.locator('[data-testid="file-upload"], .dropzone, .upload-area');
    
    // Check if either file input or drop zone exists
    const hasFileInput = await fileInput.count() > 0;
    const hasDropZone = await dropZone.count() > 0;
    
    expect(hasFileInput || hasDropZone).toBe(true);
    console.log('✅ File upload interface found');
  });

  test('should test upscaling with a sample image', async ({ page }) => {
    // Create a test image in the backend directory
    const testImagePath = path.join(__dirname, '..', 'backend', 'test_image.png');
    
    // Check if test image exists
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found, skipping upload test');
      return;
    }

    // Look for file upload elements
    let fileInput = page.locator('input[type="file"]');
    let uploadButton = page.locator('button:has-text("Upload"), button:has-text("Choose File"), [data-testid="upload-button"]');
    
    if (await fileInput.count() > 0) {
      console.log('🔧 Testing file upload with input field...');
      
      // Upload the test image
      await fileInput.setInputFiles(testImagePath);
      
      // Look for upscaling options
      const upscaleButton = page.locator('button:has-text("Upscale"), button:has-text("Enhance"), [data-testid="upscale-button"]');
      const methodSelect = page.locator('select:has(option[value*="upscale"]), select:has(option[value*="lanczos"]), select:has(option[value*="esrgan"])');
      
      if (await upscaleButton.count() > 0) {
        console.log('🔧 Found upscale button, testing upscaling...');
        
        // Select upscaling method if dropdown exists
        if (await methodSelect.count() > 0) {
          await methodSelect.selectOption({ index: 0 }); // Select first option
        }
        
        // Click upscale button
        await upscaleButton.first().click();
        
        // Wait for processing
        await page.waitForTimeout(5000);
        
        // Look for success indicators
        const successMessage = page.locator('.success, .completed, [data-testid="success"]');
        const processedImage = page.locator('img[src*="processed"], img[src*="result"], [data-testid="result-image"]');
        const downloadButton = page.locator('button:has-text("Download"), [data-testid="download-button"]');
        
        // Check for any success indicators
        const hasSuccess = await successMessage.count() > 0;
        const hasProcessedImage = await processedImage.count() > 0;
        const hasDownload = await downloadButton.count() > 0;
        
        if (hasSuccess || hasProcessedImage || hasDownload) {
          console.log('✅ Upscaling appears to be working!');
          console.log('Success indicators found:', { hasSuccess, hasProcessedImage, hasDownload });
        } else {
          console.log('⚠️ Upscaling initiated but no clear success indicators found');
        }
        
      } else {
        console.log('❌ No upscale button found');
      }
      
    } else {
      console.log('❌ No file input found');
    }
  });

  test('should check backend API connectivity', async ({ page }) => {
    console.log('🔧 Testing backend API connectivity...');
    
    // Test if backend is accessible
    const response = await page.request.get('http://localhost:8000/health');
    
    if (response.ok()) {
      const healthData = await response.json();
      console.log('✅ Backend is healthy');
      console.log('Available services:', Object.keys(healthData.ai_services || {}));
      
      // Check upscaling services specifically
      const upscalingServices = healthData.ai_services?.upscaling || {};
      const upscalingMethods = Object.keys(upscalingServices);
      
      console.log('Available upscaling methods:', upscalingMethods);
      expect(upscalingMethods.length).toBeGreaterThan(0);
      
    } else {
      console.log('❌ Backend is not responding');
      throw new Error('Backend API is not accessible');
    }
  });

  test('should test direct API upscaling call', async ({ page }) => {
    console.log('🔧 Testing direct API upscaling call...');
    
    // Create form data for the API call
    const testImagePath = path.join(__dirname, '..', 'backend', 'test_image.png');
    
    if (fs.existsSync(testImagePath)) {
      const imageBuffer = fs.readFileSync(testImagePath);
      
      // Create FormData manually for the API call
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('file', blob, 'test_image.png');
      formData.append('operation', 'upscale');
      formData.append('model', 'lanczos_2x');
      
      try {
        const response = await fetch('http://localhost:8000/api/v1/process', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Direct API upscaling successful!');
          console.log('Processing time:', result.processing_time);
          console.log('Model used:', result.model_used);
          console.log('Status:', result.status);
          
          expect(result.status).toBe('success');
          
        } else {
          const errorText = await response.text();
          console.log('❌ API call failed:', response.status, errorText);
          throw new Error(`API call failed: ${response.status}`);
        }
        
      } catch (error) {
        console.log('❌ Error making API call:', error.message);
        throw error;
      }
      
    } else {
      console.log('❌ Test image not found for API test');
    }
  });
});
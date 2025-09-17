const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('AI Image Studio - Frontend-Backend Connection Test', () => {

  test('should test complete upscaling workflow with monitoring', async ({ page }) => {
    console.log('🔧 Testing complete upscaling workflow...');
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Monitor network requests
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      if (request.url().includes('localhost:8000')) {
        console.log('📤 Frontend Request:', request.method(), request.url());
        requests.push({
          method: request.method(),
          url: request.url(),
          headers: Object.fromEntries(request.headers())
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('localhost:8000')) {
        console.log('📨 Backend Response:', response.status(), response.url());
        responses.push({
          status: response.status(),
          url: response.url(),
          statusText: response.statusText()
        });
      }
    });
    
    // Monitor console logs from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Frontend Error:', msg.text());
      } else if (msg.text().includes('🚀') || msg.text().includes('📤') || msg.text().includes('📨') || msg.text().includes('❌')) {
        console.log('📋 Frontend Log:', msg.text());
      }
    });
    
    // Create test image path
    const testImagePath = path.join(__dirname, '..', 'backend', 'test_image.png');
    
    try {
      // Look for file input
      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        console.log('📁 Uploading test image...');
        await fileInput.setInputFiles(testImagePath);
        
        // Wait a moment for upload processing
        await page.waitForTimeout(2000);
        
        // Look for upscaling option and select it
        const operationSelect = page.locator('select').first();
        if (await operationSelect.count() > 0) {
          await operationSelect.selectOption('upscale');
          console.log('🔧 Selected upscale operation');
        }
        
        // Look for model selection
        const modelSelect = page.locator('select').nth(1);
        if (await modelSelect.count() > 0) {
          await modelSelect.selectOption({ index: 0 }); // Select first available model
          console.log('🎯 Selected upscaling model');
        }
        
        // Look for process/start button
        const processButton = page.locator('button:has-text("Process"), button:has-text("Start"), button:has-text("Enhance"), button:has-text("Begin")');
        
        if (await processButton.count() > 0) {
          console.log('⚡ Found process button, starting processing...');
          
          // Click the process button
          await processButton.first().click();
          
          // Wait for processing to complete or timeout after 60 seconds
          console.log('⏳ Waiting for processing...');
          await page.waitForTimeout(60000);
          
          // Check final results
          console.log('📊 Final Results:');
          console.log('Requests made:', requests.length);
          console.log('Responses received:', responses.length);
          
          requests.forEach((req, i) => {
            console.log(`Request ${i + 1}: ${req.method} ${req.url}`);
          });
          
          responses.forEach((res, i) => {
            console.log(`Response ${i + 1}: ${res.status} ${res.statusText} - ${res.url}`);
          });
          
          // Look for success indicators
          const successElements = await page.locator('.success, [data-success], button:has-text("Download")').count();
          const errorElements = await page.locator('.error, [data-error]').count();
          
          console.log('Success indicators found:', successElements);
          console.log('Error indicators found:', errorElements);
          
        } else {
          console.log('❌ No process button found');
        }
        
      } else {
        console.log('❌ No file input found');
      }
      
    } catch (error) {
      console.log('❌ Test error:', error.message);
    }
  });
});
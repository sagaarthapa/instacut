import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Background Removal Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should complete background removal processing', async ({ page }) => {
    // Create a test image file (simple 100x100 red square PNG)
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png');
    
    // Ensure test image exists or create it
    if (!fs.existsSync(testImagePath)) {
      // Create a simple test image using a data URL
      const canvas = require('canvas').createCanvas(100, 100);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 100, 100);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(testImagePath, buffer);
    }

    console.log('Starting background removal test...');

    // Wait for upload area to be visible
    const uploadArea = page.locator('[data-testid="upload-area"], .dropzone, [role="button"]:has-text("Upload"), input[type="file"]').first();
    await expect(uploadArea).toBeVisible({ timeout: 10000 });

    // Upload file
    console.log('Uploading test image...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);

    // Wait for upload success and options screen
    console.log('Waiting for upload completion...');
    await expect(page.locator('text=/uploaded successfully|processing options|background removal/i')).toBeVisible({ timeout: 15000 });

    // Look for background removal option
    console.log('Looking for background removal option...');
    const backgroundRemovalOption = page.locator('text=/remove background|background removal/i').first();
    await expect(backgroundRemovalOption).toBeVisible({ timeout: 10000 });
    
    // Click on background removal option
    await backgroundRemovalOption.click();
    console.log('Selected background removal option');

    // Wait for processing interface
    await expect(page.locator('text=/ready to process|start processing/i')).toBeVisible({ timeout: 10000 });

    // Click start processing button
    console.log('Starting processing...');
    const processButton = page.locator('button:has-text("Start Processing"), button:has-text("Process")').first();
    await expect(processButton).toBeVisible({ timeout: 5000 });
    await processButton.click();

    // Monitor network requests to backend
    let processingRequestMade = false;
    let processingResponseReceived = false;

    page.on('request', request => {
      if (request.url().includes('/api/v1/process')) {
        console.log('Processing request made:', request.url());
        processingRequestMade = true;
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/v1/process')) {
        console.log('Processing response received:', response.status(), response.url());
        processingResponseReceived = true;
      }
    });

    // Wait for processing to complete (not get stuck)
    console.log('Waiting for processing completion...');
    
    // First check if processing started
    await expect(page.locator('text=/processing|loading/i')).toBeVisible({ timeout: 5000 });
    console.log('Processing started successfully');

    // Then wait for completion (should not take more than 30 seconds)
    try {
      await expect(page.locator('text=/processing complete|download result|processed successfully/i')).toBeVisible({ timeout: 30000 });
      console.log('✅ Processing completed successfully!');
    } catch (error) {
      console.log('❌ Processing seems stuck. Checking current state...');
      
      // Debug information
      const currentText = await page.textContent('body');
      console.log('Current page text contains:', currentText?.substring(0, 500));
      
      // Check if stuck in processing state
      const stillProcessing = await page.locator('text=/processing\.\.\.|loading/i').isVisible();
      console.log('Still showing processing:', stillProcessing);
      
      // Check network requests
      console.log('Processing request made:', processingRequestMade);
      console.log('Processing response received:', processingResponseReceived);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'background-removal-stuck.png' });
      
      throw new Error('Background removal processing is stuck');
    }

    // Verify download option is available
    const downloadButton = page.locator('button:has-text("Download"), a:has-text("Download")').first();
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Download option is available');
  });

  test('should handle backend API directly', async ({ request }) => {
    // Test the backend API directly to isolate frontend vs backend issues
    console.log('Testing backend API directly...');

    // First check if backend is responding
    const healthCheck = await request.get('http://localhost:8000/');
    expect(healthCheck.status()).toBe(200);
    console.log('✅ Backend is responding');

    // Create a simple test image buffer
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');

    // Test upload endpoint
    const uploadResponse = await request.post('http://localhost:8000/api/upload', {
      multipart: {
        file: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: testImageBuffer
        }
      }
    });

    expect(uploadResponse.status()).toBe(200);
    console.log('✅ Upload endpoint works');

    // Test processing endpoint
    const processResponse = await request.post('http://localhost:8000/api/v1/process', {
      multipart: {
        file: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: testImageBuffer
        },
        operation: 'background_removal',
        model: 'rembg'
      }
    });

    console.log('Processing response status:', processResponse.status());
    
    if (processResponse.status() !== 200) {
      const errorText = await processResponse.text();
      console.log('Processing error:', errorText);
      throw new Error(`Processing failed with status ${processResponse.status()}: ${errorText}`);
    }

    const processResult = await processResponse.json();
    console.log('Processing result:', processResult);
    
    expect(processResult.status).toBe('success');
    expect(processResult.output_path).toBeDefined();
    console.log('✅ Backend processing works correctly');
  });
});
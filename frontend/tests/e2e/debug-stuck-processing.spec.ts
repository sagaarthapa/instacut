import { test, expect } from '@playwright/test';

test('Debug stuck processing status', async ({ page }) => {
  test.setTimeout(90000);

  // Enhanced console logging
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  // Network logging  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`[RESPONSE]: ${response.status()} ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    console.log(`[FAILED REQUEST]: ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  console.log('=== Starting comprehensive processing debug ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  console.log('Page loaded successfully');

  // Create a test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/test-image.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  // Upload the image
  console.log('Uploading image...');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  await page.waitForTimeout(3000);
  console.log('Image upload completed');

  // Look for and click background removal option
  console.log('Looking for background removal option...');
  const bgRemovalOption = page.locator('text=/remove background/i').first();
  await bgRemovalOption.waitFor({ state: 'visible' });
  await bgRemovalOption.click();
  console.log('Background removal option clicked');
  
  await page.waitForTimeout(2000);

  // Check what processing buttons are available
  console.log('Checking available processing buttons...');
  const allButtons = page.locator('button');
  const buttonCount = await allButtons.count();
  for (let i = 0; i < buttonCount; i++) {
    const buttonText = await allButtons.nth(i).textContent();
    console.log(`Button ${i}: "${buttonText}"`);
  }

  // Find and click the processing button
  const processButton = page.locator('button:has-text("Start Processing"), button:has-text("Process Image")').first();
  await processButton.waitFor({ state: 'visible' });
  console.log('Found processing button, clicking...');
  await processButton.click();
  console.log('Processing button clicked');

  // Wait for processing to start and monitor status
  console.log('Monitoring processing status...');
  
  // Check for loading/processing indicators
  const loadingIndicator = page.locator('[data-testid="loading"], .loading').or(page.locator('text=/processing/i'));
  if (await loadingIndicator.isVisible()) {
    console.log('Processing indicator found - waiting...');
  }

  // Wait and check status every few seconds
  for (let i = 0; i < 12; i++) { // Check for up to 60 seconds
    await page.waitForTimeout(5000);
    
    // Check if still processing
    const stillProcessing = await page.locator('text=/processing/i').isVisible();
    console.log(`Status check ${i + 1}: Still processing = ${stillProcessing}`);
    
    // Check for success/error messages
    const successMessage = page.locator('text=/success/i').or(page.locator('text=/completed/i')).or(page.locator('text=/done/i'));
    const errorMessage = page.locator('text=/error/i').or(page.locator('text=/failed/i'));
    const downloadButton = page.locator('button:has-text("Download")').or(page.locator('a:has-text("Download")'));
    
    const hasSuccess = await successMessage.isVisible();
    const hasError = await errorMessage.isVisible();
    const hasDownload = await downloadButton.isVisible();
    
    console.log(`  Success message visible: ${hasSuccess}`);
    console.log(`  Error message visible: ${hasError}`);
    console.log(`  Download button visible: ${hasDownload}`);
    
    if (hasSuccess || hasError || hasDownload) {
      console.log('Processing completed or errored out');
      break;
    }
    
    if (!stillProcessing) {
      console.log('Processing indicator disappeared but no success/error message');
      break;
    }
  }

  console.log('=== Final page state check ===');
  const pageContent = await page.textContent('body');
  console.log('Page contains "Processing":', pageContent?.includes('Processing') || false);
  console.log('Page contains "Success":', pageContent?.includes('success') || pageContent?.includes('Success') || false);
  console.log('Page contains "Error":', pageContent?.includes('Error') || pageContent?.includes('error') || false);
  
  console.log('=== Debug test completed ===');
});
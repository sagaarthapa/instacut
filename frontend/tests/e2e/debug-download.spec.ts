import { test, expect } from '@playwright/test';

test('Debug download functionality', async ({ page }) => {
  test.setTimeout(60000);

  // Listen to all console messages and network requests
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('/download/')) {
      console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/') || response.url().includes('/download/')) {
      console.log(`[RESPONSE]: ${response.status()} ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    console.log(`[FAILED REQUEST]: ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  console.log('=== Testing download functionality ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/download-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  // Upload and process
  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  await page.locator('button:has-text("Start Processing")').first().click();
  console.log('Processing started...');

  // Wait for processing to complete
  await page.waitForTimeout(15000);

  // Check if download button is available
  const downloadButton = page.locator('button:has-text("Download")');
  const isDownloadVisible = await downloadButton.isVisible();
  console.log(`Download button visible: ${isDownloadVisible}`);

  if (isDownloadVisible) {
    console.log('Clicking download button...');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    try {
      const download = await Promise.race([
        downloadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 10000))
      ]) as any;
      
      console.log(`Download started: ${download.suggestedFilename()}`);
      
      // Save download to check if it works
      const downloadPath = require('path').join(__dirname, '../fixtures', `downloaded_${download.suggestedFilename()}`);
      await download.saveAs(downloadPath);
      console.log(`Download saved to: ${downloadPath}`);
      
    } catch (downloadError: any) {
      console.error('Download failed:', downloadError?.message || downloadError);
    }
  } else {
    console.log('Download button not visible - checking page state...');
    const pageText = await page.textContent('body');
    console.log('Page contains "Processing":', pageText?.includes('Processing') || false);
    console.log('Page contains "Complete":', pageText?.includes('Complete') || false);
  }

  console.log('=== Download test completed ===');
});
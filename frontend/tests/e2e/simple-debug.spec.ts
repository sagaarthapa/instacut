import { test, expect } from '@playwright/test';

test('Simple processing debug with screenshot', async ({ page }) => {
  test.setTimeout(60000);

  console.log('Starting simple debug test...');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/simple-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  // Upload
  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  console.log('Image uploaded');

  // Click background removal
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);
  console.log('Background removal selected');

  // Take screenshot before processing
  await page.screenshot({ path: 'debug-before-processing.png' });

  // Click process
  await page.locator('button:has-text("Start Processing")').first().click();
  console.log('Processing clicked');

  // Wait for processing to complete
  await page.waitForTimeout(10000);
  
  // Take screenshot after processing
  await page.screenshot({ path: 'debug-after-processing.png' });
  console.log('Screenshots taken');

  // Get page text content to analyze
  const pageText = await page.textContent('body');
  console.log('Page contains "Processing":', pageText?.includes('Processing') || false);
  console.log('Page contains "processing":', pageText?.includes('processing') || false);
  console.log('Page contains "Download":', pageText?.includes('Download') || false);
  console.log('Page contains "Success":', pageText?.includes('Success') || false);
  console.log('Page contains "Error":', pageText?.includes('Error') || false);
});
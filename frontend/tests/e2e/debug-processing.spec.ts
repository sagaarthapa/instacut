import { test, expect } from '@playwright/test';

test('Debug frontend processing issue', async ({ page }) => {
  test.setTimeout(60000);

  // Listen to all console messages  
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.type()}: ${msg.text()}`);
  });

  // Listen to failed requests
  page.on('requestfailed', request => {
    console.log(`FAILED REQUEST: ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  // Listen to all network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`REQUEST: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`RESPONSE: ${response.status()} ${response.url()}`);
    }
  });

  console.log('Starting debug test...');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/debug-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  // Upload
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  console.log('Image uploaded');

  // Wait and click background removal
  await page.waitForTimeout(2000);
  const bgRemovalButton = page.locator('text=/remove background/i').first();
  await bgRemovalButton.click();
  console.log('Background removal selected');

  // Wait for processing interface
  await page.waitForTimeout(2000);
  
  // Look for start processing button and click if available
  const startButton = page.locator('button:has-text("Start Processing")');
  if (await startButton.isVisible()) {
    console.log('Clicking Start Processing button...');
    await startButton.click();
    console.log('Start Processing button clicked');
  } else {
    console.log('Start Processing button not visible, checking what buttons are available...');
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    for (let i = 0; i < buttonCount; i++) {
      const buttonText = await allButtons.nth(i).textContent();
      console.log(`Button ${i}: "${buttonText}"`);
    }
  }

  // Wait and see what happens
  await page.waitForTimeout(10000);
  console.log('Finished waiting');
});
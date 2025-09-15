import { test, expect } from '@playwright/test';

test('Debug processing button click', async ({ page }) => {
  test.setTimeout(30000);

  // Listen to console messages and network requests
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Processing') || msg.text().includes('fetch')) {
      console.log(`BROWSER ${msg.type()}: ${msg.text()}`);
    }
  });

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

  page.on('requestfailed', request => {
    console.log(`FAILED REQUEST: ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
  });

  await page.goto('http://localhost:3000');
  
  // Create and upload test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/debug-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  console.log('Image uploaded');
  
  await page.waitForTimeout(2000);

  // Click background removal
  const bgRemoval = page.locator('text=/remove background/i').first();
  await bgRemoval.click();
  console.log('Background removal clicked');
  
  await page.waitForTimeout(2000);

  // Look for start processing button
  const startButton = page.locator('button:has-text("Start Processing")');
  if (await startButton.isVisible()) {
    console.log('Start Processing button found - clicking it...');
    await startButton.click();
    console.log('Start Processing button clicked');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
  } else {
    console.log('Start Processing button NOT found');
    
    // Log all buttons on the page
    const buttons = page.locator('button');
    const count = await buttons.count();
    console.log(`Found ${count} buttons on page:`);
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      console.log(`  Button ${i}: "${text}"`);
    }
  }
});
import { test, expect } from '@playwright/test';

test('Debug with enhanced logging', async ({ page }) => {
  test.setTimeout(30000);

  // Log ALL console messages
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  console.log('=== Starting enhanced debug test ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Upload test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/enhanced-debug.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  // Click process and monitor
  console.log('=== Clicking Start Processing ===');
  await page.locator('button:has-text("Start Processing")').first().click();

  // Wait and check what happens
  await page.waitForTimeout(20000);
  
  console.log('=== Checking final state ===');
  
  // Check if both states are visible
  const processingButton = await page.locator('button:has-text("Processing...")').isVisible();
  const downloadButton = await page.locator('button:has-text("Download")').isVisible();
  const completeText = await page.locator('text=/Processing Complete/i').isVisible();
  
  console.log(`Processing button visible: ${processingButton}`);
  console.log(`Download button visible: ${downloadButton}`);
  console.log(`"Processing Complete" text visible: ${completeText}`);
  
  console.log('=== Test completed ===');
});
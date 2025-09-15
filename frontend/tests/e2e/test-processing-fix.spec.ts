import { test, expect } from '@playwright/test';

test('Test processing state management fix', async ({ page }) => {
  test.setTimeout(45000);

  // Log all console messages to see state changes
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });

  console.log('Testing processing state fix...');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Upload test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/state-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  // Click process
  await page.locator('button:has-text("Start Processing")').first().click();
  console.log('Processing started...');

  // Wait for processing to complete
  await page.waitForTimeout(15000);
  
  // Check final state
  const hasProcessingText = await page.locator('text=/processing/i').isVisible();
  const hasDownloadButton = await page.locator('button:has-text("Download")').isVisible();
  
  console.log(`Final state - Still showing processing: ${hasProcessingText}`);
  console.log(`Final state - Download button visible: ${hasDownloadButton}`);
  
  // Expect processing to be complete (no processing text) and download available
  expect(hasProcessingText).toBe(false);
  expect(hasDownloadButton).toBe(true);
});
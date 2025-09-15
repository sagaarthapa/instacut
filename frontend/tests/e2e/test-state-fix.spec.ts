import { test, expect } from '@playwright/test';

test('Test processing state fix - should not show both states', async ({ page }) => {
  test.setTimeout(25000);

  page.on('console', msg => {
    console.log(`[BROWSER]: ${msg.text()}`);
  });

  console.log('=== Testing the state fix ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Upload
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/state-fix-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  // Click process
  console.log('Clicking Start Processing...');
  await page.locator('button:has-text("Start Processing")').first().click();

  // Wait for completion
  await page.waitForTimeout(10000);
  
  // Check states - should NOT have both processing and complete visible
  const hasProcessingButton = await page.locator('button:has-text("Processing...")').isVisible();
  const hasDownloadButton = await page.locator('button:has-text("Download")').isVisible();
  const hasCompleteText = await page.locator('text=/Processing Complete/i').isVisible();
  
  console.log(`Processing button visible: ${hasProcessingButton}`);
  console.log(`Download button visible: ${hasDownloadButton}`);
  console.log(`Complete text visible: ${hasCompleteText}`);
  
  // The fix: should show EITHER processing OR complete, not both
  const showingBothStates = hasProcessingButton && (hasDownloadButton || hasCompleteText);
  console.log(`Showing both states (BUG): ${showingBothStates}`);
  
  // Test should pass if NOT showing both states
  expect(showingBothStates).toBe(false);
  
  // Should have completed successfully
  expect(hasDownloadButton || hasCompleteText).toBe(true);
});
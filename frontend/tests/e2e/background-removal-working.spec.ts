import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Background removal processing completes successfully', async ({ page }) => {
  // Set longer timeout for this test
  test.setTimeout(90000); // 90 seconds

  console.log('Starting background removal test with extended timeout...');

  // Navigate to the homepage
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create a simple test image (1x1 pixel PNG)
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = path.join(__dirname, '../fixtures/test-pixel.png');
  fs.writeFileSync(testImagePath, testImageBuffer);

  // Upload image
  console.log('Uploading test image...');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);

  // Wait for processing options
  console.log('Waiting for processing options...');
  await expect(page.locator('text=/remove background/i').first()).toBeVisible({ timeout: 10000 });

  // Click background removal option (more specific selector)
  await page.locator('button:has-text("Remove Background")').or(page.locator('[data-testid="background-removal-option"]')).or(page.locator('text=/remove background/i').first()).click();
  console.log('Selected background removal');

  // Wait for processing interface
  await expect(page.locator('text=/start processing|ready to process/i')).toBeVisible({ timeout: 10000 });

  // Check if processing already started or click start
  console.log('Starting processing...');
  const processingButton = page.locator('button:has-text("Processing...")');
  const startButton = page.locator('button:has-text("Start Processing")').first();
  
  if (await processingButton.isVisible()) {
    console.log('Processing already started!');
  } else {
    console.log('Clicking start processing button...');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
  }

  // Wait for processing to complete (with extended timeout)
  console.log('Waiting for processing completion (up to 70 seconds)...');
  await expect(page.locator('text=/processing complete/i').or(page.locator('text=/download result/i'))).toBeVisible({ timeout: 70000 });

  console.log('✅ Background removal completed successfully!');

  // Verify download option is available
  await expect(page.locator('button:has-text("Download Result")').or(page.locator('text=/download/i'))).toBeVisible();
  
  console.log('✅ Test completed successfully!');
});
import { test, expect } from '@playwright/test';

test('Quick PNG output check', async ({ page }) => {
  test.setTimeout(30000);

  console.log('=== Quick PNG transparency check ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/png-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  // Upload and process
  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  await page.locator('button:has-text("Start Processing")').first().click();
  await page.waitForTimeout(10000);

  // Try download
  const downloadButton = page.locator('button:has-text("Download")');
  if (await downloadButton.isVisible()) {
    console.log('✅ Processing completed, download available');
    
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    const download = await downloadPromise as any;
    const filename = download.suggestedFilename();
    console.log(`Download filename: ${filename}`);
    
    // Check if filename ends with .png
    const isPNGFilename = filename.endsWith('.png');
    console.log(`Filename ends with .png: ${isPNGFilename}`);
    
    if (isPNGFilename) {
      console.log('🎉 SUCCESS: Output filename indicates PNG format!');
    } else {
      console.log('❌ WARNING: Output filename does not end with .png');
    }
    
  } else {
    console.log('❌ Download button not visible');
  }

  console.log('=== PNG check completed ===');
});
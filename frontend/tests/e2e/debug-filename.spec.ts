import { test, expect } from '@playwright/test';

test('Debug filename extension issue', async ({ page }) => {
  test.setTimeout(30000);

  // Log everything about the processing
  page.on('console', msg => {
    console.log(`[BROWSER]: ${msg.text()}`);
  });

  page.on('response', response => {
    if (response.url().includes('/api/v1/process')) {
      response.json().then(data => {
        console.log('Processing response data:', JSON.stringify(data, null, 2));
      }).catch(() => {});
    }
  });

  console.log('=== Debugging filename extension ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Upload JPG file to test extension conversion
  const testImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/test-image.jpg');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  await page.locator('button:has-text("Start Processing")').first().click();
  await page.waitForTimeout(10000);

  // Check download
  const downloadButton = page.locator('button:has-text("Download")');
  if (await downloadButton.isVisible()) {
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    const download = await downloadPromise as any;
    const filename = download.suggestedFilename();
    console.log(`Download filename: "${filename}"`);
    console.log(`Ends with .png: ${filename.endsWith('.png')}`);
    console.log(`Ends with .jpg: ${filename.endsWith('.jpg')}`);
    
    // Let's also check the URL being downloaded from
    await page.waitForTimeout(1000);
    
  } else {
    console.log('❌ Download button not visible');
  }

  console.log('=== Debug completed ===');
});
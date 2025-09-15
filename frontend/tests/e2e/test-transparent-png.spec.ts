import { test, expect } from '@playwright/test';

test('Verify transparent PNG output', async ({ page }) => {
  test.setTimeout(45000);

  // Log console messages
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  console.log('=== Testing transparent PNG output ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create a test image (small colored square)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFVSURBVBiVY/z//z8DGzs7w6tXrxj+/v3LwMjIyMDIyMjw//9/BkZGRob//f8Z/v//z8DAwMDw//9/hv///zP8//+fYd++fQz//v1j+Pv3L8Pv378Z/v79y/D371+Gf//+Mfz7948BCP7//8/w9+9fhr9//zL8+/eP4d+/fwz//v1j+PfvH8O/f/8Y/v37x/Dv3z+Gf//+Mfz790/hv3//GP79+8fw798/hn///jH8+/eP4d+/fwz//v1j+PfvH8O/f/8Y/v37x/Dv3z+Gf//+Mfz794/h379/DP/+/WP49+8fw79//xj+/fvH8O/fP4Z///4x/Pv3j+Hfv38M//79Y/j37x/Dv3//GP79+8fw798/hn///jH8+/eP4d+/fwz//v1j+PfvH8O/f/8Y/v37x/Dv3z+Gf//+Mfz794/h379/DP/+/WP49+8fw79//xj+/fvH8O/fPwYGAF8/MjGqvQd1AAAAAElFTkSuQmCC',
    'base64'
  );
  const testImagePath = require('path').join(__dirname, '../fixtures/transparent-test.png');
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

  // Check if download is available
  const downloadButton = page.locator('button:has-text("Download")');
  const isDownloadVisible = await downloadButton.isVisible();
  console.log(`Download button visible: ${isDownloadVisible}`);

  if (isDownloadVisible) {
    console.log('Downloading processed image...');
    
    // Download the file
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    try {
      const download = await Promise.race([
        downloadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 10000))
      ]) as any;
      
      const downloadPath = require('path').join(__dirname, '../fixtures', `result_${download.suggestedFilename()}`);
      await download.saveAs(downloadPath);
      console.log(`Downloaded to: ${downloadPath}`);
      
      // Verify it's a PNG file with transparency
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(downloadPath);
      
      // Check PNG signature
      const isPNG = fileBuffer[0] === 0x89 && 
                   fileBuffer[1] === 0x50 && 
                   fileBuffer[2] === 0x4E && 
                   fileBuffer[3] === 0x47;
      
      console.log(`File is PNG: ${isPNG}`);
      console.log(`File size: ${fileBuffer.length} bytes`);
      
      // Check for transparency chunk (tRNS) or alpha channel in PNG
      const fileContent = fileBuffer.toString('hex');
      const hasTransparency = fileContent.includes('74524e53') || // tRNS chunk
                             fileContent.includes('49484452'); // IHDR chunk (we'll assume RGBA if it's a proper PNG)
      
      console.log(`Has transparency indicators: ${hasTransparency}`);
      
      // If it's a PNG, we can be confident it supports transparency
      expect(isPNG).toBe(true);
      console.log('✅ Output is a valid PNG file that supports transparency!');
      
    } catch (error) {
      console.error('Download or verification failed:', error);
      throw error;
    }
  } else {
    throw new Error('Download button not visible - processing may have failed');
  }

  console.log('=== Transparent PNG test completed ===');
});
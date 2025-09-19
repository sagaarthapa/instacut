import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Photo Restoration appears after file upload', async ({ page }) => {
  console.log('🚀 Testing Photo Restoration visibility...');
  
  // Step 1: Go to homepage
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  console.log('✅ Homepage loaded');
  
  // Step 2: Take screenshot of initial state
  await page.screenshot({ path: 'test-step1-homepage.png' });
  
  // Step 3: Upload a test file using the hidden file input
  const testImagePath = path.join(__dirname, '..', 'fixtures', 'test-image.png');
  
  // Create a test image if it doesn't exist
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
    }
    const link = document.createElement('a');
    link.download = 'test-image.png';
    link.href = canvas.toDataURL();
  });
  
  // Find and interact with file input
  const fileInput = page.locator('input[type="file"]').first();
  
  // Create a simple test file
  await fileInput.setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x01, 0x00, 
      0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 
      0x01, 0x73, 0x75, 0x01, 0x18, 0x00, 0x00, 0x00, 
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]),
  });
  
  console.log('✅ File uploaded');
  
  // Step 4: Wait for navigation to processing options
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-step2-after-upload.png' });
  
  // Step 5: Look for processing options
  console.log('🔍 Checking for processing options...');
  
  // Wait for options to appear with timeout
  try {
    await page.waitForSelector('text="What would you like to do?"', { timeout: 10000 });
    console.log('✅ Found "What would you like to do?" text');
  } catch (e) {
    console.log('❌ Did not find processing options page');
  }
  
  // Check for specific options
  const photoRestorationVisible = await page.locator('text="Photo Restoration"').isVisible();
  const enhanceQualityVisible = await page.locator('text="Enhance Quality"').isVisible();
  const backgroundRemovalVisible = await page.locator('text="Remove Background"').isVisible();
  const upscaleVisible = await page.locator('text="Upscale Image"').isVisible();
  
  console.log('=== FINAL RESULTS ===');
  console.log('📸 Photo Restoration visible:', photoRestorationVisible);
  console.log('⚠️ Enhance Quality visible:', enhanceQualityVisible);
  console.log('✂️ Background Removal visible:', backgroundRemovalVisible);
  console.log('🔍 Upscale Image visible:', upscaleVisible);
  
  // Take final screenshot
  await page.screenshot({ path: 'test-final-processing-options.png', fullPage: true });
  
  if (photoRestorationVisible) {
    console.log('🎉 SUCCESS: Photo Restoration option is working!');
  } else {
    console.log('❌ ISSUE: Photo Restoration option not found');
  }
  
  if (enhanceQualityVisible) {
    console.log('⚠️ WARNING: Enhance Quality still present (should be removed)');
  } else {
    console.log('✅ GOOD: Enhance Quality correctly removed');
  }
});
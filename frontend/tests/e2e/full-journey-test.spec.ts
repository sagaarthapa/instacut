import { test } from '@playwright/test';

test('Full user journey to see processing options', async ({ page }) => {
  console.log('Starting full user journey test...');
  
  // Navigate to homepage
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'step1-homepage.png', fullPage: true });
  console.log('Step 1: Homepage loaded');
  
  // Create a test image file and upload it
  const testImage = await page.evaluateHandle(() => {
    // Create a canvas with a simple image
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw a simple pattern
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(50, 50, 100, 100);
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(75, 75, 50, 50);
    }
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  });
  
  // Use a simpler approach - use an existing test file or create one
  // For now, let's simulate the file upload via the file chooser event
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('text="Choose File"');
  const fileChooser = await fileChooserPromise;
  
  // Create a simple Buffer for test image
  const testBuffer = Buffer.from('test image data');
  await fileChooser.setFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: testBuffer,
  });
  
  console.log('Step 2: File uploaded');
  
  // Wait for the options page to appear
  await page.waitForTimeout(3000);
  
  // Take screenshot after upload
  await page.screenshot({ path: 'step2-after-upload.png', fullPage: true });
  
  // Now check for processing options
  const hasPhotoRestoration = await page.locator('text="Photo Restoration"').isVisible();
  const hasEnhanceQuality = await page.locator('text="Enhance Quality"').isVisible();
  const hasBackgroundRemoval = await page.locator('text="Remove Background"').isVisible();
  const hasUpscaleImage = await page.locator('text="Upscale Image"').isVisible();
  
  console.log('=== PROCESSING OPTIONS CHECK ===');
  console.log('Has Photo Restoration:', hasPhotoRestoration);
  console.log('Has Enhance Quality:', hasEnhanceQuality);
  console.log('Has Background Removal:', hasBackgroundRemoval);
  console.log('Has Upscale Image:', hasUpscaleImage);
  
  // Check page content
  const pageContent = await page.locator('body').textContent();
  console.log('Page contains "What would you like to do?":', pageContent?.includes('What would you like to do?'));
  console.log('Page contains "Photo Restoration":', pageContent?.includes('Photo Restoration'));
  console.log('Page contains "Restore old, blurry":', pageContent?.includes('Restore old, blurry'));
  
  // Look for processing options grid
  const hasProcessingGrid = await page.locator('.grid').count();
  console.log('Number of grids found:', hasProcessingGrid);
  
  // Check for specific processing option cards
  const processingCards = await page.locator('.card, [class*="card"]').count();
  console.log('Number of cards found:', processingCards);
  
  console.log('=== USER JOURNEY COMPLETE ===');
});
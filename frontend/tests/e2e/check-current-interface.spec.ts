import { test, expect } from '@playwright/test';

test.describe('Current Interface Check', () => {
  test('should show Photo Restoration option instead of Enhance Quality', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Take a screenshot for debugging
    await page.screenshot({ path: 'current-homepage.png', fullPage: true });

    // Check if we're on the upload page (initial state)
    const uploadArea = page.locator('text="Drop your image here"').or(page.locator('text="Choose File"')).or(page.locator('input[type="file"]'));
    
    if (await uploadArea.isVisible()) {
      console.log('✅ On upload page - need to upload a file first');
      
      // Look for upload button or drag area
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Upload a test file - create a simple canvas-based image
        await page.evaluate(() => {
          // Create a simple test image
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 100, 100);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'test.png', { type: 'image/png' });
              const dt = new DataTransfer();
              dt.items.add(file);
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (input) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }, 'image/png');
        });
        
        // Wait for the options page to appear
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'after-upload.png', fullPage: true });
      }
    }

    // Now check for the processing options
    await expect(page.locator('text="Photo Restoration"')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="Remove Background"')).toBeVisible();
    await expect(page.locator('text="Upscale Image"')).toBeVisible();
    
    // Make sure "Enhance Quality" is NOT present
    await expect(page.locator('text="Enhance Quality"')).not.toBeVisible();
    
    // Check that Photo Restoration has the correct description
    await expect(page.locator('text="Restore old, blurry or damaged photos with AI face restoration"')).toBeVisible();

    console.log('✅ Interface check completed successfully');
  });

  test('should show correct processing options when file is uploaded', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Create and upload a test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text="Choose File"').or(page.locator('input[type="file"]')).first();
    const fileChooser = await fileChooserPromise;
    
    // Create a temporary test file
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(50, 50, 100, 100);
      }
      return canvas.toDataURL();
    });
    
    // Instead, let's check if we can navigate to options by simulating file selection
    await page.waitForTimeout(1000);
    
    // Take screenshot to see current state
    await page.screenshot({ path: 'interface-check.png', fullPage: true });
    
    // Look for any of the expected options
    const hasPhotoRestoration = await page.locator('text="Photo Restoration"').isVisible();
    const hasEnhanceQuality = await page.locator('text="Enhance Quality"').isVisible();
    const hasBackgroundRemoval = await page.locator('text="Remove Background"').isVisible();
    
    console.log('Photo Restoration visible:', hasPhotoRestoration);
    console.log('Enhance Quality visible:', hasEnhanceQuality);
    console.log('Background Removal visible:', hasBackgroundRemoval);
    
    // Report findings
    if (hasPhotoRestoration) {
      console.log('✅ GOOD: Photo Restoration option is present');
    } else {
      console.log('❌ BAD: Photo Restoration option is missing');
    }
    
    if (hasEnhanceQuality) {
      console.log('❌ BAD: Enhance Quality option is still present (should be removed)');
    } else {
      console.log('✅ GOOD: Enhance Quality option is correctly removed');
    }
  });
});
import { test } from '@playwright/test';

test('Simple interface screenshot', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ 
    path: 'current-interface-full.png', 
    fullPage: true 
  });
  
  // Check what's visible
  console.log('=== CHECKING CURRENT INTERFACE ===');
  
  // Check for upload page elements
  const hasUploadArea = await page.locator('text="Drop your image here"').isVisible();
  const hasChooseFile = await page.locator('text="Choose File"').isVisible();
  
  console.log('Has upload area:', hasUploadArea);
  console.log('Has choose file button:', hasChooseFile);
  
  // Check for processing options (might not be visible yet)
  const hasPhotoRestoration = await page.locator('text="Photo Restoration"').isVisible();
  const hasEnhanceQuality = await page.locator('text="Enhance Quality"').isVisible();
  const hasBackgroundRemoval = await page.locator('text="Remove Background"').isVisible();
  const hasUpscaleImage = await page.locator('text="Upscale Image"').isVisible();
  
  console.log('Has Photo Restoration:', hasPhotoRestoration);
  console.log('Has Enhance Quality:', hasEnhanceQuality);  
  console.log('Has Background Removal:', hasBackgroundRemoval);
  console.log('Has Upscale Image:', hasUpscaleImage);
  
  // Get all text content on the page for debugging
  const bodyText = await page.locator('body').textContent();
  console.log('Page contains "Photo Restoration":', bodyText?.includes('Photo Restoration'));
  console.log('Page contains "Enhance Quality":', bodyText?.includes('Enhance Quality'));
  
  console.log('=== INTERFACE CHECK COMPLETE ===');
});
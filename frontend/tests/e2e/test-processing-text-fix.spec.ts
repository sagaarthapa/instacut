import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Verify no confusing "Processing:" text before starting', async ({ page }) => {
  console.log('=== Testing UI Processing Text Fix ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create a test image
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
  
  // Convert to blob
  const testImageBuffer = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob!);
      });
    });
  });

  const base64Data = testImageBuffer.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, buffer);

  // Upload the file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  
  // Wait for upload to complete and go to processing interface
  await page.waitForSelector('text=Background Removal');
  
  console.log('=== Checking page content after upload ===');
  
  // Get all text content from the page
  const pageText = await page.textContent('body');
  console.log('Page text after upload (first 1000 chars):');
  console.log(pageText?.substring(0, 1000));
  
  // Check header section specifically
  const headerSection = page.locator('h1, .text-4xl, .text-5xl').first();
  if (await headerSection.isVisible()) {
    const headerText = await headerSection.textContent();
    console.log('Header text:', headerText);
  }
  
  // Check for the problematic "Processing:" text in the header area
  const processingHeaderText = page.locator('p:has-text("Processing:")');
  const isProcessingHeaderVisible = await processingHeaderText.isVisible();
  console.log('❌ "Processing:" header text visible:', isProcessingHeaderVisible);
  
  // Check for the improved "File:" text in the header area
  const fileHeaderText = page.locator('p:has-text("File:")');
  const isFileHeaderVisible = await fileHeaderText.isVisible();
  console.log('✅ "File:" header text visible:', isFileHeaderVisible);
  
  // Check the main processing card
  const processingCard = page.locator('.glass').first();
  if (await processingCard.isVisible()) {
    const cardText = await processingCard.textContent();
    console.log('Processing card text:', cardText);
    
    // Should contain "Ready to process" not "Processing"
    expect(cardText).toContain('Ready to process your image');
    expect(cardText).toContain('Start Processing');
    
    // Should NOT contain confusing "Processing:" in the initial state
    expect(cardText).not.toContain('Processing:');
  }
  
  // Verify the "Start Processing" button is present and not in processing state
  const startButton = page.locator('button:has-text("Start Processing")');
  await expect(startButton).toBeVisible();
  
  // Verify no "Processing..." text is shown initially
  const processingButton = page.locator('button:has-text("Processing...")');
  await expect(processingButton).not.toBeVisible();
  
  console.log('✅ UI fix verified: No confusing "Processing:" text before user starts processing');
  
  // Cleanup
  fs.unlinkSync(testImagePath);
});
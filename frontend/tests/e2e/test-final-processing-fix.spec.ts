import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Verify NO confusing processing text appears before user starts processing', async ({ page }) => {
  console.log('=== Testing FINAL Processing Text Fix ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create a test image
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
  
  console.log('=== After upload, BEFORE clicking Start Processing ===');
  
  // Check header section - should show "File:" not "Processing:"
  const headerText = await page.textContent('p:has-text("File:")');
  console.log('✅ Header text:', headerText);
  expect(headerText).toContain('File:');
  
  // Verify NO "Processing:" header exists
  const processingHeaderExists = await page.locator('p:has-text("Processing:")').count();
  console.log('❌ "Processing:" headers found:', processingHeaderExists);
  expect(processingHeaderExists).toBe(0);
  
  // Check card titles
  const cardTitles = await page.locator('.card h4').allTextContents();
  console.log('Card titles:', cardTitles);
  
  // Should contain "Original" and "Ready" (not "Processing...")
  expect(cardTitles).toContain('Original');
  expect(cardTitles).toContain('Ready');
  expect(cardTitles).not.toContain('Processing...');
  
  // Check card content - should show instructional text, not spinner
  const readyCard = page.locator('.card:has(h4:text("Ready"))');
  const readyCardText = await readyCard.textContent();
  console.log('Ready card content:', readyCardText);
  expect(readyCardText).toContain('Click "Start Processing" to begin');
  
  // Should NOT have spinning animation before processing starts
  const spinnerExists = await readyCard.locator('.animate-spin').count();
  console.log('❌ Spinners found before processing:', spinnerExists);
  expect(spinnerExists).toBe(0);
  
  // Main processing button should show "Start Processing"
  const startButton = page.locator('button:has-text("Start Processing")');
  await expect(startButton).toBeVisible();
  console.log('✅ "Start Processing" button visible');
  
  // Should NOT show "Processing..." button initially
  const processingButton = page.locator('button:has-text("Processing...")');
  await expect(processingButton).not.toBeVisible();
  
  console.log('✅ SUCCESS: No confusing "Processing" text appears before user starts processing');
  console.log('✅ Clear UI states: Header shows "File:", card shows "Ready", instructional text visible');
  
  // Now test what happens AFTER clicking Start Processing
  console.log('=== Testing AFTER clicking Start Processing ===');
  
  await startButton.click();
  
  // Wait a moment for state to update
  await page.waitForTimeout(1000);
  
  // Now should show processing states
  const buttonAfterClick = await page.locator('button').filter({ hasText: /Processing|Start Processing/ }).textContent();
  console.log('Button text after click:', buttonAfterClick);
  
  // Card title should now show "Processing..."
  const cardTitlesAfterClick = await page.locator('.card h4').allTextContents();
  console.log('Card titles after click:', cardTitlesAfterClick);
  expect(cardTitlesAfterClick).toContain('Processing...');
  
  // Should now have spinner
  const spinnerAfterClick = await page.locator('.animate-spin').count();
  console.log('✅ Spinners found during processing:', spinnerAfterClick);
  expect(spinnerAfterClick).toBeGreaterThan(0);
  
  console.log('✅ SUCCESS: Processing states appear correctly ONLY after user clicks start');
  
  // Cleanup
  fs.unlinkSync(testImagePath);
});
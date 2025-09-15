import { test, expect } from '@playwright/test';

test('Check UI text before processing starts', async ({ page }) => {
  test.setTimeout(30000);

  console.log('=== Testing UI text before processing ===');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Create test image
  const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0lbKcgAAAABJRU5ErkJggg==', 'base64');
  const testImagePath = require('path').join(__dirname, '../fixtures/ui-test.png');
  require('fs').writeFileSync(testImagePath, testImageBuffer);

  // Upload and check initial state
  await page.locator('input[type="file"]').setInputFiles(testImagePath);
  await page.waitForTimeout(2000);
  
  await page.locator('text=/remove background/i').first().click();
  await page.waitForTimeout(2000);

  // Now we should be on the processing interface - check what text is shown
  console.log('=== Checking processing interface text ===');
  
  // Take screenshot to see the UI
  await page.screenshot({ path: 'processing-interface-initial.png', fullPage: true });
  
  // Look for text in the card section
  const cardSection = page.locator('.glass, [class*="card"], [class*="p-6"]').first();
  if (await cardSection.isVisible()) {
    const cardText = await cardSection.textContent();
    console.log('Card section text:');
    console.log(cardText);
    
    // Check for specific problematic text
    const hasProcessingText = cardText?.includes('Processing');
    const hasProcessingDots = cardText?.includes('Processing...');
    const hasReadyText = cardText?.includes('Ready');
    
    console.log(`Contains "Processing": ${hasProcessingText}`);
    console.log(`Contains "Processing...": ${hasProcessingDots}`);
    console.log(`Contains "Ready": ${hasReadyText}`);
  }
  
  // Check if Start Processing button is visible
  const startButton = page.locator('button:has-text("Start Processing")');
  const isStartButtonVisible = await startButton.isVisible();
  console.log(`Start Processing button visible: ${isStartButtonVisible}`);
  
  // Check page title/header
  const headerText = await page.locator('h1, h2, h3').allTextContents();
  console.log('Headers found:', headerText);
  
  console.log('=== UI test completed ===');
});
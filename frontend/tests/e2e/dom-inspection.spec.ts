import { test } from '@playwright/test';

test('Direct DOM inspection', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  // Get the actual HTML content
  const htmlContent = await page.content();
  console.log('=== PAGE HTML ANALYSIS ===');
  
  // Check if the source contains Photo Restoration
  const hasPhotoRestorationInSource = htmlContent.includes('Photo Restoration');
  console.log('HTML source contains "Photo Restoration":', hasPhotoRestorationInSource);
  
  const hasEnhanceQualityInSource = htmlContent.includes('Enhance Quality');
  console.log('HTML source contains "Enhance Quality":', hasEnhanceQualityInSource);
  
  // Look for the operations array in the JavaScript
  const hasOperationsArray = htmlContent.includes('operations');
  console.log('HTML contains operations array:', hasOperationsArray);
  
  // Check for Next.js compilation info
  const hasNextJsInfo = htmlContent.includes('_next');
  console.log('Has Next.js compilation artifacts:', hasNextJsInfo);
  
  // Save HTML to file for inspection
  require('fs').writeFileSync('page-source.html', htmlContent);
  console.log('Page source saved to page-source.html');
  
  // Check the actual text visible on screen
  const visibleText = await page.locator('body').innerText();
  console.log('=== VISIBLE TEXT CHECK ===');
  console.log('Contains "Photo Restoration":', visibleText.includes('Photo Restoration'));
  console.log('Contains "Enhance Quality":', visibleText.includes('Enhance Quality'));
  console.log('Contains "What would you like to do":', visibleText.includes('What would you like to do'));
  
  // Try to navigate through the user flow by JavaScript
  await page.evaluate(() => {
    console.log('Checking for ProcessingOptions component...');
    const elements = document.querySelectorAll('*');
    for (let el of elements) {
      if (el.textContent && el.textContent.includes('Photo Restoration')) {
        console.log('Found Photo Restoration element:', el.tagName, el.className);
      }
      if (el.textContent && el.textContent.includes('Enhance Quality')) {
        console.log('Found Enhance Quality element:', el.tagName, el.className);
      }
    }
  });
});
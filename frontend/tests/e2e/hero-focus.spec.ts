import { test, expect } from '@playwright/test'
import { TEST_URLS, waitForNetworkIdle } from '../fixtures/test-helpers'

test.describe('AI Image Studio - Hero Section Focus Test', () => {

  test('should check Hero section positioning and content', async ({ page }) => {
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
    
    // Wait for animations to complete
    await page.waitForTimeout(3000)
    
    console.log('🎯 Testing Hero section specifically...')

    // Check if Hero section exists and is visible
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    
    // Get the Hero section position
    const heroBox = await heroSection.boundingBox()
    console.log(`Hero section position: x=${heroBox?.x}, y=${heroBox?.y}, width=${heroBox?.width}, height=${heroBox?.height}`)
    
    // Check if Hero section is at the top of the page
    expect(heroBox?.y).toBeLessThan(100) // Should be near the top
    
    // Find the H1 within the Hero section specifically
    const h1InHero = heroSection.locator('h1')
    await expect(h1InHero).toBeVisible()
    
    const h1Text = await h1InHero.textContent()
    const h1Box = await h1InHero.boundingBox()
    
    console.log(`H1 text: "${h1Text}"`)
    console.log(`H1 position: x=${h1Box?.x}, y=${h1Box?.y}, width=${h1Box?.width}, height=${h1Box?.height}`)
    
    // Check if H1 is properly positioned within the Hero section
    if (heroBox && h1Box) {
      const h1RelativeY = h1Box.y - heroBox.y
      console.log(`H1 relative to Hero: ${h1RelativeY}px from top`)
      
      // H1 should be roughly in the center of the Hero section
      const heroMiddle = heroBox.height / 2
      const isReasonablyCentered = Math.abs(h1RelativeY - heroMiddle) < heroBox.height * 0.3
      
      console.log(`Hero height: ${heroBox.height}, Hero middle: ${heroMiddle}, H1 relative Y: ${h1RelativeY}`)
      console.log(`Is H1 reasonably centered in Hero: ${isReasonablyCentered}`)
    }
    
    // Check for specific text content
    expect(h1Text).toContain('AI Image Studio')
    expect(h1Text).toContain('Next-Gen Editing')
    
    // Test the spacing in the text
    const cleanText = h1Text?.replace(/\s+/g, ' ').trim()
    console.log(`Cleaned H1 text: "${cleanText}"`)
    
    // Take specific screenshot of just the Hero section
    await page.screenshot({ 
      path: 'test-results/hero-section-focus.png',
      clip: heroBox || undefined
    })
    
    // Check if all Hero elements are present
    const heroElements = {
      badge: heroSection.locator('[class*="glass"]').first(),
      heading: heroSection.locator('h1'),
      subtitle: heroSection.locator('p').first(),
      buttons: heroSection.locator('button')
    }
    
    for (const [name, element] of Object.entries(heroElements)) {
      const count = await element.count()
      console.log(`${name}: ${count} elements found`)
      
      if (count > 0) {
        await expect(element.first()).toBeVisible()
      }
    }
    
    console.log('✅ Hero section analysis complete')
  })

  test('should test page layout without animations', async ({ page }) => {
    // Disable animations to see the static layout
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    })
    
    await page.goto(TEST_URLS.HOME)
    await page.waitForTimeout(1000) // Minimal wait since animations are disabled
    
    console.log('🎯 Testing static layout...')
    
    // Check the page structure without animations
    const sections = page.locator('section')
    const sectionCount = await sections.count()
    
    console.log(`Total sections: ${sectionCount}`)
    
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i)
      const sectionBox = await section.boundingBox()
      
      if (sectionBox) {
        console.log(`Section ${i}: y=${sectionBox.y}, height=${sectionBox.height}`)
      }
    }
    
    // Check if the first section (Hero) is actually at the top
    const firstSection = sections.first()
    const firstSectionBox = await firstSection.boundingBox()
    
    console.log(`First section position: y=${firstSectionBox?.y}`)
    
    // Take full page screenshot without animations
    await page.screenshot({ 
      path: 'test-results/static-layout.png',
      fullPage: true
    })
  })
})
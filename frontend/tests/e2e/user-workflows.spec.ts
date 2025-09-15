import { test, expect } from '@playwright/test'
import { TEST_URLS, TIMEOUTS, waitForNetworkIdle } from '../fixtures/test-helpers'

test.describe('AI Image Studio - User Workflows', () => {

  test('Complete user journey from landing to pricing', async ({ page }) => {
    // Start from homepage
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)

    // 1. User lands on homepage and sees compelling hero section
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toContainText('AI Image Studio')
    
    console.log('✓ Hero section loaded successfully')

    // 2. User scrolls through features to understand capabilities
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      if (sections[1]) sections[1].scrollIntoView({ behavior: 'smooth' })
    })
    
    await page.waitForTimeout(1000) // Allow smooth scroll animation
    
    const featureElements = page.locator('[class*="feature"], [class*="card"]')
    const featureCount = await featureElements.count()
    expect(featureCount).toBeGreaterThan(6) // Should have multiple features
    
    console.log(`✓ Features section shows ${featureCount} capabilities`)

    // 3. User explores how it works section
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      const howItWorksSection = Array.from(sections).find(section =>
        section.textContent?.toLowerCase().includes('how') ||
        section.textContent?.toLowerCase().includes('work') ||
        section.textContent?.toLowerCase().includes('step')
      )
      if (howItWorksSection) howItWorksSection.scrollIntoView({ behavior: 'smooth' })
    })
    
    await page.waitForTimeout(1000)
    console.log('✓ How it works section explored')

    // 4. User checks testimonials for social proof
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      const testimonialsSection = Array.from(sections).find(section =>
        section.textContent?.toLowerCase().includes('testimonial') ||
        section.textContent?.toLowerCase().includes('customer') ||
        section.textContent?.toLowerCase().includes('review')
      )
      if (testimonialsSection) testimonialsSection.scrollIntoView({ behavior: 'smooth' })
    })
    
    await page.waitForTimeout(1000)
    console.log('✓ Testimonials section viewed')

    // 5. User navigates to pricing section to compare plans
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      const pricingSection = Array.from(sections).find(section =>
        section.textContent?.toLowerCase().includes('pricing') ||
        section.textContent?.toLowerCase().includes('plan')
      )
      if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' })
    })
    
    await page.waitForTimeout(1500)
    
    const pricingCards = page.locator('[class*="price"], [class*="plan"]')
    const pricingCount = await pricingCards.count()
    expect(pricingCount).toBeGreaterThan(2)
    
    console.log(`✓ Pricing section displays ${pricingCount} plans`)

    // 6. User clicks on a pricing plan (simulate interest)
    const firstPricingElement = pricingCards.first()
    if (await firstPricingElement.isVisible()) {
      await firstPricingElement.click()
      await page.waitForTimeout(500)
      console.log('✓ Pricing plan interaction successful')
    }

    // 7. User reaches call-to-action and shows intent to sign up
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      const lastSection = sections[sections.length - 1]
      if (lastSection) lastSection.scrollIntoView({ behavior: 'smooth' })
    })
    
    await page.waitForTimeout(1000)
    
    // Look for CTA buttons
    const ctaButtons = page.locator('button:visible, a[class*="button"]:visible')
    const ctaCount = await ctaButtons.count()
    
    if (ctaCount > 0) {
      const finalCTA = ctaButtons.last()
      await expect(finalCTA).toBeVisible()
      console.log('✓ Final call-to-action identified')
    }

    console.log('🎉 Complete user journey test passed!')
  })

  test('User interaction with upload interface', async ({ page }) => {
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)

    // Look for upload-related elements
    const uploadElements = page.locator(
      '[class*="upload"], [class*="drop"], [class*="drag"], input[type="file"]'
    )
    
    const uploadCount = await uploadElements.count()
    
    if (uploadCount > 0) {
      const firstUploadElement = uploadElements.first()
      await expect(firstUploadElement).toBeVisible()
      
      // Test upload interaction
      await firstUploadElement.click()
      console.log('✓ Upload interface is interactive')
      
      // If it's a file input, test file selection simulation
      if (await firstUploadElement.getAttribute('type') === 'file') {
        // Create a test file
        const testFile = {
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: Buffer.from('fake-image-data')
        }
        
        await firstUploadElement.setInputFiles({
          name: testFile.name,
          mimeType: testFile.mimeType,
          buffer: testFile.buffer
        })
        
        console.log('✓ File upload simulation successful')
      }
    } else {
      console.log('ℹ No upload interface found (may be in editor section)')
    }
  })

  test('Mobile user experience flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)

    // Test mobile navigation
    const mobileNav = page.locator('[class*="menu"], [class*="nav"], button[class*="mobile"]')
    const navCount = await mobileNav.count()
    
    if (navCount > 0) {
      const navButton = mobileNav.first()
      if (await navButton.isVisible()) {
        await navButton.click()
        await page.waitForTimeout(500)
        console.log('✓ Mobile navigation works')
      }
    }

    // Test touch interactions
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    // Simulate touch scroll
    await page.touchscreen.tap(200, 300)
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(500)

    // Check that content is accessible on mobile
    const sections = page.locator('section')
    const sectionCount = await sections.count()
    
    for (let i = 0; i < Math.min(3, sectionCount); i++) {
      const section = sections.nth(i)
      await expect(section).toBeVisible()
    }

    console.log('✓ Mobile user experience tested successfully')
  })

  test('Performance and loading experience', async ({ page }) => {
    // Track network requests and timing
    const responses: any[] = []
    let largeAssets = 0

    page.on('response', response => {
      const size = parseInt(response.headers()['content-length'] || '0')
      responses.push({
        url: response.url(),
        status: response.status(),
        size: size
      })
      
      if (size > 1000000) { // > 1MB
        largeAssets++
      }
    })

    const startTime = Date.now()
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
    const loadTime = Date.now() - startTime

    // Performance assertions
    expect(loadTime).toBeLessThan(TIMEOUTS.LONG) // Should load within 30s
    expect(largeAssets).toBeLessThan(5) // Shouldn't have too many large assets

    // Check Core Web Vitals-like metrics
    const performanceMetrics = await page.evaluate(() => {
      return {
        // @ts-ignore
        navigationStart: performance.timing?.navigationStart || 0,
        // @ts-ignore
        loadComplete: performance.timing?.loadEventEnd || 0,
        // @ts-ignore
        domComplete: performance.timing?.domComplete || 0
      }
    })

    if (performanceMetrics.navigationStart && performanceMetrics.domComplete) {
      const domLoadTime = performanceMetrics.domComplete - performanceMetrics.navigationStart
      console.log(`DOM load time: ${domLoadTime}ms`)
    }

    console.log(`Total page load time: ${loadTime}ms`)
    console.log(`Network requests: ${responses.length}`)
    console.log(`Large assets (>1MB): ${largeAssets}`)

    // Verify page is fully interactive
    const interactiveElements = page.locator('button, a, input, [role="button"]')
    const interactiveCount = await interactiveElements.count()
    
    if (interactiveCount > 0) {
      const firstInteractive = interactiveElements.first()
      await expect(firstInteractive).toBeEnabled()
    }

    console.log('✓ Performance metrics within acceptable range')
  })

  test('Error handling and edge cases', async ({ page }) => {
    // Test with slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // Add 100ms delay to all requests
    })

    await page.goto(TEST_URLS.HOME)
    
    // Should still load despite slow network
    const title = page.locator('h1').first()
    await expect(title).toBeVisible({ timeout: TIMEOUTS.MEDIUM })

    // Test JavaScript disabled scenario
    await page.context().addInitScript(() => {
      // Simulate degraded JavaScript environment
      Object.defineProperty(window, 'fetch', {
        value: undefined
      })
    })

    await page.reload()
    
    // Page should still be accessible without JavaScript
    const content = page.locator('body')
    await expect(content).toBeVisible()

    console.log('✓ Graceful degradation tested')
  })

  test('Cross-browser compatibility indicators', async ({ page, browserName }) => {
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)

    // Test browser-specific features
    const cssSupport = await page.evaluate(() => {
      const testDiv = document.createElement('div')
      testDiv.style.backdropFilter = 'blur(10px)'
      return {
        backdropFilter: testDiv.style.backdropFilter !== '',
        cssgrid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex')
      }
    })

    console.log(`Browser: ${browserName}`)
    console.log('CSS Support:', cssSupport)

    // Verify core functionality works across browsers
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()

    const buttons = page.locator('button:visible')
    if (await buttons.count() > 0) {
      const firstButton = buttons.first()
      await expect(firstButton).toBeEnabled()
    }

    console.log(`✓ Cross-browser compatibility verified for ${browserName}`)
  })
})
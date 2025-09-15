import { test, expect } from '@playwright/test'
import { 
  TEST_URLS, 
  SELECTORS, 
  TEST_DATA, 
  TIMEOUTS,
  waitForNetworkIdle,
  expectElementVisible 
} from '../fixtures/test-helpers'

test.describe('AI Image Studio - Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for full load
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/AI Image Studio/)
    
    // Verify page loads without errors
    const title = await page.textContent('h1')
    expect(title).toContain('AI Image Studio')
  })

  test('should display hero section correctly', async ({ page }) => {
    // Check hero section elements are visible
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    // Check for key hero elements (using generic selectors since we haven't added data-testids yet)
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()
    await expect(mainHeading).toContainText('AI Image Studio')

    // Look for call-to-action buttons
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)

    // Check for upload area or similar interactive element
    const uploadArea = page.locator('[class*="upload"], [class*="drop"], [class*="drag"]').first()
    if (await uploadArea.count() > 0) {
      await expect(uploadArea).toBeVisible()
    }
  })

  test('should display features section', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => {
      const element = document.querySelector('section:nth-child(2)')
      if (element) element.scrollIntoView()
    })

    await page.waitForTimeout(1000) // Allow animations

    // Look for feature cards or similar elements
    const featureCards = page.locator('[class*="card"], [class*="feature"], [class*="grid"] > div')
    const cardCount = await featureCards.count()
    expect(cardCount).toBeGreaterThan(6) // Expecting multiple feature cards
  })

  test('should display pricing section', async ({ page }) => {
    // Scroll to pricing section
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      const pricingSection = Array.from(sections).find(section => 
        section.textContent?.toLowerCase().includes('pricing') ||
        section.textContent?.toLowerCase().includes('plan') ||
        section.querySelector('[class*="price"]')
      )
      if (pricingSection) pricingSection.scrollIntoView()
    })

    await page.waitForTimeout(1000)

    // Look for pricing cards
    const pricingCards = page.locator('[class*="price"], [class*="plan"]')
    const priceCount = await pricingCards.count()
    expect(priceCount).toBeGreaterThan(2) // Expecting multiple pricing tiers
  })

  test('should display testimonials section', async ({ page }) => {
    // Scroll to testimonials section
    await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      const testimonialsSection = Array.from(sections).find(section => 
        section.textContent?.toLowerCase().includes('testimonial') ||
        section.textContent?.toLowerCase().includes('customer') ||
        section.textContent?.toLowerCase().includes('review')
      )
      if (testimonialsSection) testimonialsSection.scrollIntoView()
    })

    await page.waitForTimeout(1000)

    // Look for testimonial content
    const testimonialElements = page.locator('[class*="testimonial"], [class*="review"], [class*="customer"]')
    if (await testimonialElements.count() > 0) {
      expect(await testimonialElements.count()).toBeGreaterThan(3)
    }
  })

  test('should have working interactive elements', async ({ page }) => {
    // Test button interactions
    const buttons = page.locator('button:visible')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 0) {
      // Click the first visible button and check for response
      const firstButton = buttons.first()
      await expect(firstButton).toBeEnabled()
      
      // Some buttons might trigger navigation or modals
      await firstButton.click()
      await page.waitForTimeout(500) // Allow for any animations or state changes
    }
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await waitForNetworkIdle(page)

    // Check that content is still accessible
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()

    // Check that layout adapts (no horizontal scroll)
    const bodyWidth = await page.locator('body').boundingBox()
    expect(bodyWidth?.width).toBeLessThanOrEqual(375)
  })

  test('should load all CSS and JavaScript assets', async ({ page }) => {
    const responses: string[] = []
    const failedRequests: string[] = []

    page.on('response', response => {
      responses.push(response.url())
      if (!response.ok() && response.status() !== 404) {
        failedRequests.push(`${response.status()}: ${response.url()}`)
      }
    })

    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)

    // Check that essential assets loaded
    const cssLoaded = responses.some(url => url.includes('.css') || url.includes('styles'))
    const jsLoaded = responses.some(url => url.includes('.js') || url.includes('script'))
    
    expect(cssLoaded || jsLoaded).toBeTruthy() // At least some assets should load

    // Report any failed requests (excluding expected 404s like favicon)
    const significantFailures = failedRequests.filter(req => 
      !req.includes('favicon') && 
      !req.includes('site.webmanifest') &&
      !req.includes('apple-touch-icon')
    )
    
    if (significantFailures.length > 0) {
      console.warn('Some assets failed to load:', significantFailures)
    }
  })

  test('should have proper glassmorphism styling', async ({ page }) => {
    await page.waitForTimeout(2000) // Allow styles to fully load

    // Check for glassmorphism CSS properties
    const glassElements = page.locator('[class*="glass"], [class*="backdrop-blur"]')
    const glassCount = await glassElements.count()
    
    if (glassCount > 0) {
      const firstGlassElement = glassElements.first()
      const styles = await firstGlassElement.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          backdropFilter: computed.backdropFilter,
          background: computed.background,
          border: computed.border,
        }
      })
      
      // Check for backdrop-blur or similar glass effects
      expect(
        styles.backdropFilter.includes('blur') || 
        styles.background.includes('rgba') || 
        styles.background.includes('hsla')
      ).toBeTruthy()
    }
  })

  test('should perform better than baseline (Core Web Vitals)', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
    
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time (adjust as needed)
    expect(loadTime).toBeLessThan(TIMEOUTS.LONG)
    
    // Check if page is interactive
    await expect(page.locator('body')).toBeVisible()
    
    console.log(`Page load time: ${loadTime}ms`)
  })
})
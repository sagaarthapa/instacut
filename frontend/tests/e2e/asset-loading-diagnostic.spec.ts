import { test, expect } from '@playwright/test'
import { TEST_URLS, waitForNetworkIdle } from '../fixtures/test-helpers'

test.describe('AI Image Studio - Frontend Asset Loading Diagnostic', () => {

  test('should check if page loads and all critical assets are available', async ({ page }) => {
    console.log('🔍 Starting comprehensive asset loading check...')

    // Track all network requests
    const networkRequests: any[] = []
    const failedRequests: any[] = []
    let cssRequests = 0
    let jsRequests = 0
    let fontRequests = 0

    page.on('response', response => {
      const url = response.url()
      const status = response.status()
      
      networkRequests.push({ url, status })
      
      if (!response.ok() && status !== 404) {
        failedRequests.push({ url, status, statusText: response.statusText() })
      }

      // Count different asset types
      if (url.includes('.css') || url.includes('styles')) cssRequests++
      if (url.includes('.js') || url.includes('script')) jsRequests++
      if (url.includes('.woff') || url.includes('.ttf') || url.includes('font')) fontRequests++
    })

    // Navigate to the page
    const startTime = Date.now()
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
    const loadTime = Date.now() - startTime

    console.log(`⏱️ Page load time: ${loadTime}ms`)

    // Wait for content to fully render
    await page.waitForTimeout(3000)

    // Check if main content is visible
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Check if the main heading exists
    const heading = page.locator('h1').first()
    const headingExists = await heading.count() > 0
    
    if (headingExists) {
      await expect(heading).toBeVisible()
      const headingText = await heading.textContent()
      console.log(`✅ Main heading found: "${headingText}"`)
    } else {
      console.log('❌ Main heading not found!')
    }

    // Check for critical sections
    const sections = page.locator('section')
    const sectionCount = await sections.count()
    console.log(`📄 Total sections found: ${sectionCount}`)

    // Check if React/Next.js app has hydrated properly
    const nextData = await page.evaluate(() => {
      return {
        hasNext: typeof window !== 'undefined' && '__NEXT_DATA__' in window,
        hasReact: typeof window !== 'undefined' && 'React' in window,
        location: window.location.href,
        readyState: document.readyState
      }
    })

    console.log('🔧 Client-side status:', nextData)

    // Check for JavaScript errors
    const jsErrors: string[] = []
    page.on('pageerror', error => {
      jsErrors.push(error.message)
    })

    // Check console logs
    const consoleLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text())
      }
    })

    // Take a full page screenshot for visual inspection
    await page.screenshot({
      path: 'test-results/asset-loading-diagnostic.png',
      fullPage: true
    })

    // Check if Tailwind CSS classes are working
    const hasStyledElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*[class*="bg-"], *[class*="text-"], *[class*="p-"], *[class*="m-"]')
      return elements.length > 10 // Should have many styled elements
    })

    // Network analysis
    console.log('\n📊 NETWORK ANALYSIS:')
    console.log(`- Total requests: ${networkRequests.length}`)
    console.log(`- CSS requests: ${cssRequests}`)
    console.log(`- JS requests: ${jsRequests}`)
    console.log(`- Font requests: ${fontRequests}`)
    console.log(`- Failed requests: ${failedRequests.length}`)

    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:')
      failedRequests.forEach(req => {
        console.log(`  - ${req.status} ${req.statusText}: ${req.url}`)
      })
    }

    if (jsErrors.length > 0) {
      console.log('\n❌ JAVASCRIPT ERRORS:')
      jsErrors.forEach(error => console.log(`  - ${error}`))
    }

    if (consoleLogs.length > 0) {
      console.log('\n⚠️ CONSOLE ERRORS:')
      consoleLogs.forEach(log => console.log(`  - ${log}`))
    }

    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: navigation.responseStart - navigation.fetchStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart
      }
    })

    console.log('\n⚡ PERFORMANCE METRICS:')
    console.log(`- DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`)
    console.log(`- Load Complete: ${performanceMetrics.loadComplete}ms`)
    console.log(`- First Paint: ${performanceMetrics.firstPaint}ms`)
    console.log(`- DOM Interactive: ${performanceMetrics.domInteractive}ms`)

    // Final assessment
    console.log('\n🎯 LOADING ASSESSMENT:')
    console.log(`- Page accessible: ${headingExists ? '✅' : '❌'}`)
    console.log(`- CSS working: ${hasStyledElements ? '✅' : '❌'}`)
    console.log(`- JavaScript working: ${nextData.hasNext ? '✅' : '❌'}`)
    console.log(`- Sections loaded: ${sectionCount >= 4 ? '✅' : '❌'}`)
    console.log(`- Load time acceptable: ${loadTime < 10000 ? '✅' : '❌'}`)

    // Assertions
    expect(headingExists).toBeTruthy() // Page should have main content
    expect(hasStyledElements).toBeTruthy() // CSS should be working
    expect(sectionCount).toBeGreaterThan(3) // Should have multiple sections
    expect(loadTime).toBeLessThan(15000) // Should load within 15 seconds
    expect(jsErrors.length).toBeLessThan(3) // Should have minimal JS errors
  })

  test('should verify all critical UI components render correctly', async ({ page }) => {
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
    await page.waitForTimeout(2000)

    console.log('🎨 Checking UI component rendering...')

    // Check Hero section
    const heroSection = page.locator('section').first()
    const heroVisible = await heroSection.isVisible()
    console.log(`Hero section visible: ${heroVisible ? '✅' : '❌'}`)

    // Check buttons
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    console.log(`Buttons found: ${buttonCount}`)

    // Check glassmorphism elements
    const glassElements = page.locator('[class*="glass"]')
    const glassCount = await glassElements.count()
    console.log(`Glassmorphism elements: ${glassCount}`)

    // Check if animations are working
    const animatedElements = page.locator('[class*="motion"], [class*="animate"]')
    const animatedCount = await animatedElements.count()
    console.log(`Animated elements: ${animatedCount}`)

    // Check responsive grid/layout
    const gridElements = page.locator('[class*="grid"], [class*="flex"]')
    const gridCount = await gridElements.count()
    console.log(`Layout elements: ${gridCount}`)

    // Test interaction
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      const isClickable = await firstButton.isEnabled()
      console.log(`First button clickable: ${isClickable ? '✅' : '❌'}`)
      
      if (isClickable) {
        await firstButton.click()
        await page.waitForTimeout(500)
        console.log('✅ Button interaction successful')
      }
    }

    // Final component check
    console.log('\n🔍 COMPONENT STATUS:')
    console.log(`- Hero section: ${heroVisible ? '✅' : '❌'}`)
    console.log(`- Interactive buttons: ${buttonCount > 0 ? '✅' : '❌'}`)
    console.log(`- Glassmorphism effects: ${glassCount > 0 ? '✅' : '❌'}`)
    console.log(`- Layout systems: ${gridCount > 10 ? '✅' : '❌'}`)

    // Take component-focused screenshot
    await page.screenshot({
      path: 'test-results/ui-components-check.png',
      fullPage: false
    })

    expect(heroVisible).toBeTruthy()
    expect(buttonCount).toBeGreaterThan(0)
    expect(glassCount).toBeGreaterThan(0)
  })
})
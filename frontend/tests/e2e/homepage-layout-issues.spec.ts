import { test, expect } from '@playwright/test'
import { TEST_URLS, TIMEOUTS, waitForNetworkIdle } from '../fixtures/test-helpers'

test.describe('AI Image Studio - Homepage Layout & Alignment Issues', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URLS.HOME)
    await waitForNetworkIdle(page)
    await page.waitForTimeout(2000) // Allow animations and full content loading
  })

  test('should check all icons are loading properly', async ({ page }) => {
    console.log('🔍 Checking icon loading...')
    
    // Check for different types of icons
    const iconSelectors = [
      'svg', // SVG icons
      '[class*="icon"]', // Icon classes
      'img[src*="icon"]', // Icon images
      '[class*="heroicon"]', // Heroicons
      '[class*="lucide"]', // Lucide icons
      'i[class*="fa"]' // Font Awesome icons
    ]

    let totalIcons = 0
    let loadedIcons = 0
    let brokenIcons = []

    for (const selector of iconSelectors) {
      const icons = page.locator(selector)
      const count = await icons.count()
      totalIcons += count

      console.log(`Found ${count} icons with selector: ${selector}`)

      // Check each icon's loading state
      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i)
        
        try {
          await expect(icon).toBeVisible({ timeout: 2000 })
          
          // Check if it's an image that might fail to load
          if (await icon.getAttribute('src')) {
            const src = await icon.getAttribute('src')
            if (src && !src.startsWith('data:')) {
              // Check if external image loads
              const response = await page.request.get(src)
              if (response.ok()) {
                loadedIcons++
              } else {
                brokenIcons.push(`${selector}[${i}]: ${src}`)
              }
            } else {
              loadedIcons++
            }
          } else {
            // SVG or CSS icon
            loadedIcons++
          }
        } catch (error) {
          brokenIcons.push(`${selector}[${i}]: Not visible - ${error.message}`)
        }
      }
    }

    console.log(`📊 Icon Status: ${loadedIcons}/${totalIcons} loaded successfully`)
    if (brokenIcons.length > 0) {
      console.log('❌ Broken icons:', brokenIcons)
    }

    // Take screenshot of current state
    await page.screenshot({ 
      path: 'test-results/homepage-icons.png', 
      fullPage: true 
    })

    expect(loadedIcons).toBeGreaterThan(0) // Should have some icons
    expect(brokenIcons.length).toBeLessThan(totalIcons * 0.2) // Less than 20% broken
  })

  test('should check text alignment and positioning', async ({ page }) => {
    console.log('📐 Checking text alignment...')

    // Check main heading alignment
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()

    const headingBox = await mainHeading.boundingBox()
    const headingText = await mainHeading.textContent()
    console.log(`Main heading: "${headingText}"`)
    console.log(`Heading position: x=${headingBox?.x}, y=${headingBox?.y}, width=${headingBox?.width}`)

    // Check if heading is roughly centered or properly aligned
    const pageWidth = await page.evaluate(() => window.innerWidth)
    const isReasonablyCentered = headingBox && headingBox.x > pageWidth * 0.1 && headingBox.x < pageWidth * 0.9

    expect(isReasonablyCentered).toBeTruthy()

    // Check all headings for alignment issues
    const allHeadings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await allHeadings.count()

    console.log(`Found ${headingCount} headings`)

    let alignmentIssues = []

    for (let i = 0; i < Math.min(headingCount, 10); i++) { // Check first 10 headings
      const heading = allHeadings.nth(i)
      const text = await heading.textContent()
      const box = await heading.boundingBox()
      
      if (box) {
        // Check if heading is positioned reasonably
        const isOffscreen = box.x < -100 || box.x > pageWidth + 100
        const hasNegativeWidth = box.width <= 0
        const hasNegativeHeight = box.height <= 0
        
        if (isOffscreen || hasNegativeWidth || hasNegativeHeight) {
          alignmentIssues.push(`Heading ${i}: "${text}" - Position issues: x=${box.x}, w=${box.width}, h=${box.height}`)
        }
      }
    }

    if (alignmentIssues.length > 0) {
      console.log('❌ Alignment issues found:', alignmentIssues)
    }

    expect(alignmentIssues.length).toBeLessThan(3) // Allow up to 2 minor issues
  })

  test('should check button and interactive element alignment', async ({ page }) => {
    console.log('🔲 Checking button alignment...')

    const buttons = page.locator('button, [role="button"], a[class*="btn"]')
    const buttonCount = await buttons.count()

    console.log(`Found ${buttonCount} interactive elements`)

    let buttonIssues = []

    for (let i = 0; i < Math.min(buttonCount, 15); i++) { // Check first 15 buttons
      const button = buttons.nth(i)
      
      try {
        await expect(button).toBeVisible({ timeout: 1000 })
        
        const box = await button.boundingBox()
        const text = await button.textContent()
        
        if (box) {
          // Check for common button issues
          const tooSmall = box.width < 10 || box.height < 10
          const overlapping = box.x < 0
          const offscreen = box.x > await page.evaluate(() => window.innerWidth)
          
          if (tooSmall || overlapping || offscreen) {
            buttonIssues.push(`Button ${i}: "${text}" - Issues: small=${tooSmall}, overlap=${overlapping}, offscreen=${offscreen}`)
          }
        }
      } catch (error) {
        buttonIssues.push(`Button ${i}: Not visible or accessible`)
      }
    }

    if (buttonIssues.length > 0) {
      console.log('❌ Button issues found:', buttonIssues)
    }

    // Take screenshot focusing on interactive elements
    await page.screenshot({ 
      path: 'test-results/homepage-buttons.png', 
      fullPage: true 
    })

    expect(buttonIssues.length).toBeLessThan(buttonCount * 0.3) // Less than 30% should have issues
  })

  test('should check CSS loading and styles application', async ({ page }) => {
    console.log('🎨 Checking CSS styles...')

    // Check if Tailwind CSS is loaded
    const bodyElement = page.locator('body')
    const bodyStyles = await bodyElement.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontFamily: computed.fontFamily,
        backgroundColor: computed.backgroundColor,
        margin: computed.margin,
        padding: computed.padding
      }
    })

    console.log('Body styles:', bodyStyles)

    // Check if glassmorphism effects are applied
    const glassElements = page.locator('[class*="glass"], [class*="backdrop"]')
    const glassCount = await glassElements.count()
    
    console.log(`Found ${glassCount} glass elements`)

    if (glassCount > 0) {
      const firstGlass = glassElements.first()
      const glassStyles = await firstGlass.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          backdropFilter: computed.backdropFilter,
          background: computed.background,
          border: computed.border
        }
      })
      
      console.log('Glass element styles:', glassStyles)
      
      // Check if backdrop-filter is actually applied
      const hasBackdropFilter = glassStyles.backdropFilter && glassStyles.backdropFilter !== 'none'
      const hasTransparentBg = glassStyles.background.includes('rgba') || glassStyles.background.includes('hsla')
      
      if (!hasBackdropFilter && !hasTransparentBg) {
        console.log('⚠️ Glassmorphism effects may not be working properly')
      }
    }

    // Check for missing font loading
    const textElements = page.locator('h1, h2, h3, p, span, div')
    const firstTextElement = textElements.first()
    
    if (await firstTextElement.count() > 0) {
      const fontInfo = await firstTextElement.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight
        }
      })
      
      console.log('Text element font info:', fontInfo)
      
      // Check if fonts are properly loaded (not falling back to basic fonts)
      const isBasicFont = fontInfo.fontFamily.includes('serif') || 
                         fontInfo.fontFamily.includes('sans-serif') || 
                         fontInfo.fontFamily === 'Times' ||
                         fontInfo.fontFamily === 'Arial'
      
      if (isBasicFont) {
        console.log('⚠️ May be using fallback fonts - custom fonts might not be loaded')
      }
    }
  })

  test('should check responsive layout at different breakpoints', async ({ page }) => {
    console.log('📱 Checking responsive layout...')

    const breakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ]

    for (const breakpoint of breakpoints) {
      console.log(`Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`)
      
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      })
      
      await page.waitForTimeout(1000) // Allow layout to adjust

      // Check if main content is visible
      const mainHeading = page.locator('h1').first()
      await expect(mainHeading).toBeVisible()

      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = breakpoint.width
      
      if (bodyWidth > viewportWidth * 1.1) { // Allow 10% tolerance
        console.log(`⚠️ Horizontal overflow detected at ${breakpoint.name}: body=${bodyWidth}px, viewport=${viewportWidth}px`)
      }

      // Take screenshot for this breakpoint
      await page.screenshot({ 
        path: `test-results/homepage-${breakpoint.name.toLowerCase()}.png`,
        fullPage: false // Just visible area
      })

      // Check if navigation is accessible
      const navElements = page.locator('nav, [role="navigation"], [class*="nav"]')
      const navCount = await navElements.count()
      
      if (navCount > 0) {
        const firstNav = navElements.first()
        const isNavVisible = await firstNav.isVisible()
        console.log(`Navigation visible at ${breakpoint.name}: ${isNavVisible}`)
      }
    }
  })

  test('should identify specific layout and content issues', async ({ page }) => {
    console.log('🔍 Deep dive into layout issues...')

    // Check the exact content that's causing test failures
    const actualH1Text = await page.locator('h1').first().textContent()
    console.log(`Actual H1 text: "${actualH1Text}"`)
    
    // Check for pricing section issues
    const pricingSections = page.locator('section')
    const sectionCount = await pricingSections.count()
    console.log(`Found ${sectionCount} sections`)

    for (let i = 0; i < sectionCount; i++) {
      const section = pricingSections.nth(i)
      const sectionText = await section.textContent()
      
      if (sectionText && sectionText.toLowerCase().includes('pric')) {
        console.log(`Pricing section ${i} found:`, sectionText.substring(0, 100) + '...')
        
        // Look for pricing cards within this section
        const priceElements = section.locator('[class*="price"], [class*="plan"], [class*="tier"], .price, .plan')
        const priceCount = await priceElements.count()
        console.log(`Found ${priceCount} pricing elements in section ${i}`)
        
        if (priceCount === 0) {
          // Try different selectors
          const alternativeElements = section.locator('div[class*="card"], div[class*="box"]')
          const altCount = await alternativeElements.count()
          console.log(`Found ${altCount} card-like elements as alternatives`)
        }
      }
    }

    // Check for missing or broken images
    const images = page.locator('img')
    const imageCount = await images.count()
    console.log(`Found ${imageCount} images`)

    let brokenImages = []
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i)
      const src = await img.getAttribute('src')
      const alt = await img.getAttribute('alt')
      
      try {
        await expect(img).toBeVisible({ timeout: 2000 })
        
        if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
          const response = await page.request.get(src)
          if (!response.ok()) {
            brokenImages.push(`Image ${i}: ${src} (${response.status()})`)
          }
        }
      } catch (error) {
        brokenImages.push(`Image ${i}: ${src} - ${error.message}`)
      }
    }

    if (brokenImages.length > 0) {
      console.log('❌ Broken images:', brokenImages)
    }

    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-complete-analysis.png',
      fullPage: true 
    })

    // Log console errors from the page
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.reload()
    await page.waitForTimeout(3000)

    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:', consoleErrors)
    }

    // Summary report
    console.log('\n📋 LAYOUT ANALYSIS SUMMARY:')
    console.log(`- H1 Text: "${actualH1Text}"`)
    console.log(`- Total sections: ${sectionCount}`)
    console.log(`- Total images: ${imageCount}`)
    console.log(`- Broken images: ${brokenImages.length}`)
    console.log(`- Console errors: ${consoleErrors.length}`)
  })
})
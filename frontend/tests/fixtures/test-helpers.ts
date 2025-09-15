/**
 * Test fixtures and helper functions for AI Image Studio tests
 */

export const TEST_URLS = {
  HOME: '/',
  API_HEALTH: 'http://localhost:8000/health',
  API_DOCS: 'http://localhost:8000/docs',
} as const

export const SELECTORS = {
  // Hero section
  HERO_TITLE: '[data-testid="hero-title"]',
  HERO_SUBTITLE: '[data-testid="hero-subtitle"]',
  UPLOAD_BUTTON: '[data-testid="upload-button"]',
  GET_STARTED_BUTTON: '[data-testid="get-started-button"]',
  
  // Features section
  FEATURES_SECTION: '[data-testid="features-section"]',
  FEATURE_CARDS: '[data-testid="feature-card"]',
  
  // Pricing section
  PRICING_SECTION: '[data-testid="pricing-section"]',
  PRICING_CARDS: '[data-testid="pricing-card"]',
  
  // Navigation
  NAVIGATION: '[data-testid="navigation"]',
  LOGO: '[data-testid="logo"]',
  
  // Common UI elements
  BUTTONS: 'button',
  LINKS: 'a',
  IMAGES: 'img',
} as const

export const TEST_DATA = {
  // Sample image for upload testing (base64 1x1 pixel PNG)
  SAMPLE_IMAGE_BASE64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  
  // Test user data
  TEST_USER: {
    email: 'test@aiimageStudio.com',
    name: 'Test User',
  },
  
  // Expected text content
  EXPECTED_CONTENT: {
    HERO_TITLE: 'AI Image Studio',
    HERO_SUBTITLE: 'Next-Generation Image Editing',
    FEATURES_COUNT: 12,
    PRICING_PLANS: 4,
  },
} as const

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  API_RESPONSE: 15000,
} as const

/**
 * Helper function to wait for network idle
 */
export const waitForNetworkIdle = async (page: any) => {
  await page.waitForLoadState('networkidle')
}

/**
 * Helper function to take full page screenshot
 */
export const takeFullPageScreenshot = async (page: any, name: string) => {
  await page.screenshot({ 
    path: `tests/screenshots/${name}.png`, 
    fullPage: true 
  })
}

/**
 * Helper function to check if element is visible and has content
 */
export const expectElementVisible = async (page: any, selector: string) => {
  const element = page.locator(selector)
  await element.waitFor({ state: 'visible' })
  return element
}
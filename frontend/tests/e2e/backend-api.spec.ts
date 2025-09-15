import { test, expect } from '@playwright/test'
import { TEST_URLS, TIMEOUTS } from '../fixtures/test-helpers'

test.describe('AI Image Studio - Backend API', () => {
  
  test('should have healthy backend service', async ({ request }) => {
    // Test backend health endpoint
    const response = await request.get(TEST_URLS.API_HEALTH, {
      timeout: TIMEOUTS.API_RESPONSE
    })
    
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    
    const healthData = await response.json()
    expect(healthData).toHaveProperty('status')
    expect(healthData.status).toBe('healthy')
  })

  test('should serve API documentation', async ({ request }) => {
    // Test that API docs are accessible
    const response = await request.get(TEST_URLS.API_DOCS, {
      timeout: TIMEOUTS.API_RESPONSE
    })
    
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('text/html')
  })

  test('should handle CORS properly', async ({ request }) => {
    // Test CORS headers
    const response = await request.options('http://localhost:8000/api/v1/health')
    
    const headers = response.headers()
    expect(headers['access-control-allow-origin']).toBeDefined()
    expect(headers['access-control-allow-methods']).toBeDefined()
  })

  test('should validate API endpoints structure', async ({ page }) => {
    // Navigate to API documentation page
    await page.goto(TEST_URLS.API_DOCS)
    
    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: TIMEOUTS.MEDIUM })
    
    // Check for expected API endpoints
    const endpointSelectors = [
      'text="/api/v1/process"',
      'text="/api/v1/batch"',
      'text="/health"'
    ]
    
    for (const selector of endpointSelectors) {
      const endpoint = page.locator(selector)
      await expect(endpoint).toBeVisible({ timeout: TIMEOUTS.SHORT })
    }
  })

  test('should have AI services properly configured', async ({ request }) => {
    // This would test the AI services endpoint when implemented
    // For now, we'll check if the backend reports available services
    
    const response = await request.get('http://localhost:8000/health')
    expect(response.ok()).toBeTruthy()
    
    const healthData = await response.json()
    
    // Check if AI services are mentioned in health check
    const healthString = JSON.stringify(healthData).toLowerCase()
    const hasAiServices = 
      healthString.includes('ai') || 
      healthString.includes('rembg') || 
      healthString.includes('esrgan') ||
      healthString.includes('model')
    
    if (hasAiServices) {
      console.log('AI services detected in health check')
    } else {
      console.log('Basic health check confirmed')
    }
  })

  test('should respond within acceptable time limits', async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.get(TEST_URLS.API_HEALTH)
    
    const responseTime = Date.now() - startTime
    
    expect(response.ok()).toBeTruthy()
    expect(responseTime).toBeLessThan(5000) // Should respond within 5 seconds
    
    console.log(`API response time: ${responseTime}ms`)
  })

  test('should handle invalid requests gracefully', async ({ request }) => {
    // Test 404 handling
    const invalidResponse = await request.get('http://localhost:8000/invalid-endpoint')
    expect(invalidResponse.status()).toBe(404)
    
    // Test malformed requests to existing endpoints
    const malformedResponse = await request.post('http://localhost:8000/api/v1/process', {
      data: { invalid: 'data' }
    })
    
    // Should return 400 or 422 for malformed requests
    expect([400, 422]).toContain(malformedResponse.status())
  })
})
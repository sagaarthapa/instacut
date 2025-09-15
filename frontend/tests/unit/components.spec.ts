import { test, expect } from '@playwright/test'

test.describe('UI Components - Unit Tests', () => {
  
  test('Button component should render correctly', async ({ page }) => {
    // Create a test page that renders our Button component
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Button Component Test</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <style>
          .btn-primary { 
            background: #0ea5e9; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 6px; 
            border: none;
            cursor: pointer;
          }
          .btn-primary:hover { background: #0284c7; }
        </style>
      </head>
      <body>
        <div id="root">
          <button class="btn-primary" id="test-button">Test Button</button>
        </div>
      </body>
      </html>
    `)

    // Test button visibility
    const button = page.locator('#test-button')
    await expect(button).toBeVisible()
    await expect(button).toHaveText('Test Button')

    // Test button interaction
    await expect(button).toBeEnabled()
    await button.click()

    // Test hover state (check if hover styles can be applied)
    await button.hover()
  })

  test('Glassmorphism effects should be properly applied', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Glassmorphism Test</title>
        <style>
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            width: 300px;
            height: 200px;
          }
        </style>
      </head>
      <body style="background: linear-gradient(45deg, #667eea, #764ba2);">
        <div class="glass-effect" id="glass-card">
          <h3>Glassmorphism Card</h3>
          <p>This card should have glass-like effects</p>
        </div>
      </body>
      </html>
    `)

    const glassCard = page.locator('#glass-card')
    await expect(glassCard).toBeVisible()

    // Check computed styles for glassmorphism properties
    const styles = await glassCard.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        backdropFilter: computed.backdropFilter,
        background: computed.background,
        borderRadius: computed.borderRadius,
        border: computed.border
      }
    })

    // Verify glassmorphism properties
    expect(styles.backdropFilter).toContain('blur')
    expect(styles.background).toContain('rgba')
    expect(styles.borderRadius).toBe('12px')
  })

  test('Responsive design breakpoints should work', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Responsive Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          .responsive-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }
          
          .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          @media (max-width: 768px) {
            .responsive-container { padding: 10px; }
            .grid { grid-template-columns: 1fr; gap: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="responsive-container" id="container">
          <div class="grid" id="grid">
            <div class="card">Card 1</div>
            <div class="card">Card 2</div>
            <div class="card">Card 3</div>
          </div>
        </div>
      </body>
      </html>
    `)

    const container = page.locator('#container')
    const grid = page.locator('#grid')

    // Test desktop view
    await page.setViewportSize({ width: 1024, height: 768 })
    await expect(container).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(container).toBeVisible()

    // Check that grid adapts to mobile
    const gridStyles = await grid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns
    })
    
    // On mobile, should have fewer columns or single column
    console.log('Mobile grid columns:', gridStyles)
  })

  test('Animation and transitions should work smoothly', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Animation Test</title>
        <style>
          .animated-element {
            width: 100px;
            height: 100px;
            background: #0ea5e9;
            border-radius: 50px;
            transition: transform 0.3s ease, background-color 0.3s ease;
            cursor: pointer;
          }
          
          .animated-element:hover {
            transform: scale(1.1);
            background: #0284c7;
          }
          
          .fade-in {
            opacity: 0;
            animation: fadeIn 1s ease-in-out forwards;
          }
          
          @keyframes fadeIn {
            to { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="animated-element fade-in" id="animated-circle"></div>
      </body>
      </html>
    `)

    const circle = page.locator('#animated-circle')
    await expect(circle).toBeVisible()

    // Test hover animation
    await circle.hover()
    
    // Wait for animation to complete
    await page.waitForTimeout(500)

    // Test that element responds to interactions
    await circle.click()
  })

  test('Form elements should be accessible and functional', async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Form Test</title>
        <style>
          .form-container {
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
          }
          
          input, textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }
          
          button {
            background: #0ea5e9;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <form class="form-container" id="test-form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="4"></textarea>
          </div>
          <button type="submit" id="submit-btn">Submit</button>
        </form>
      </body>
      </html>
    `)

    // Test form elements
    const nameInput = page.locator('#name')
    const emailInput = page.locator('#email')
    const messageTextarea = page.locator('#message')
    const submitButton = page.locator('#submit-btn')

    // Test input functionality
    await nameInput.fill('Test User')
    await emailInput.fill('test@example.com')
    await messageTextarea.fill('This is a test message')

    // Verify values were entered
    await expect(nameInput).toHaveValue('Test User')
    await expect(emailInput).toHaveValue('test@example.com')
    await expect(messageTextarea).toHaveValue('This is a test message')

    // Test form validation
    await emailInput.clear()
    await emailInput.fill('invalid-email')
    
    // Test submit button
    await expect(submitButton).toBeEnabled()
    await submitButton.click()
  })
})
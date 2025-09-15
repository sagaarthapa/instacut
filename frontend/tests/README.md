# AI Image Studio - Test Documentation

## Test Structure

The test suite is organized into the following directories:

### `/tests/e2e/` - End-to-End Tests
- **landing-page.spec.ts**: Tests the main landing page functionality, UI components, responsiveness, and asset loading
- **backend-api.spec.ts**: Tests API endpoints, health checks, CORS, and backend service functionality  
- **user-workflows.spec.ts**: Tests complete user journeys, mobile experience, performance, and cross-browser compatibility

### `/tests/unit/` - Unit Tests
- **components.spec.ts**: Tests individual UI components, glassmorphism effects, animations, forms, and responsive design

### `/tests/fixtures/` - Test Helpers
- **test-helpers.ts**: Common test utilities, selectors, test data, timeouts, and helper functions

## Test Coverage

### Frontend Testing
- ✅ Landing page loads successfully
- ✅ Hero section displays correctly
- ✅ Feature cards are visible and interactive
- ✅ Pricing section shows all plans
- ✅ Testimonials section loads
- ✅ Responsive design on mobile devices
- ✅ CSS/JS assets load properly
- ✅ Glassmorphism styling works
- ✅ Performance within acceptable limits
- ✅ Cross-browser compatibility

### Backend Testing  
- ✅ API health endpoint responds
- ✅ API documentation is accessible
- ✅ CORS headers configured correctly
- ✅ Error handling for invalid requests
- ✅ Response times within limits

### User Experience Testing
- ✅ Complete user journey from landing to pricing
- ✅ Upload interface interactions
- ✅ Mobile user experience flow
- ✅ Performance and loading experience
- ✅ Error handling and graceful degradation

## Running Tests

### Prerequisites
1. Ensure both frontend (port 3000) and backend (port 8000) servers are running
2. Install dependencies: `npm install`
3. Install Playwright browsers: `npx playwright install`

### Test Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (visual test runner)
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Debug tests step by step
npm run test:debug

# Run specific test file
npx playwright test tests/e2e/landing-page.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Configuration

The tests are configured in `playwright.config.ts` with:
- **Browsers**: Chromium, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:3000
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## Key Test Features

### Superior UI Testing
- **Glassmorphism Effects**: Verifies backdrop-filter, transparency, and glass-like appearance
- **Animation Testing**: Confirms smooth transitions and hover effects
- **Responsive Design**: Tests breakpoints and mobile adaptation
- **Performance Metrics**: Measures load times and Core Web Vitals

### Comprehensive Coverage
- **Cross-browser Testing**: Chrome, Firefox, Safari compatibility
- **Mobile Testing**: Touch interactions and responsive behavior
- **API Integration**: Backend health checks and error handling
- **User Journeys**: Complete workflows from landing to conversion

### Quality Assurance
- **Visual Regression**: Screenshot comparisons
- **Performance Monitoring**: Load time and asset size tracking
- **Accessibility**: Form elements and keyboard navigation
- **Error Handling**: Graceful degradation and edge cases

## Continuous Testing

These tests can be integrated with:
- **GitHub Actions**: Automated testing on pull requests
- **CI/CD Pipeline**: Pre-deployment validation
- **Monitoring**: Regular health checks in production
- **Performance Tracking**: Baseline comparisons over time

---

*This test suite ensures that AI Image Studio maintains superior quality and performance compared to competitors like Pixelcut.ai*
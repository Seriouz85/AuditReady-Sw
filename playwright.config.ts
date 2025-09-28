import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run quality tests sequentially for better error tracking
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduced retries for quality testing
  workers: process.env.CI ? 1 : 1, // Single worker for consistent error detection
  reporter: [
    ['html', { outputFolder: 'tests/reports/playwright-report' }],
    ['json', { outputFile: 'tests/reports/test-results.json' }],
    ['line']
  ],
  outputDir: 'tests/screenshots',
  // Global expect configuration for visual testing
  expect: {
    // Threshold for visual comparisons (0-1, where 0.2 = 20% difference allowed)
    toHaveScreenshot: { threshold: 0.3, mode: 'pixel' },
    toMatchScreenshot: { threshold: 0.3, mode: 'pixel' }
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Capture console messages for error analysis
    launchOptions: {
      slowMo: 100, // Slow down for better error detection
    }
  },
  projects: [
    // Visual regression testing - Primary browser
    {
      name: 'visual-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Optimized for visual testing
        launchOptions: {
          args: ['--font-render-hinting=none', '--disable-skia-runtime-opts', '--disable-system-font-fallback']
        }
      },
      testMatch: ['**/visual/**/*.spec.ts']
    },
    // Visual regression testing - Firefox
    {
      name: 'visual-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/visual/regression-test.spec.ts', '**/visual/design-system-validation.spec.ts']
    },
    // Primary quality testing browser
    {
      name: 'chromium-quality',
      use: { 
        ...devices['Desktop Chrome'],
        // Enhanced error detection for quality testing
        launchOptions: {
          args: ['--enable-logging', '--log-level=0']
        }
      },
      testMatch: ['**/e2e/quality-checker.spec.ts', '**/e2e/console-monitor.spec.ts', '**/e2e/admin-flows.spec.ts']
    },
    // Cross-browser compatibility testing
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/e2e/quality-checker.spec.ts']
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/e2e/quality-checker.spec.ts']
    },
    // Standard feature testing (existing tests)
    {
      name: 'chromium-standard',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/e2e/**/*.spec.ts'],
      testIgnore: ['**/e2e/quality-checker.spec.ts', '**/e2e/console-monitor.spec.ts', '**/e2e/admin-flows.spec.ts']
    },
    /* Mobile testing for quality */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/e2e/quality-checker.spec.ts']
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
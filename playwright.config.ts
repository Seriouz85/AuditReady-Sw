import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
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
      testMatch: ['**/quality-checker.spec.ts', '**/console-monitor.spec.ts', '**/admin-flows.spec.ts']
    },
    // Cross-browser compatibility testing
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/quality-checker.spec.ts']
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/quality-checker.spec.ts']
    },
    // Standard feature testing (existing tests)
    {
      name: 'chromium-standard',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/quality-checker.spec.ts', '**/console-monitor.spec.ts', '**/admin-flows.spec.ts']
    },
    /* Mobile testing for quality */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/quality-checker.spec.ts']
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
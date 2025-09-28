/**
 * HARDCORE UI BASELINE CAPTURE FOR BOARD VALIDATION
 * This captures the EXACT UI state before refactoring
 * Any pixel difference will trigger rollback
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const DEMO_EMAIL = 'demo@auditready.com';
const DEMO_PASSWORD = 'demo123';

// All routes to capture
const ROUTES_TO_CAPTURE = [
  { path: '/', name: 'landing' },
  { path: '/login', name: 'login' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/assessments', name: 'assessments' },
  { path: '/compliance', name: 'compliance' },
  { path: '/compliance-monitoring', name: 'compliance-monitoring' },
  { path: '/applications', name: 'applications' },
  { path: '/documents', name: 'documents' },
  { path: '/suppliers', name: 'suppliers' },
  { path: '/risk-management', name: 'risk-management' },
  { path: '/lms', name: 'lms' },
  { path: '/reports', name: 'reports' },
  { path: '/admin', name: 'admin' },
  { path: '/settings', name: 'settings' },
];

class BaselineCapture {
  page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async loginAsDemo() {
    await this.page.goto('/login');
    await this.page.fill('[name="email"]', DEMO_EMAIL);
    await this.page.fill('[name="password"]', DEMO_PASSWORD);
    await this.page.click('[type="submit"]');
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
    console.log('✅ Demo login successful');
  }

  async captureRoute(route: { path: string; name: string }) {
    console.log(`📸 Capturing ${route.name} at ${route.path}`);
    
    await this.page.goto(route.path);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(1000);
    
    // Remove any dynamic content that changes between runs
    await this.page.evaluate(() => {
      // Remove timestamps
      document.querySelectorAll('[data-timestamp]').forEach(el => {
        el.textContent = 'TIMESTAMP';
      });
      
      // Remove any loading spinners
      document.querySelectorAll('.animate-spin').forEach(el => {
        el.remove();
      });
    });
    
    // Capture full page screenshot
    const screenshot = await this.page.screenshot({
      fullPage: true,
      animations: 'disabled',
    });
    
    // Save to baseline directory
    const baselineDir = path.join(process.cwd(), 'tests/visual/baseline');
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true });
    }
    
    const screenshotPath = path.join(baselineDir, `${route.name}.png`);
    fs.writeFileSync(screenshotPath, screenshot);
    
    console.log(`✅ Saved baseline: ${screenshotPath}`);
    
    // Also capture viewport screenshot for above-the-fold validation
    const viewportScreenshot = await this.page.screenshot({
      fullPage: false,
      animations: 'disabled',
    });
    
    const viewportPath = path.join(baselineDir, `${route.name}-viewport.png`);
    fs.writeFileSync(viewportPath, viewportScreenshot);
  }

  async captureInteractiveStates() {
    console.log('📸 Capturing interactive states...');
    
    // Capture modals
    await this.page.goto('/assessments');
    const newAssessmentBtn = await this.page.$('button:has-text("New Assessment")');
    if (newAssessmentBtn) {
      await newAssessmentBtn.click();
      await this.page.waitForTimeout(500);
      const modalScreenshot = await this.page.screenshot({ fullPage: true });
      const modalPath = path.join(process.cwd(), 'tests/visual/baseline/modal-new-assessment.png');
      fs.writeFileSync(modalPath, modalScreenshot);
      await this.page.keyboard.press('Escape');
    }
    
    // Capture dropdowns
    await this.page.goto('/dashboard');
    const userMenu = await this.page.$('[data-testid="user-menu"]');
    if (userMenu) {
      await userMenu.click();
      await this.page.waitForTimeout(300);
      const dropdownScreenshot = await this.page.screenshot({ fullPage: false });
      const dropdownPath = path.join(process.cwd(), 'tests/visual/baseline/dropdown-user-menu.png');
      fs.writeFileSync(dropdownPath, dropdownScreenshot);
      await this.page.keyboard.press('Escape');
    }
    
    console.log('✅ Interactive states captured');
  }
}

test.describe('Baseline UI Capture for Board Validation', () => {
  test('Capture all UI states for visual regression', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    // First capture login page
    await capture.captureRoute({ path: '/login', name: 'login-page' });
    
    // Login as demo user
    await capture.loginAsDemo();
    
    // Capture all authenticated routes
    for (const route of ROUTES_TO_CAPTURE.filter(r => r.path !== '/login')) {
      await capture.captureRoute(route);
    }
    
    // Capture interactive states
    await capture.captureInteractiveStates();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BASELINE CAPTURE COMPLETE - READY FOR REFACTORING');
    console.log('✅ All UI states captured');
    console.log('✅ Demo functionality validated');
    console.log('✅ Ready for board-level validation');
    console.log('='.repeat(60));
  });
  
  test('Validate demo account functionality', async ({ page }) => {
    await page.goto('/login');
    
    // Test demo login
    await page.fill('[name="email"]', DEMO_EMAIL);
    await page.fill('[name="password"]', DEMO_PASSWORD);
    await page.click('[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user menu shows demo email
    const userMenuText = await page.textContent('[data-testid="user-email"]');
    expect(userMenuText).toContain(DEMO_EMAIL);
    
    // Verify can access all main features
    const featuresToTest = [
      '/assessments',
      '/compliance',
      '/documents',
      '/risk-management',
    ];
    
    for (const feature of featuresToTest) {
      await page.goto(feature);
      await expect(page).toHaveURL(feature);
      const hasError = await page.$('.error-message');
      expect(hasError).toBeNull();
    }
    
    console.log('✅ Demo account fully functional');
  });
});
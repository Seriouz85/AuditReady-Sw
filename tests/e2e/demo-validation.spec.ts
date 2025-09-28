/**
 * HARDCORE E2E DEMO VALIDATION FOR THE BOARD
 * This ensures demo functionality NEVER breaks during refactoring
 */

import { test, expect, Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@auditready.com'; // Correct demo email
const DEMO_PASSWORD = 'AuditReady@Demo2025!';

class DemoValidator {
  page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async validateDemoLogin() {
    console.log('🔍 Testing demo login functionality...');
    
    await this.page.goto('/login');
    
    // Fill demo credentials
    await this.page.fill('input[type="email"]', DEMO_EMAIL);
    await this.page.fill('input[type="password"]', DEMO_PASSWORD);
    
    // Submit login
    await this.page.click('[type="submit"]');
    
    // Verify successful login (could redirect to /dashboard or /app)
    await expect(this.page).toHaveURL(/\/(dashboard|app)/);
    
    
    // Verify user is recognized
    const userIndicator = this.page.locator('[data-testid="user-email"], .user-email, .profile-email');
    await expect(userIndicator).toContainText('demo@auditready.com');
    
    console.log('✅ Demo login successful');
  }

  async validateCoreFeatures() {
    console.log('🔍 Testing core feature access...');
    
    const criticalFeatures = [
      { path: '/assessments', name: 'Assessments' },
      { path: '/compliance-simplification', name: 'Compliance' },
      { path: '/documents', name: 'Documents' },
      { path: '/risk-management', name: 'Risk Management' },
      { path: '/applications', name: 'Applications' },
      { path: '/settings', name: 'Settings' },
    ];

    for (const feature of criticalFeatures) {
      await this.page.goto(feature.path);
      await this.page.waitForLoadState('networkidle');
      
      // Verify no error messages
      const errorElements = await this.page.$$('.error-message, .error-boundary, [data-testid="error"]');
      expect(errorElements.length).toBe(0);
      
      // Verify page loaded successfully
      await expect(this.page).toHaveURL(feature.path);
      
      console.log(`✅ ${feature.name} feature accessible`);
    }
  }

  async validateNoConsoleErrors() {
    console.log('🔍 Checking for console errors...');
    
    const messages: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        messages.push(msg.text());
      }
    });

    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
    
    // Filter out acceptable errors (404s for optional resources, etc.)
    const criticalErrors = messages.filter(msg => 
      !msg.includes('404') && 
      !msg.includes('favicon') &&
      !msg.includes('sourcemap')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ No critical console errors');
  }

  async validateMockData() {
    console.log('🔍 Testing mock data availability...');
    
    await this.page.goto('/dashboard');
    
    // Check if demo data is loading
    const loadingIndicators = this.page.locator('.loading, .spinner, [data-testid="loading"]');
    await loadingIndicators.first().waitFor({ state: 'detached', timeout: 10000 });
    
    // Verify some data is displayed
    const dataElements = await this.page.$$('.stat-card, .metric, .data-item, .chart');
    expect(dataElements.length).toBeGreaterThan(0);
    
    console.log('✅ Mock data loading correctly');
  }
}

test.describe('Demo Validation Suite - Board Requirements', () => {
  test('Complete demo validation flow', async ({ page }) => {
    const validator = new DemoValidator(page);
    
    // Step 1: Login validation
    await validator.validateDemoLogin();
    
    // Step 2: Feature access validation
    await validator.validateCoreFeatures();
    
    // Step 3: Console error validation
    await validator.validateNoConsoleErrors();
    
    // Step 4: Mock data validation
    await validator.validateMockData();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL DEMO VALIDATIONS PASSED - BOARD READY!');
    console.log('✅ Demo login works perfectly');
    console.log('✅ All core features accessible');
    console.log('✅ No console errors');
    console.log('✅ Mock data loading correctly');
    console.log('='.repeat(60));
  });

  test('Demo resilience test - multiple login attempts', async ({ page }) => {
    const validator = new DemoValidator(page);
    
    // Test multiple login/logout cycles
    for (let i = 0; i < 3; i++) {
      console.log(`🔄 Login cycle ${i + 1}/3`);
      
      await validator.validateDemoLogin();
      
      // Logout
      await page.click('[data-testid="user-menu"], .user-menu');
      await page.click('text=Logout, text=Sign Out');
      await expect(page).toHaveURL('/login');
      
      console.log(`✅ Logout cycle ${i + 1} complete`);
    }
    
    console.log('🎉 Demo resilience test passed!');
  });

  test('Demo data integrity', async ({ page }) => {
    const validator = new DemoValidator(page);
    await validator.validateDemoLogin();
    
    // Check specific demo data points
    await page.goto('/assessments');
    
    // Verify demo assessments exist
    const assessmentItems = await page.$$('.assessment-item, .assessment-card, [data-testid="assessment"]');
    expect(assessmentItems.length).toBeGreaterThan(0);
    
    // Check compliance data
    await page.goto('/compliance-simplification');
    const complianceData = await page.$$('.compliance-item, .framework-item, [data-testid="compliance"]');
    expect(complianceData.length).toBeGreaterThan(0);
    
    console.log('✅ Demo data integrity verified');
  });
});
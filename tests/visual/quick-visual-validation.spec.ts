/**
 * QUICK VISUAL VALIDATION TEST
 * Fast visual regression check for critical components post-refactoring
 */

import { test, expect, Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@auditready.com';
const DEMO_PASSWORD = 'demo123';

class QuickVisualValidator {
  page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async loginAsDemo() {
    console.log('🔑 Attempting demo login...');
    
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for the form to be visible
    await this.page.waitForSelector('input[type="email"], [placeholder*="email"], [value*="demo"]', { timeout: 10000 });
    
    // Check if email is already pre-filled
    const emailValue = await this.page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], [placeholder*="email"], [value*="demo"]') as HTMLInputElement;
      return emailInput?.value || '';
    });
    
    console.log('📧 Current email value:', emailValue);
    
    // If email not pre-filled, fill it
    if (!emailValue.includes('demo')) {
      const emailInput = this.page.locator('input[type="email"], [placeholder*="email"]').first();
      await emailInput.clear();
      await emailInput.fill(DEMO_EMAIL);
    }
    
    // Fill password
    const passwordInput = this.page.locator('input[type="password"]').first();
    await passwordInput.clear();
    await passwordInput.fill(DEMO_PASSWORD);
    
    // Click sign in button
    await this.page.click('button:has-text("Sign In"), button:has-text("Login"), [type="submit"]');
    
    // Wait for navigation to dashboard
    await this.page.waitForURL('/dashboard', { timeout: 15000 });
    
    console.log('✅ Demo login successful');
  }

  async capturePageBaseline(pagePath: string, pageName: string) {
    console.log(`📸 Capturing ${pageName} at ${pagePath}`);
    
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for content to stabilize
    await this.page.waitForTimeout(2000);
    
    // Stabilize dynamic content
    await this.page.evaluate(() => {
      // Remove timestamps and dynamic content
      document.querySelectorAll('[data-timestamp]').forEach(el => {
        el.textContent = 'TIMESTAMP';
      });
      
      // Stop animations for consistent screenshots
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        element.style.animationDuration = '0s';
        element.style.animationDelay = '0s';
        element.style.transitionDuration = '0s';
        element.style.transitionDelay = '0s';
      });
      
      // Remove loading spinners
      document.querySelectorAll('.animate-spin, .loading, [class*="loading"]').forEach(el => {
        el.remove();
      });
    });
    
    // Capture full page screenshot
    await expect(this.page).toHaveScreenshot(`${pageName}-full.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [
        this.page.locator('[data-timestamp]'),
        this.page.locator('.dynamic-content'),
        this.page.locator('[class*="animate"]')
      ]
    });
    
    // Capture viewport screenshot
    await expect(this.page).toHaveScreenshot(`${pageName}-viewport.png`, {
      fullPage: false,
      animations: 'disabled'
    });
    
    console.log(`✅ Captured ${pageName}`);
  }

  async validateResponsiveDesign(pagePath: string, pageName: string) {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];
    
    for (const breakpoint of breakpoints) {
      console.log(`📱 Testing ${pageName} on ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      await this.page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await this.page.goto(pagePath);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      
      // Capture responsive screenshot
      await expect(this.page).toHaveScreenshot(`${pageName}-${breakpoint.name}.png`, {
        fullPage: false,
        animations: 'disabled'
      });
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async validateComponentExtraction(pagePath: string, testId: string, componentName: string) {
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle');
    
    // Check if component exists and is visible
    const component = this.page.locator(`[data-testid="${testId}"]`);
    
    if (await component.count() > 0) {
      await expect(component).toBeVisible();
      
      // Capture component screenshot
      await expect(component).toHaveScreenshot(`component-${componentName}.png`, {
        animations: 'disabled'
      });
      
      console.log(`✅ Component validated: ${componentName}`);
      return true;
    } else {
      console.warn(`⚠️ Component not found: ${componentName} (${testId})`);
      return false;
    }
  }
}

test.describe('Quick Visual Validation', () => {
  test('Validate login page and demo functionality', async ({ page }) => {
    const validator = new QuickVisualValidator(page);
    
    // First capture login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test demo login
    await validator.loginAsDemo();
    
    // Capture dashboard after login
    await expect(page).toHaveScreenshot('dashboard-post-login.png', {
      fullPage: false,
      animations: 'disabled'
    });
    
    console.log('✅ Login and dashboard validation complete');
  });
  
  test('Validate critical pages post-refactoring', async ({ page }) => {
    const validator = new QuickVisualValidator(page);
    await validator.loginAsDemo();
    
    const criticalPages = [
      { path: '/dashboard', name: 'dashboard' },
      { path: '/admin', name: 'admin-dashboard' },
      { path: '/settings', name: 'settings-page' },
      { path: '/compliance', name: 'compliance-simplification' },
      { path: '/assessments', name: 'assessments' }
    ];
    
    for (const pageConfig of criticalPages) {
      await validator.capturePageBaseline(pageConfig.path, pageConfig.name);
    }
    
    console.log('✅ Critical pages validation complete');
  });
  
  test('Validate responsive design on key pages', async ({ page }) => {
    const validator = new QuickVisualValidator(page);
    await validator.loginAsDemo();
    
    const responsivePages = [
      { path: '/dashboard', name: 'dashboard' },
      { path: '/admin', name: 'admin' },
      { path: '/settings', name: 'settings' }
    ];
    
    for (const pageConfig of responsivePages) {
      await validator.validateResponsiveDesign(pageConfig.path, pageConfig.name);
    }
    
    console.log('✅ Responsive design validation complete');
  });
  
  test('Validate extracted components render correctly', async ({ page }) => {
    const validator = new QuickVisualValidator(page);
    await validator.loginAsDemo();
    
    const componentsToTest = [
      { page: '/admin', testId: 'admin-header', name: 'admin-header' },
      { page: '/admin', testId: 'stats-grid', name: 'admin-stats-grid' },
      { page: '/admin', testId: 'user-management', name: 'user-management-panel' },
      { page: '/settings', testId: 'settings-header', name: 'settings-header' },
      { page: '/settings', testId: 'profile-settings', name: 'profile-settings-panel' },
      { page: '/compliance', testId: 'compliance-header', name: 'compliance-header' },
      { page: '/compliance', testId: 'framework-selector', name: 'framework-selector' }
    ];
    
    let successCount = 0;
    let totalCount = componentsToTest.length;
    
    for (const component of componentsToTest) {
      const success = await validator.validateComponentExtraction(
        component.page, 
        component.testId, 
        component.name
      );
      
      if (success) {
        successCount++;
      }
    }
    
    console.log(`✅ Component validation: ${successCount}/${totalCount} components found and validated`);
    
    // Should find at least 50% of expected components
    expect(successCount).toBeGreaterThan(totalCount * 0.5);
  });
});

test.describe('Design System Quick Check', () => {
  test('Validate brand colors and gradients', async ({ page }) => {
    const validator = new QuickVisualValidator(page);
    await validator.loginAsDemo();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for brand color consistency
    const colorCheck = await page.evaluate(() => {
      const results = {
        purpleElements: document.querySelectorAll('[class*="purple"]').length,
        blueElements: document.querySelectorAll('[class*="blue"]').length,
        gradientElements: document.querySelectorAll('[class*="gradient"], [class*="from-"]').length,
        hasAuditReadyBranding: document.title.includes('AuditReady') || document.querySelector('[class*="auditready"]') !== null
      };
      
      return results;
    });
    
    console.log('🎨 Brand color check:', colorCheck);
    
    // Should have brand elements
    expect(colorCheck.purpleElements + colorCheck.blueElements).toBeGreaterThan(0);
    expect(colorCheck.gradientElements).toBeGreaterThan(0);
    
    // Capture design system elements
    await expect(page).toHaveScreenshot('brand-colors-check.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
  
  test('Validate typography and spacing', async ({ page }) => {
    const validator = new QuickVisualValidator(page);
    await validator.loginAsDemo();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check typography structure
    const typographyCheck = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const paragraphs = document.querySelectorAll('p');
      const buttons = document.querySelectorAll('button');
      
      return {
        headingCount: headings.length,
        paragraphCount: paragraphs.length,
        buttonCount: buttons.length,
        hasConsistentSpacing: document.querySelectorAll('[class*="p-"], [class*="m-"]').length > 0
      };
    });
    
    console.log('📝 Typography check:', typographyCheck);
    
    // Should have proper content structure
    expect(typographyCheck.headingCount).toBeGreaterThan(0);
    expect(typographyCheck.buttonCount).toBeGreaterThan(0);
    expect(typographyCheck.hasConsistentSpacing).toBe(true);
    
    await expect(page).toHaveScreenshot('typography-spacing-check.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});
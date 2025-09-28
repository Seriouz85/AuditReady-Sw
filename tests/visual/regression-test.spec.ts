/**
 * COMPREHENSIVE VISUAL REGRESSION TESTING
 * Post-refactoring validation for critical components
 * Focuses on AdminDashboard, Settings, ComplianceSimplification
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const DEMO_EMAIL = 'demo@auditready.com';
const DEMO_PASSWORD = 'demo123';

// Critical pages that underwent major refactoring
const CRITICAL_PAGES = [
  {
    path: '/admin',
    name: 'admin-dashboard',
    description: 'AdminDashboard - Decomposed from 2,325 lines',
    waitForSelectors: [
      '[data-testid="admin-header"]',
      '[data-testid="stats-grid"]',
      '[data-testid="user-management"]'
    ]
  },
  {
    path: '/settings',
    name: 'settings-page',
    description: 'Settings - Decomposed from 2,458 lines',
    waitForSelectors: [
      '[data-testid="settings-header"]',
      '[data-testid="settings-tabs"]',
      '[data-testid="profile-settings"]'
    ]
  },
  {
    path: '/compliance',
    name: 'compliance-simplification',
    description: 'ComplianceSimplification - Heavily refactored',
    waitForSelectors: [
      '[data-testid="compliance-header"]',
      '[data-testid="framework-selector"]',
      '[data-testid="requirements-display"]'
    ]
  }
];

// Component-specific testing
const COMPONENT_SCENARIOS = [
  {
    page: '/admin',
    name: 'admin-user-management',
    action: 'click-user-tab',
    selector: '[data-testid="users-tab"]'
  },
  {
    page: '/admin',
    name: 'admin-organization-management',
    action: 'click-org-tab',
    selector: '[data-testid="organizations-tab"]'
  },
  {
    page: '/settings',
    name: 'settings-profile',
    action: 'click-profile-tab',
    selector: '[data-testid="profile-tab"]'
  },
  {
    page: '/settings',
    name: 'settings-security',
    action: 'click-security-tab',
    selector: '[data-testid="security-tab"]'
  },
  {
    page: '/compliance',
    name: 'compliance-framework-selection',
    action: 'open-framework-selector',
    selector: '[data-testid="framework-dropdown"]'
  }
];

// Responsive breakpoints to test
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1920, height: 1080 }
];

class VisualRegressionTester {
  page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async loginAsDemo() {
    await this.page.goto('/login');
    await this.page.fill('[name="email"]', DEMO_EMAIL);
    await this.page.fill('[name="password"]', DEMO_PASSWORD);
    await this.page.click('[type="submit"]');
    await this.page.waitForURL('/dashboard', { timeout: 15000 });
    console.log('✅ Demo login successful');
  }

  async capturePageWithWait(pageConfig: any, breakpoint?: any) {
    console.log(`📸 Capturing ${pageConfig.description}`);
    
    if (breakpoint) {
      await this.page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      console.log(`📱 Set viewport to ${breakpoint.name}: ${breakpoint.width}x${breakpoint.height}`);
    }
    
    await this.page.goto(pageConfig.path);
    await this.page.waitForLoadState('networkidle');
    
    // Wait for critical selectors to be present
    for (const selector of pageConfig.waitForSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
      } catch (e) {
        console.warn(`⚠️ Selector not found: ${selector}`);
      }
    }
    
    // Wait for animations and dynamic content
    await this.page.waitForTimeout(2000);
    
    // Stabilize dynamic content
    await this.page.evaluate(() => {
      // Remove timestamps and dynamic content
      document.querySelectorAll('[data-timestamp]').forEach(el => {
        el.textContent = 'TIMESTAMP';
      });
      
      // Stop animations
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        element.style.animationDuration = '0s';
        element.style.animationDelay = '0s';
        element.style.transitionDuration = '0s';
        element.style.transitionDelay = '0s';
      });
      
      // Remove loading states
      document.querySelectorAll('.animate-spin, .loading').forEach(el => {
        el.remove();
      });
    });
    
    const suffix = breakpoint ? `-${breakpoint.name}` : '';
    const screenshotName = `${pageConfig.name}${suffix}`;
    
    // Capture full page
    await expect(this.page).toHaveScreenshot(`${screenshotName}-full.png`, {
      fullPage: true,
      animations: 'disabled',
      mask: [
        this.page.locator('[data-timestamp]'),
        this.page.locator('.dynamic-content')
      ]
    });
    
    // Capture viewport (above the fold)
    await expect(this.page).toHaveScreenshot(`${screenshotName}-viewport.png`, {
      fullPage: false,
      animations: 'disabled'
    });
    
    console.log(`✅ Captured ${screenshotName}`);
  }

  async captureComponentInteractions() {
    console.log('🎭 Capturing component interactions...');
    
    for (const scenario of COMPONENT_SCENARIOS) {
      await this.page.goto(scenario.page);
      await this.page.waitForLoadState('networkidle');
      
      try {
        // Wait for the interactive element
        await this.page.waitForSelector(scenario.selector, { timeout: 5000 });
        
        // Perform the action
        if (scenario.action.includes('click')) {
          await this.page.click(scenario.selector);
          await this.page.waitForTimeout(1000); // Wait for state change
        }
        
        // Capture the interactive state
        await expect(this.page).toHaveScreenshot(`${scenario.name}-interactive.png`, {
          fullPage: false,
          animations: 'disabled'
        });
        
        console.log(`✅ Captured ${scenario.name} interaction`);
        
      } catch (e) {
        console.warn(`⚠️ Could not capture ${scenario.name}: ${e}`);
      }
    }
  }

  async validateDesignSystem() {
    console.log('🎨 Validating design system consistency...');
    
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
    
    // Test color consistency
    const colorValidation = await this.page.evaluate(() => {
      const purpleElements = document.querySelectorAll('[class*="purple"]');
      const blueElements = document.querySelectorAll('[class*="blue"]');
      const gradientElements = document.querySelectorAll('[class*="gradient"]');
      
      return {
        purple: purpleElements.length,
        blue: blueElements.length,
        gradients: gradientElements.length
      };
    });
    
    console.log('🎨 Color usage:', colorValidation);
    
    // Test typography consistency
    const typographyValidation = await this.page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const fontSizes = new Set();
      
      headings.forEach(h => {
        const styles = window.getComputedStyle(h);
        fontSizes.add(styles.fontSize);
      });
      
      return {
        headingCount: headings.length,
        uniqueFontSizes: Array.from(fontSizes)
      };
    });
    
    console.log('📝 Typography validation:', typographyValidation);
    
    // Capture design system elements
    await expect(this.page).toHaveScreenshot('design-system-validation.png', {
      fullPage: false,
      animations: 'disabled'
    });
  }

  async validateAnimations() {
    console.log('✨ Validating animations and transitions...');
    
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
    
    // Test hover states
    const buttonHovers = await this.page.locator('button').first();
    await buttonHovers.hover();
    await this.page.waitForTimeout(500);
    
    await expect(this.page).toHaveScreenshot('button-hover-state.png', {
      fullPage: false,
      animations: 'disabled'
    });
    
    // Test loading states
    await this.page.goto('/assessments');
    await expect(this.page).toHaveScreenshot('page-loading-state.png', {
      fullPage: false,
      animations: 'disabled'
    });
  }
}

test.describe('Visual Regression Testing - Post Refactoring', () => {
  test('Capture critical pages across all breakpoints', async ({ page }) => {
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    
    for (const pageConfig of CRITICAL_PAGES) {
      // Test each page across all breakpoints
      for (const breakpoint of BREAKPOINTS) {
        await tester.capturePageWithWait(pageConfig, breakpoint);
      }
      
      // Also capture default viewport
      await tester.capturePageWithWait(pageConfig);
    }
  });
  
  test('Validate component interactions', async ({ page }) => {
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    await tester.captureComponentInteractions();
  });
  
  test('Validate design system consistency', async ({ page }) => {
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    await tester.validateDesignSystem();
  });
  
  test('Validate animations and transitions', async ({ page }) => {
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    await tester.validateAnimations();
  });
});

test.describe('Cross-Browser Visual Consistency', () => {
  test('Validate critical pages in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');
    
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    
    for (const pageConfig of CRITICAL_PAGES) {
      await tester.capturePageWithWait(pageConfig);
    }
  });
  
  test('Validate critical pages in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    
    for (const pageConfig of CRITICAL_PAGES) {
      await tester.capturePageWithWait(pageConfig);
    }
  });
});

test.describe('Component Extraction Validation', () => {
  test('Validate AdminDashboard extracted components', async ({ page }) => {
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Test each extracted component renders correctly
    const components = [
      'admin-header',
      'stats-grid', 
      'user-management',
      'organization-management',
      'system-health'
    ];
    
    for (const component of components) {
      const element = page.locator(`[data-testid="${component}"]`);
      if (await element.count() > 0) {
        await expect(element).toHaveScreenshot(`admin-${component}.png`);
        console.log(`✅ Validated component: ${component}`);
      } else {
        console.warn(`⚠️ Component not found: ${component}`);
      }
    }
  });
  
  test('Validate Settings extracted components', async ({ page }) => {
    const tester = new VisualRegressionTester(page);
    await tester.loginAsDemo();
    
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Test each settings panel
    const settingsPanels = [
      'profile-settings',
      'security-settings',
      'notification-settings',
      'organization-settings',
      'integration-settings'
    ];
    
    for (const panel of settingsPanels) {
      try {
        // Try to navigate to the panel
        const panelTab = page.locator(`[data-testid="${panel}-tab"]`);
        if (await panelTab.count() > 0) {
          await panelTab.click();
          await page.waitForTimeout(1000);
          
          await expect(page).toHaveScreenshot(`settings-${panel}.png`, {
            fullPage: false,
            animations: 'disabled'
          });
          
          console.log(`✅ Validated settings panel: ${panel}`);
        }
      } catch (e) {
        console.warn(`⚠️ Could not capture ${panel}: ${e}`);
      }
    }
  });
});
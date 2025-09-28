/**
 * BASELINE SCREENSHOT CAPTURE
 * Captures baseline screenshots for visual regression testing
 * Focuses on public and accessible pages first
 */

import { test, expect, Page } from '@playwright/test';

class BaselineCapture {
  page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  async capturePageBaseline(pagePath: string, pageName: string, options: any = {}) {
    console.log(`📸 Capturing baseline for ${pageName} at ${pagePath}`);
    
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Wait for content to stabilize
    await this.page.waitForTimeout(2000);
    
    // Stabilize dynamic content for consistent screenshots
    await this.page.evaluate(() => {
      // Remove timestamps and dynamic content
      document.querySelectorAll('[data-timestamp]').forEach(el => {
        el.textContent = 'TIMESTAMP_PLACEHOLDER';
      });
      
      // Stop all animations for consistent screenshots
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(styleSheet);
      
      // Remove loading spinners and dynamic indicators
      document.querySelectorAll('.animate-spin, .loading, [class*="animate-"], [class*="loading"]').forEach(el => {
        el.remove();
      });
      
      // Stabilize any counters or dynamic numbers
      document.querySelectorAll('[class*="counter"], [data-counter]').forEach(el => {
        if (el.textContent && /^\d+$/.test(el.textContent.trim())) {
          el.textContent = '999';
        }
      });
    });
    
    // Additional wait for any remaining animations to settle
    await this.page.waitForTimeout(1000);
    
    const screenshotOptions = {
      fullPage: true,
      animations: 'disabled' as const,
      ...options
    };
    
    // Capture full page screenshot
    await expect(this.page).toHaveScreenshot(`${pageName}-baseline-full.png`, screenshotOptions);
    
    // Capture viewport screenshot (above the fold)
    await expect(this.page).toHaveScreenshot(`${pageName}-baseline-viewport.png`, {
      ...screenshotOptions,
      fullPage: false
    });
    
    console.log(`✅ Baseline captured for ${pageName}`);
  }

  async captureResponsiveBaselines(pagePath: string, pageName: string) {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1920, height: 1080 }
    ];
    
    for (const breakpoint of breakpoints) {
      console.log(`📱 Capturing ${pageName} on ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      await this.page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await this.page.goto(pagePath);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1500);
      
      // Apply same stabilization
      await this.page.evaluate(() => {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
          }
        `;
        document.head.appendChild(styleSheet);
      });
      
      await expect(this.page).toHaveScreenshot(`${pageName}-${breakpoint.name}-baseline.png`, {
        fullPage: false,
        animations: 'disabled'
      });
    }
    
    // Reset to standard desktop size
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async validatePageAccessibility(pagePath: string, pageName: string) {
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle');
    
    const a11yCheck = await this.page.evaluate(() => {
      const results = {
        hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
        hasButtons: document.querySelectorAll('button').length > 0,
        hasImages: document.querySelectorAll('img').length,
        imagesWithAlt: document.querySelectorAll('img[alt]').length,
        hasLabels: document.querySelectorAll('label').length > 0,
        hasSkipLinks: document.querySelector('a[href="#main"], [class*="skip"]') !== null,
        pageTitle: document.title,
        lang: document.documentElement.lang || 'en'
      };
      
      return results;
    });
    
    console.log(`♿ Accessibility check for ${pageName}:`, a11yCheck);
    
    // Basic accessibility validations
    expect(a11yCheck.hasHeadings, `${pageName} should have headings`).toBe(true);
    expect(a11yCheck.pageTitle, `${pageName} should have a title`).toBeTruthy();
    
    if (a11yCheck.hasImages > 0) {
      const altTextRatio = a11yCheck.imagesWithAlt / a11yCheck.hasImages;
      console.log(`📷 Alt text coverage: ${Math.round(altTextRatio * 100)}%`);
    }
    
    return a11yCheck;
  }
}

test.describe('Baseline Screenshot Capture', () => {
  test('Capture public pages baseline', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    // Public/accessible pages that don't require login
    const publicPages = [
      { path: '/', name: 'landing-page' },
      { path: '/login', name: 'login-page' }
    ];
    
    for (const pageConfig of publicPages) {
      await capture.capturePageBaseline(pageConfig.path, pageConfig.name);
      await capture.validatePageAccessibility(pageConfig.path, pageConfig.name);
    }
    
    console.log('✅ Public pages baseline capture complete');
  });
  
  test('Capture login page responsive baselines', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    await capture.captureResponsiveBaselines('/login', 'login-page');
    
    console.log('✅ Login page responsive baselines captured');
  });
  
  test('Capture landing page responsive baselines', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    await capture.captureResponsiveBaselines('/', 'landing-page');
    
    console.log('✅ Landing page responsive baselines captured');
  });
});

test.describe('Component Visual Validation', () => {
  test('Validate login form components', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for key components
    const formElements = await page.evaluate(() => {
      return {
        hasEmailInput: !!document.querySelector('input[type="email"], [placeholder*="email"]'),
        hasPasswordInput: !!document.querySelector('input[type="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"], button:has-text("Sign In")'),
        hasLogo: !!document.querySelector('[class*="logo"], img[alt*="logo"], [alt*="AuditReady"]'),
        hasForm: !!document.querySelector('form'),
        emailValue: (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || '',
        formTitle: document.querySelector('h1, h2, [class*="title"]')?.textContent || ''
      };
    });
    
    console.log('🔍 Login form analysis:', formElements);
    
    // Validate essential form elements exist
    expect(formElements.hasEmailInput, 'Login form should have email input').toBe(true);
    expect(formElements.hasPasswordInput, 'Login form should have password input').toBe(true);
    expect(formElements.hasSubmitButton, 'Login form should have submit button').toBe(true);
    
    // Capture specific form component
    const formSelector = 'form, [class*="login"], [class*="auth"]';
    const formElement = page.locator(formSelector).first();
    
    if (await formElement.count() > 0) {
      await expect(formElement).toHaveScreenshot('login-form-component.png', {
        animations: 'disabled'
      });
    }
  });
});

test.describe('Design System Baseline', () => {
  test('Capture design system elements from login page', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const designSystemAnalysis = await page.evaluate(() => {
      return {
        colorClasses: {
          purple: document.querySelectorAll('[class*="purple"]').length,
          blue: document.querySelectorAll('[class*="blue"]').length,
          gradient: document.querySelectorAll('[class*="gradient"], [class*="from-"]').length
        },
        typography: {
          headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a').length
        },
        layout: {
          flexElements: document.querySelectorAll('[class*="flex"]').length,
          gridElements: document.querySelectorAll('[class*="grid"]').length,
          spacingElements: document.querySelectorAll('[class*="p-"], [class*="m-"]').length
        },
        branding: {
          hasAuditReadyText: document.body.textContent?.includes('AuditReady') || false,
          hasLogo: !!document.querySelector('[alt*="logo"], [class*="logo"]'),
          title: document.title
        }
      };
    });
    
    console.log('🎨 Design system analysis:', designSystemAnalysis);
    
    // Validate brand presence
    expect(designSystemAnalysis.branding.hasAuditReadyText || 
           designSystemAnalysis.branding.hasLogo, 
           'Page should have AuditReady branding').toBe(true);
    
    // Should have some design system elements
    expect(designSystemAnalysis.typography.headings, 'Should have headings').toBeGreaterThan(0);
    expect(designSystemAnalysis.typography.buttons, 'Should have buttons').toBeGreaterThan(0);
    
    // Capture brand elements
    await expect(page).toHaveScreenshot('design-system-baseline.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});

test.describe('Error State Validation', () => {
  test('Capture 404 page if available', async ({ page }) => {
    const capture = new BaselineCapture(page);
    
    // Try to access a non-existent page
    const response = await page.goto('/non-existent-page-for-testing');
    
    // Wait for page to load (might be 404 or redirect)
    await page.waitForLoadState('networkidle');
    
    // Check if it's a 404 or if it redirected
    const currentUrl = page.url();
    const is404 = response?.status() === 404 || 
                  page.locator('text=404, text=Not Found, text=Page not found').first();
    
    console.log(`🔍 404 test - Status: ${response?.status()}, URL: ${currentUrl}`);
    
    if (await is404.count() > 0) {
      await expect(page).toHaveScreenshot('404-error-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
      console.log('✅ 404 page captured');
    } else {
      console.log('ℹ️ No 404 page found (probably redirects to login)');
    }
  });
});
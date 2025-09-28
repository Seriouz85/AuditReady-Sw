import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Comprehensive Testing Suite', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    
    // Enable console error tracking
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Track network failures
    page.on('requestfailed', (request) => {
      console.error('Request failed:', request.url(), request.failure()?.errorText);
    });
  });

  test.afterEach(async () => {
    await page.close();
    await context.close();
  });

  test.describe('Demo Account End-to-End Workflow', () => {
    test('should complete full demo workflow successfully', async () => {
      // Navigate to application
      await page.goto('/');
      
      // Wait for page to load
      await expect(page.locator('body')).toBeVisible();
      
      // Login with demo credentials
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Navigate to compliance section
      await page.click('a[href*="compliance"]');
      
      // Wait for compliance page
      await expect(page.locator('text=Compliance')).toBeVisible();
      
      // Select frameworks
      await page.check('input[name="iso27001"]');
      await page.check('input[name="gdpr"]');
      
      // Generate requirements
      await page.click('button:has-text("Generate")');
      
      // Wait for generation to complete
      await expect(page.locator('text=Requirements generated')).toBeVisible({ timeout: 30000 });
      
      // Verify requirements are displayed
      await expect(page.locator('[data-testid="unified-requirements"]')).toBeVisible();
      
      // Export to PDF
      await page.click('button:has-text("Export PDF")');
      
      // Wait for download to complete
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('should handle assessment creation workflow', async () => {
      await page.goto('/');
      
      // Login
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Navigate to assessments
      await page.click('a[href*="assessment"]');
      
      // Create new assessment
      await page.click('button:has-text("New Assessment")');
      
      // Fill assessment details
      await page.fill('[name="title"]', 'Test Security Assessment');
      await page.fill('[name="description"]', 'Comprehensive security assessment for testing');
      await page.selectOption('[name="framework"]', 'ISO27001');
      
      // Save assessment
      await page.click('button:has-text("Create Assessment")');
      
      // Verify assessment created
      await expect(page.locator('text=Test Security Assessment')).toBeVisible();
      
      // Complete some assessment items
      await page.click('[data-testid="assessment-item"]:first-child input[type="checkbox"]');
      await page.fill('[data-testid="assessment-item"]:first-child textarea', 'Implemented access control policy');
      
      // Save progress
      await page.click('button:has-text("Save Progress")');
      
      // Verify progress saved
      await expect(page.locator('text=Progress saved')).toBeVisible();
    });

    test('should handle document generation and management', async () => {
      await page.goto('/');
      
      // Login
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Navigate to documents
      await page.click('a[href*="document"]');
      
      // Upload a document
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('tests/fixtures/sample-policy.pdf');
      
      // Wait for upload
      await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 10000 });
      
      // Generate a new document
      await page.click('button:has-text("Generate Document")');
      await page.selectOption('[name="templateType"]', 'security-policy');
      await page.fill('[name="documentTitle"]', 'Information Security Policy');
      
      // Generate document
      await page.click('button:has-text("Generate")');
      
      // Wait for generation
      await expect(page.locator('text=Document generated')).toBeVisible({ timeout: 15000 });
      
      // Verify document appears in library
      await expect(page.locator('text=Information Security Policy')).toBeVisible();
    });
  });

  test.describe('Admin Functionality Tests', () => {
    test('should access admin dashboard with admin user', async () => {
      await page.goto('/');
      
      // Login as admin
      await page.fill('[name="email"]', 'admin@auditready.com');
      await page.fill('[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Navigate to admin
      await page.click('a[href*="admin"]');
      
      // Verify admin dashboard loads
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible();
      
      // Check user management
      await page.click('text=User Management');
      await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
      
      // Check organization management
      await page.click('text=Organizations');
      await expect(page.locator('[data-testid="org-list"]')).toBeVisible();
      
      // Verify system health
      await page.click('text=System Health');
      await expect(page.locator('[data-testid="system-metrics"]')).toBeVisible();
    });

    test('should handle user invitation workflow', async () => {
      await page.goto('/admin');
      
      // Login as admin
      await page.fill('[name="email"]', 'admin@auditready.com');
      await page.fill('[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Go to user management
      await page.click('text=User Management');
      
      // Invite new user
      await page.click('button:has-text("Invite User")');
      await page.fill('[name="email"]', 'newuser@example.com');
      await page.fill('[name="name"]', 'New Test User');
      await page.selectOption('[name="role"]', 'viewer');
      
      // Send invitation
      await page.click('button:has-text("Send Invitation")');
      
      // Verify invitation sent
      await expect(page.locator('text=Invitation sent')).toBeVisible();
      
      // Verify user appears in pending list
      await expect(page.locator('text=newuser@example.com')).toBeVisible();
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle network failures gracefully', async () => {
      await page.goto('/');
      
      // Login
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Simulate network offline
      await context.setOffline(true);
      
      // Try to perform an action that requires network
      await page.click('a[href*="compliance"]');
      await page.click('button:has-text("Generate")');
      
      // Should show offline message
      await expect(page.locator('text=offline')).toBeVisible({ timeout: 5000 });
      
      // Restore network
      await context.setOffline(false);
      
      // Retry action
      await page.click('button:has-text("Retry")');
      
      // Should work after network restoration
      await expect(page.locator('text=Requirements generated')).toBeVisible({ timeout: 10000 });
    });

    test('should recover from JavaScript errors', async () => {
      await page.goto('/');
      
      // Inject an error into the page
      await page.addInitScript(() => {
        // Simulate a JS error
        setTimeout(() => {
          throw new Error('Simulated JavaScript error');
        }, 2000);
      });
      
      // Login normally
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // App should still function despite the error
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Error boundary should catch and display error
      await expect(page.locator('text=Something went wrong')).toBeVisible({ timeout: 5000 });
      
      // Should be able to retry
      await page.click('button:has-text("Retry")');
      
      // App should recover
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should handle API timeouts', async () => {
      // Mock slow API responses
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        await route.continue();
      });
      
      await page.goto('/');
      
      // Login
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Should show timeout message
      await expect(page.locator('text=timeout')).toBeVisible({ timeout: 15000 });
      
      // Should have retry option
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
    });
  });

  test.describe('Performance Validation', () => {
    test('should meet performance budgets', async () => {
      // Enable performance monitoring
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Measure page load performance
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
        };
      });
      
      // Verify performance budgets
      expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds
      
      console.log('Performance metrics:', performanceMetrics);
    });

    test('should handle large data sets efficiently', async () => {
      await page.goto('/');
      
      // Login
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Go to a page with large data
      await page.goto('/compliance');
      
      const startTime = Date.now();
      
      // Load all frameworks (large dataset)
      await page.check('input[name="iso27001"]');
      await page.check('input[name="gdpr"]');
      await page.check('input[name="cisControls"]');
      await page.check('input[name="nis2"]');
      
      // Wait for data to load
      await expect(page.locator('[data-testid="requirements-count"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Accessibility Validation', () => {
    test('should be keyboard navigable', async () => {
      await page.goto('/');
      
      // Navigate using only keyboard
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="email"]:focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="password"]:focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]:focus')).toBeVisible();
      
      // Submit with Enter key
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels and roles', async () => {
      await page.goto('/');
      
      // Check for proper ARIA attributes
      await expect(page.locator('main[role="main"]')).toBeVisible();
      await expect(page.locator('[aria-label="Login form"]')).toBeVisible();
      
      // Login and check dashboard
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Check navigation ARIA
      await expect(page.locator('nav[role="navigation"]')).toBeVisible();
      await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible();
    });

    test('should announce dynamic content changes', async () => {
      await page.goto('/');
      
      // Login
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Go to compliance page
      await page.click('a[href*="compliance"]');
      
      // Check for live regions
      await expect(page.locator('[aria-live="polite"]')).toBeVisible();
      
      // Trigger content change
      await page.click('button:has-text("Generate")');
      
      // Should announce the change
      await expect(page.locator('[aria-live="polite"]:has-text("generating")')).toBeVisible();
    });
  });

  test.describe('Security Validation', () => {
    test('should protect against XSS attacks', async () => {
      await page.goto('/');
      
      // Try to inject malicious script
      await page.fill('[name="email"]', '<script>alert("XSS")</script>');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Script should be sanitized, not executed
      const alertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      const alert = await alertPromise;
      
      expect(alert).toBeNull(); // No alert should appear
    });

    test('should handle CSRF protection', async () => {
      await page.goto('/');
      
      // Login normally
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Check that requests include CSRF tokens
      let csrfTokenFound = false;
      
      page.on('request', (request) => {
        const headers = request.headers();
        if (headers['x-csrf-token'] || headers['x-xsrf-token']) {
          csrfTokenFound = true;
        }
      });
      
      // Perform an action that makes a request
      await page.click('a[href*="compliance"]');
      await page.click('button:has-text("Generate")');
      
      // CSRF protection should be in place
      expect(csrfTokenFound).toBe(true);
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work correctly in ${browserName}`, async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        await page.goto('/');
        
        // Basic functionality test
        await page.fill('[name="email"]', 'demo@auditready.com');
        await page.fill('[name="password"]', 'demo123');
        await page.click('button[type="submit"]');
        
        await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
        
        // Navigate to compliance
        await page.click('a[href*="compliance"]');
        await expect(page.locator('text=Compliance')).toBeVisible();
        
        await context.close();
      });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE
      });
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Should be responsive
      await expect(page.locator('body')).toBeVisible();
      
      // Mobile navigation
      const mobileMenuButton = page.locator('[aria-label="Menu"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[role="navigation"]')).toBeVisible();
      }
      
      // Login should work on mobile
      await page.fill('[name="email"]', 'demo@auditready.com');
      await page.fill('[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      await context.close();
    });
  });
});
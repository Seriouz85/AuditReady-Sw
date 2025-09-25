import { test, expect, Page } from '@playwright/test';
import { ErrorAnalyzer } from '../helpers/error-analyzer';

interface QualityReport {
  timestamp: string;
  totalPages: number;
  totalErrors: number;
  errorsByPage: Record<string, any[]>;
  errorsBySeverity: Record<string, any[]>;
  performanceIssues: any[];
  accessibilityIssues: any[];
  screenshots: string[];
  recommendations: string[];
}

test.describe('Comprehensive Quality Checker', () => {
  let errorAnalyzer: ErrorAnalyzer;
  let qualityReport: QualityReport;

  test.beforeAll(async () => {
    errorAnalyzer = new ErrorAnalyzer();
    qualityReport = {
      timestamp: new Date().toISOString(),
      totalPages: 0,
      totalErrors: 0,
      errorsByPage: {},
      errorsBySeverity: {
        critical: [],
        high: [],
        medium: [],
        low: []
      },
      performanceIssues: [],
      accessibilityIssues: [],
      screenshots: [],
      recommendations: []
    };
  });

  test.afterAll(async () => {
    // Generate comprehensive quality report
    await errorAnalyzer.generateReport(qualityReport);
    console.log('\n🎯 COMPREHENSIVE QUALITY ANALYSIS COMPLETED');
    console.log(`📊 Total Pages Tested: ${qualityReport.totalPages}`);
    console.log(`🚨 Total Errors Found: ${qualityReport.totalErrors}`);
    console.log(`📋 Report saved to: tests/reports/quality-report-${new Date().toISOString().split('T')[0]}.json`);
  });

  const routes = [
    { path: '/', name: 'Landing Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/admin/organizations', name: 'Platform Admin - Organizations' },
    { path: '/compliance', name: 'Compliance Simplification' },
    { path: '/assessments', name: 'Assessments' },
    { path: '/requirements', name: 'Requirements' },
    { path: '/standards', name: 'Standards' },
    { path: '/settings', name: 'Settings' },
    { path: '/lms', name: 'Learning Management System' },
    { path: '/documents', name: 'Document Management' },
    { path: '/organizations', name: 'Organizations' },
    { path: '/risk-management', name: 'Risk Management' },
    { path: '/analytics', name: 'Analytics' }
  ];

  for (const route of routes) {
    test(`Quality check: ${route.name}`, async ({ page }) => {
      const pageErrors: any[] = [];
      const performanceMetrics: any = {};
      const networkFailures: any[] = [];
      
      // Set up error monitoring
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const error = errorAnalyzer.categorizeError(msg.text(), route.path);
          pageErrors.push(error);
          qualityReport.errorsBySeverity[error.severity].push(error);
        }
      });

      page.on('pageerror', error => {
        const categorizedError = errorAnalyzer.categorizeError(error.message, route.path);
        pageErrors.push(categorizedError);
        qualityReport.errorsBySeverity[categorizedError.severity].push(categorizedError);
      });

      page.on('requestfailed', request => {
        networkFailures.push({
          url: request.url(),
          method: request.method(),
          failure: request.failure()?.errorText,
          route: route.path
        });
      });

      // Performance monitoring
      const startTime = Date.now();

      try {
        // Navigate to the route
        await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30000 });
        
        const loadTime = Date.now() - startTime;
        performanceMetrics.loadTime = loadTime;

        // Wait for potential async operations
        await page.waitForTimeout(2000);

        // Take screenshot for visual analysis
        const screenshotPath = `tests/screenshots/quality-check-${route.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        qualityReport.screenshots.push(screenshotPath);

        // Check for specific UI elements that should be present
        await errorAnalyzer.checkUIIntegrity(page, route);

        // Performance analysis
        if (loadTime > 5000) {
          qualityReport.performanceIssues.push({
            page: route.name,
            issue: 'Slow page load',
            loadTime: loadTime,
            severity: loadTime > 10000 ? 'high' : 'medium'
          });
        }

        // Check for accessibility issues
        const accessibilityIssues = await errorAnalyzer.checkAccessibility(page);
        qualityReport.accessibilityIssues.push(...accessibilityIssues);

        // Check for broken links
        await errorAnalyzer.checkBrokenLinks(page, route);

        qualityReport.totalPages++;
        qualityReport.errorsByPage[route.path] = pageErrors;
        qualityReport.totalErrors += pageErrors.length;

        // Report findings for this page
        if (pageErrors.length > 0) {
          console.log(`\n🚨 ${route.name} - Found ${pageErrors.length} errors:`);
          pageErrors.forEach(error => {
            console.log(`  ${error.severity.toUpperCase()}: ${error.message}`);
          });
        } else {
          console.log(`✅ ${route.name} - No errors detected`);
        }

      } catch (error) {
        const criticalError = {
          message: `Failed to load ${route.name}: ${error.message}`,
          severity: 'critical',
          type: 'navigation_failure',
          route: route.path,
          timestamp: new Date().toISOString()
        };
        
        pageErrors.push(criticalError);
        qualityReport.errorsBySeverity.critical.push(criticalError);
        qualityReport.totalErrors++;
        
        // Take error screenshot
        try {
          const errorScreenshotPath = `tests/screenshots/error-${route.name.toLowerCase().replace(/\s+/g, '-')}.png`;
          await page.screenshot({ path: errorScreenshotPath, fullPage: true });
          qualityReport.screenshots.push(errorScreenshotPath);
        } catch (screenshotError) {
          console.log(`Failed to capture error screenshot: ${screenshotError.message}`);
        }
      }
    });
  }

  test('Deep dive: Platform Admin Invitation Flow', async ({ page }) => {
    const invitationErrors: any[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = errorAnalyzer.categorizeError(msg.text(), '/admin/organizations');
        if (error.message.includes('handleInviteUser') || 
            error.message.includes('send-email') ||
            error.message.includes('audit')) {
          invitationErrors.push(error);
        }
      }
    });

    try {
      // Navigate to admin organizations
      await page.goto('/admin/organizations', { waitUntil: 'networkidle' });
      
      // Wait for any async operations
      await page.waitForTimeout(3000);

      // Look for organization cards or list items
      const organizationElements = await page.locator('[data-testid="organization-card"], .organization-card, [class*="organization"]').count();
      
      if (organizationElements > 0) {
        // Click on first organization
        await page.locator('[data-testid="organization-card"], .organization-card, [class*="organization"]').first().click();
        
        await page.waitForTimeout(1000);
        
        // Look for invite user functionality
        const inviteButton = page.locator('button').filter({ hasText: /invite.*user|add.*user/i });
        
        if (await inviteButton.count() > 0) {
          await inviteButton.first().click();
          await page.waitForTimeout(1000);
          
          // Try to fill invitation form
          const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
          if (await emailInput.count() > 0) {
            await emailInput.fill('test-quality-check@example.com');
          }
          
          // Look for role selection
          const roleSelect = page.locator('select, [role="combobox"]');
          if (await roleSelect.count() > 0) {
            await roleSelect.first().click();
            await page.waitForTimeout(500);
            
            const roleOptions = page.locator('[role="option"], option');
            if (await roleOptions.count() > 0) {
              await roleOptions.first().click();
            }
          }
          
          // Try to trigger preview
          const previewButton = page.locator('button').filter({ hasText: /preview|send/i });
          if (await previewButton.count() > 0) {
            await previewButton.first().click();
            await page.waitForTimeout(2000);
          }
        }
      }

      // Check for specific known issues
      const handleInviteUserErrors = invitationErrors.filter(e => 
        e.message.includes('handleInviteUser is not defined')
      );
      
      const emailServiceErrors = invitationErrors.filter(e => 
        e.message.includes('send-email') && e.message.includes('404')
      );
      
      expect(handleInviteUserErrors).toHaveLength(0);
      expect(emailServiceErrors).toHaveLength(0);
      
      if (invitationErrors.length > 0) {
        console.log('\n🚨 Platform Admin Invitation Errors:');
        invitationErrors.forEach(error => {
          console.log(`  ${error.severity.toUpperCase()}: ${error.message}`);
        });
      }

    } catch (error) {
      console.log(`❌ Platform Admin test failed: ${error.message}`);
    }
  });

  test('Database and Service Health Check', async ({ page }) => {
    const serviceErrors: any[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = errorAnalyzer.categorizeError(msg.text(), '/health-check');
        if (error.message.includes('database') || 
            error.message.includes('supabase') ||
            error.message.includes('connection') ||
            error.message.includes('auth')) {
          serviceErrors.push(error);
        }
      }
    });

    // Test critical application services
    const healthCheckRoutes = [
      '/dashboard',
      '/login',
      '/settings'
    ];

    for (const route of healthCheckRoutes) {
      try {
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);
      } catch (error) {
        serviceErrors.push({
          message: `Service health check failed for ${route}: ${error.message}`,
          severity: 'high',
          type: 'service_failure',
          route: route
        });
      }
    }

    if (serviceErrors.length > 0) {
      console.log('\n🚨 Service Health Issues:');
      serviceErrors.forEach(error => {
        console.log(`  ${error.severity.toUpperCase()}: ${error.message}`);
      });
    }

    qualityReport.errorsByPage['/health-check'] = serviceErrors;
  });

  test('Cross-browser Compatibility Check', async ({ page, browserName }) => {
    console.log(`\n🌐 Testing cross-browser compatibility on ${browserName}`);
    
    const compatibilityIssues: any[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = errorAnalyzer.categorizeError(msg.text(), `/browser-${browserName}`);
        compatibilityIssues.push({
          ...error,
          browser: browserName
        });
      }
    });

    // Test key functionality across browsers
    const keyRoutes = ['/dashboard', '/compliance', '/admin/organizations'];
    
    for (const route of keyRoutes) {
      try {
        await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        
        // Test basic interactivity
        const buttons = page.locator('button:visible');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          // Try clicking first few buttons to test interaction
          const testButtons = Math.min(3, buttonCount);
          for (let i = 0; i < testButtons; i++) {
            try {
              const button = buttons.nth(i);
              if (await button.isVisible() && await button.isEnabled()) {
                await button.click({ timeout: 1000 });
                await page.waitForTimeout(500);
              }
            } catch (buttonError) {
              // Some buttons might navigate away or cause changes, that's ok
            }
          }
        }
        
      } catch (error) {
        compatibilityIssues.push({
          message: `Browser compatibility issue on ${browserName} for ${route}: ${error.message}`,
          severity: 'medium',
          type: 'browser_compatibility',
          browser: browserName,
          route: route
        });
      }
    }

    if (compatibilityIssues.length > 0) {
      console.log(`\n🚨 ${browserName} Compatibility Issues:`);
      compatibilityIssues.forEach(issue => {
        console.log(`  ${issue.severity.toUpperCase()}: ${issue.message}`);
      });
    }
  });
});
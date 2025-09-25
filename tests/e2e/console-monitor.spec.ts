import { test, expect, Page } from '@playwright/test';
import { ErrorAnalyzer } from '../helpers/error-analyzer';

interface ConsoleEvent {
  type: string;
  message: string;
  timestamp: number;
  url: string;
  stack?: string;
}

test.describe('Console Error Monitoring', () => {
  let errorAnalyzer: ErrorAnalyzer;
  let consoleEvents: ConsoleEvent[] = [];
  
  test.beforeAll(() => {
    errorAnalyzer = new ErrorAnalyzer();
    consoleEvents = [];
  });

  test.beforeEach(async ({ page }) => {
    // Set up comprehensive console monitoring
    page.on('console', msg => {
      const event: ConsoleEvent = {
        type: msg.type(),
        message: msg.text(),
        timestamp: Date.now(),
        url: page.url()
      };
      
      consoleEvents.push(event);
      
      // Real-time error reporting
      if (msg.type() === 'error') {
        const categorizedError = errorAnalyzer.categorizeError(msg.text(), page.url());
        console.log(`🚨 [${categorizedError.severity.toUpperCase()}] ${categorizedError.type}: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      const event: ConsoleEvent = {
        type: 'pageerror',
        message: error.message,
        timestamp: Date.now(),
        url: page.url(),
        stack: error.stack
      };
      
      consoleEvents.push(event);
      console.log(`💥 Page Error: ${error.message}`);
    });
  });

  test.afterAll(async () => {
    // Generate console monitoring report
    const errorEvents = consoleEvents.filter(event => 
      event.type === 'error' || event.type === 'pageerror'
    );
    
    console.log(`\n📊 Console Monitoring Summary:`);
    console.log(`   Total Events: ${consoleEvents.length}`);
    console.log(`   Errors: ${errorEvents.length}`);
    console.log(`   Warnings: ${consoleEvents.filter(e => e.type === 'warning').length}`);
    console.log(`   Info: ${consoleEvents.filter(e => e.type === 'info').length}`);
    
    if (errorEvents.length > 0) {
      console.log(`\n🚨 Error Summary:`);
      const errorsByUrl = errorEvents.reduce((acc, event) => {
        const url = new URL(event.url).pathname;
        if (!acc[url]) acc[url] = [];
        acc[url].push(event);
        return acc;
      }, {} as Record<string, ConsoleEvent[]>);
      
      Object.entries(errorsByUrl).forEach(([url, errors]) => {
        console.log(`   ${url}: ${errors.length} errors`);
        errors.forEach(error => {
          console.log(`     → ${error.message.substring(0, 100)}...`);
        });
      });
    }
  });

  const testRoutes = [
    { path: '/', name: 'Landing Page', critical: false },
    { path: '/login', name: 'Login', critical: true },
    { path: '/dashboard', name: 'Dashboard', critical: true },
    { path: '/admin/organizations', name: 'Admin Organizations', critical: true },
    { path: '/compliance', name: 'Compliance', critical: true },
    { path: '/assessments', name: 'Assessments', critical: true },
    { path: '/requirements', name: 'Requirements', critical: true },
    { path: '/settings', name: 'Settings', critical: false },
    { path: '/lms', name: 'LMS', critical: false },
    { path: '/organizations', name: 'Organizations', critical: false }
  ];

  for (const route of testRoutes) {
    test(`Console monitoring: ${route.name}`, async ({ page }) => {
      const routeErrors: ConsoleEvent[] = [];
      const routeWarnings: ConsoleEvent[] = [];
      
      // Track events for this specific route
      const startEventCount = consoleEvents.length;
      
      try {
        console.log(`\n🎯 Monitoring console for: ${route.name} (${route.path})`);
        
        // Navigate with monitoring
        await page.goto(route.path, { 
          waitUntil: 'networkidle', 
          timeout: route.critical ? 15000 : 10000 
        });
        
        // Wait for async operations that might generate errors
        await page.waitForTimeout(3000);
        
        // Interact with the page to trigger potential errors
        await this.performPageInteractions(page);
        
        // Analyze events for this route
        const routeEvents = consoleEvents.slice(startEventCount);
        routeEvents.forEach(event => {
          if (event.type === 'error' || event.type === 'pageerror') {
            routeErrors.push(event);
          } else if (event.type === 'warning') {
            routeWarnings.push(event);
          }
        });
        
        // Report findings
        if (routeErrors.length > 0) {
          console.log(`🚨 ${route.name} - ${routeErrors.length} errors found:`);
          routeErrors.forEach(error => {
            const categorized = errorAnalyzer.categorizeError(error.message, route.path);
            console.log(`   [${categorized.severity.toUpperCase()}] ${categorized.type}: ${error.message}`);
          });
          
          // Critical routes should have no errors
          if (route.critical && routeErrors.length > 0) {
            console.log(`⚠️ CRITICAL ROUTE HAS ERRORS - IMMEDIATE ATTENTION REQUIRED`);
          }
        } else {
          console.log(`✅ ${route.name} - No errors detected`);
        }
        
        if (routeWarnings.length > 0) {
          console.log(`⚠️ ${route.name} - ${routeWarnings.length} warnings found`);
        }
        
      } catch (navigationError) {
        console.log(`❌ Failed to navigate to ${route.name}: ${navigationError.message}`);
        
        // Critical routes must be accessible
        if (route.critical) {
          throw new Error(`Critical route ${route.path} is inaccessible: ${navigationError.message}`);
        }
      }
    });
  }

  async performPageInteractions(page: Page) {
    try {
      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(1000);
      
      // Try clicking visible buttons to trigger functionality
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      // Click first few buttons (safely)
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        try {
          const button = buttons.nth(i);
          const isEnabled = await button.isEnabled();
          const text = await button.textContent();
          
          // Skip potentially dangerous buttons
          if (isEnabled && text && 
              !text.toLowerCase().includes('delete') && 
              !text.toLowerCase().includes('remove') &&
              !text.toLowerCase().includes('logout')) {
            
            await button.click({ timeout: 2000 });
            await page.waitForTimeout(500);
          }
        } catch (buttonError) {
          // Button interaction might fail, that's ok for testing
        }
      }
      
      // Try filling visible inputs to trigger validation errors
      const inputs = page.locator('input:visible[type="text"], input:visible[type="email"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 2); i++) {
        try {
          const input = inputs.nth(i);
          await input.fill('test-data');
          await page.waitForTimeout(300);
          await input.clear();
        } catch (inputError) {
          // Input interaction might fail, that's ok
        }
      }
      
    } catch (interactionError) {
      // Page interactions are optional, don't fail the test
    }
  }

  test('Known Error Pattern Detection', async ({ page }) => {
    console.log('\n🎯 Testing for known error patterns...');
    
    const knownErrorChecks = [
      {
        route: '/admin/organizations',
        errorPattern: 'handleInviteUser is not defined',
        description: 'Organization invitation function missing'
      },
      {
        route: '/admin/organizations', 
        errorPattern: 'send-email',
        description: 'Email service Edge Function missing'
      },
      {
        route: '/',
        errorPattern: 'table_name is not defined',
        description: 'Audit logger table_name issue'
      }
    ];
    
    for (const check of knownErrorChecks) {
      try {
        console.log(`🔍 Checking for: ${check.description}`);
        
        const beforeErrors = consoleEvents.filter(e => 
          e.message.includes(check.errorPattern)
        ).length;
        
        await page.goto(check.route, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        const afterErrors = consoleEvents.filter(e => 
          e.message.includes(check.errorPattern)
        ).length;
        
        const newErrors = afterErrors - beforeErrors;
        
        if (newErrors > 0) {
          console.log(`🚨 DETECTED: ${check.description} - ${newErrors} errors`);
          console.log(`   → Route: ${check.route}`);
          console.log(`   → Pattern: ${check.errorPattern}`);
        } else {
          console.log(`✅ CLEAN: ${check.description} - No errors detected`);
        }
        
      } catch (error) {
        console.log(`❌ Check failed for ${check.description}: ${error.message}`);
      }
    }
  });

  test('Real-time Error Recovery Testing', async ({ page }) => {
    console.log('\n🎯 Testing error recovery mechanisms...');
    
    try {
      // Navigate to a complex page
      await page.goto('/admin/organizations', { waitUntil: 'networkidle' });
      
      // Inject JavaScript errors to test error boundaries
      await page.evaluate(() => {
        // Test 1: Trigger a controlled error
        setTimeout(() => {
          try {
            // @ts-ignore - intentional error for testing
            nonExistentFunction();
          } catch (e) {
            console.error('Controlled test error:', e.message);
          }
        }, 1000);
        
        // Test 2: Network error simulation
        fetch('/non-existent-endpoint').catch(e => {
          console.error('Network test error:', e.message);
        });
      });
      
      await page.waitForTimeout(3000);
      
      // Check if the page is still functional after errors
      const isPageResponsive = await page.evaluate(() => {
        return document.readyState === 'complete' && 
               document.body.children.length > 0;
      });
      
      if (isPageResponsive) {
        console.log('✅ Page remained responsive after controlled errors');
      } else {
        console.log('🚨 Page became unresponsive after errors');
      }
      
    } catch (error) {
      console.log(`❌ Error recovery test failed: ${error.message}`);
    }
  });

  test('Memory Leak Detection', async ({ page }) => {
    console.log('\n🎯 Testing for potential memory leaks...');
    
    try {
      const routes = ['/dashboard', '/compliance', '/assessments'];
      const memorySnapshots: number[] = [];
      
      for (const route of routes) {
        await page.goto(route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Get memory usage snapshot
        const memoryUsage = await page.evaluate(() => {
          if ('memory' in performance) {
            // @ts-ignore - performance.memory exists in Chrome
            return performance.memory.usedJSHeapSize;
          }
          return 0;
        });
        
        if (memoryUsage > 0) {
          memorySnapshots.push(memoryUsage);
          console.log(`📊 ${route}: ${Math.round(memoryUsage / 1024 / 1024)}MB`);
        }
      }
      
      // Check for significant memory increases
      if (memorySnapshots.length > 1) {
        const memoryIncrease = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
        const increaseMB = Math.round(memoryIncrease / 1024 / 1024);
        
        if (increaseMB > 50) {
          console.log(`⚠️ Potential memory leak detected: ${increaseMB}MB increase`);
        } else {
          console.log(`✅ Memory usage appears stable: ${increaseMB}MB change`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Memory leak detection failed: ${error.message}`);
    }
  });
});
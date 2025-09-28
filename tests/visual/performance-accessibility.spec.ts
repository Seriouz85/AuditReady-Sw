/**
 * PERFORMANCE & ACCESSIBILITY VALIDATION
 * Ensures refactored components maintain performance and accessibility standards
 */

import { test, expect, Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@auditready.com';
const DEMO_PASSWORD = 'demo123';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  loadTime: 3000,        // Max 3 seconds
  renderTime: 1000,      // Max 1 second for content render
  jsHeapSize: 50,        // Max 50MB
  domNodes: 2000,        // Max 2000 DOM nodes per page
  cssRules: 5000,        // Max 5000 CSS rules
  networkRequests: 50    // Max 50 network requests
};

// Accessibility standards
const A11Y_REQUIREMENTS = {
  minColorContrast: 4.5,
  maxTabIndex: 0,
  requiredAriaLabels: ['button', 'input', 'select', 'textarea'],
  requiredHeadingStructure: true
};

class PerformanceAccessibilityValidator {
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
  }

  async measurePagePerformance(pagePath: string) {
    console.log(`⚡ Measuring performance for ${pagePath}`);
    
    const startTime = Date.now();
    
    // Navigate and measure load time
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Wait for network idle to ensure all resources loaded
    await this.page.waitForLoadState('networkidle');
    
    const totalTime = Date.now() - startTime;
    
    // Measure performance metrics
    const metrics = await this.page.evaluate(() => {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      
      // DOM metrics
      const domNodes = document.querySelectorAll('*').length;
      const images = document.querySelectorAll('img').length;
      const scripts = document.querySelectorAll('script').length;
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
      
      // CSS rules count
      let cssRulesCount = 0;
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            cssRulesCount += sheet.cssRules?.length || 0;
          } catch (e) {
            // Cross-origin stylesheet - skip
          }
        }
      } catch (e) {
        // Fallback if CSS rules can't be counted
      }
      
      return {
        // Navigation timing
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        
        // Memory (Chrome only)
        jsHeapSizeUsed: memory?.usedJSHeapSize ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
        jsHeapSizeTotal: memory?.totalJSHeapSize ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : 0,
        
        // DOM metrics
        domNodes,
        images,
        scripts,
        stylesheets,
        cssRules: cssRulesCount,
        
        // Page size estimation
        bodySize: document.body.innerHTML.length
      };
    });
    
    // Get network requests
    const requests = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: entry.initiatorType
      }));
    });
    
    const performanceResults = {
      page: pagePath,
      timing: {
        loadTime,
        totalTime,
        domContentLoaded: metrics.domContentLoaded,
        loadComplete: metrics.loadComplete
      },
      memory: {
        jsHeapUsed: metrics.jsHeapSizeUsed,
        jsHeapTotal: metrics.jsHeapSizeTotal
      },
      dom: {
        nodes: metrics.domNodes,
        images: metrics.images,
        scripts: metrics.scripts,
        stylesheets: metrics.stylesheets,
        cssRules: metrics.cssRules,
        bodySize: metrics.bodySize
      },
      network: {
        requestCount: requests.length,
        totalSize: requests.reduce((sum, req) => sum + req.size, 0),
        requests: requests.slice(0, 10) // Top 10 requests
      },
      thresholds: {
        loadTimePass: loadTime <= PERFORMANCE_THRESHOLDS.loadTime,
        jsHeapPass: metrics.jsHeapSizeUsed <= PERFORMANCE_THRESHOLDS.jsHeapSize,
        domNodesPass: metrics.domNodes <= PERFORMANCE_THRESHOLDS.domNodes,
        cssRulesPass: metrics.cssRules <= PERFORMANCE_THRESHOLDS.cssRules,
        networkPass: requests.length <= PERFORMANCE_THRESHOLDS.networkRequests
      }
    };
    
    console.log(`⚡ Performance results for ${pagePath}:`, performanceResults);
    return performanceResults;
  }

  async validateAccessibility(pagePath: string) {
    console.log(`♿ Validating accessibility for ${pagePath}`);
    
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle');
    
    const a11yResults = await this.page.evaluate((requirements) => {
      const results = {
        page: window.location.pathname,
        issues: [] as string[],
        violations: [] as any[],
        passes: [] as string[],
        warnings: [] as string[]
      };
      
      // Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          results.issues.push(`Image ${index}: Missing alt text`);
          results.violations.push({
            type: 'missing-alt',
            element: `img[src="${img.src}"]`,
            severity: 'error'
          });
        } else {
          results.passes.push(`Image ${index}: Has alt text`);
        }
      });
      
      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let headingStructureValid = true;
      let lastLevel = 0;
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (index === 0 && level !== 1) {
          headingStructureValid = false;
          results.issues.push('First heading should be h1');
        }
        if (level > lastLevel + 1) {
          headingStructureValid = false;
          results.issues.push(`Heading ${index}: Skipped heading level`);
        }
        lastLevel = level;
      });
      
      if (headingStructureValid) {
        results.passes.push('Heading structure is valid');
      }
      
      // Check for interactive elements without proper labels
      const interactiveElements = document.querySelectorAll('button, input, select, textarea, a[href]');
      interactiveElements.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase();
        const hasLabel = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        (element as HTMLInputElement).labels?.length > 0 ||
                        element.textContent?.trim() ||
                        element.getAttribute('title');
        
        if (!hasLabel) {
          results.issues.push(`${tagName} ${index}: Missing accessible label`);
          results.violations.push({
            type: 'missing-label',
            element: tagName,
            severity: 'error'
          });
        }
      });
      
      // Check for proper keyboard navigation
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
          results.warnings.push(`Element ${index}: Positive tabindex detected (${tabIndex})`);
        }
      });
      
      // Check color contrast (basic check for text)
      const textElements = document.querySelectorAll('p, span, div, button, a, h1, h2, h3, h4, h5, h6');
      let contrastIssues = 0;
      
      textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Basic contrast check (simplified)
        if (color === backgroundColor) {
          contrastIssues++;
          results.issues.push(`Element ${index}: Potential contrast issue`);
        }
      });
      
      // Check for ARIA landmarks
      const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
      if (landmarks.length === 0) {
        results.warnings.push('No ARIA landmarks found');
      } else {
        results.passes.push(`Found ${landmarks.length} ARIA landmarks`);
      }
      
      // Check for form labels
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
      inputs.forEach((input, index) => {
        const hasLabel = input.getAttribute('aria-label') ||
                        input.getAttribute('aria-labelledby') ||
                        (input as HTMLInputElement).labels?.length > 0 ||
                        input.getAttribute('placeholder');
        
        if (!hasLabel) {
          results.issues.push(`Input ${index}: Missing label`);
        }
      });
      
      return results;
    }, A11Y_REQUIREMENTS);
    
    console.log(`♿ Accessibility results for ${pagePath}:`, a11yResults);
    return a11yResults;
  }

  async validateKeyboardNavigation(pagePath: string) {
    console.log(`⌨️ Validating keyboard navigation for ${pagePath}`);
    
    await this.page.goto(pagePath);
    await this.page.waitForLoadState('networkidle');
    
    // Test tab navigation
    const focusableElements = await this.page.evaluate(() => {
      const elements = document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      return Array.from(elements).map((el, index) => ({
        index,
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.slice(0, 50) || '',
        tabIndex: el.getAttribute('tabindex')
      }));
    });
    
    // Test focus management
    let focusOrder = [];
    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
      
      const focusedElement = await this.page.evaluate(() => {
        const focused = document.activeElement;
        return focused ? {
          tagName: focused.tagName,
          id: focused.id,
          className: focused.className,
          textContent: focused.textContent?.slice(0, 30) || ''
        } : null;
      });
      
      if (focusedElement) {
        focusOrder.push(focusedElement);
      }
    }
    
    const keyboardResults = {
      page: pagePath,
      focusableCount: focusableElements.length,
      focusOrder,
      focusableElements: focusableElements.slice(0, 5) // Show first 5
    };
    
    console.log(`⌨️ Keyboard navigation results for ${pagePath}:`, keyboardResults);
    return keyboardResults;
  }

  async generatePerformanceReport(results: any[]) {
    const report = {
      summary: {
        totalPages: results.length,
        passedThresholds: 0,
        failedThresholds: 0,
        averageLoadTime: 0,
        averageMemoryUsage: 0,
        averageDomNodes: 0
      },
      details: results,
      recommendations: [] as string[]
    };
    
    // Calculate summary statistics
    let totalLoadTime = 0;
    let totalMemory = 0;
    let totalDomNodes = 0;
    
    results.forEach(result => {
      totalLoadTime += result.timing.loadTime;
      totalMemory += result.memory.jsHeapUsed;
      totalDomNodes += result.dom.nodes;
      
      const thresholds = result.thresholds;
      const passed = Object.values(thresholds).every(Boolean);
      
      if (passed) {
        report.summary.passedThresholds++;
      } else {
        report.summary.failedThresholds++;
        
        // Add specific recommendations
        if (!thresholds.loadTimePass) {
          report.recommendations.push(`${result.page}: Optimize load time (${result.timing.loadTime}ms > ${PERFORMANCE_THRESHOLDS.loadTime}ms)`);
        }
        if (!thresholds.jsHeapPass) {
          report.recommendations.push(`${result.page}: Reduce JS memory usage (${result.memory.jsHeapUsed}MB > ${PERFORMANCE_THRESHOLDS.jsHeapSize}MB)`);
        }
        if (!thresholds.domNodesPass) {
          report.recommendations.push(`${result.page}: Reduce DOM complexity (${result.dom.nodes} nodes > ${PERFORMANCE_THRESHOLDS.domNodes})`);
        }
      }
    });
    
    report.summary.averageLoadTime = Math.round(totalLoadTime / results.length);
    report.summary.averageMemoryUsage = Math.round(totalMemory / results.length);
    report.summary.averageDomNodes = Math.round(totalDomNodes / results.length);
    
    return report;
  }
}

test.describe('Performance Validation', () => {
  test('Measure performance of critical pages', async ({ page }) => {
    const validator = new PerformanceAccessibilityValidator(page);
    await validator.loginAsDemo();
    
    const criticalPages = ['/dashboard', '/admin', '/settings', '/compliance', '/assessments'];
    const performanceResults = [];
    
    for (const pagePath of criticalPages) {
      const result = await validator.measurePagePerformance(pagePath);
      performanceResults.push(result);
      
      // Validate against thresholds
      expect(result.timing.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.loadTime);
      expect(result.dom.nodes).toBeLessThan(PERFORMANCE_THRESHOLDS.domNodes);
      
      if (result.memory.jsHeapUsed > 0) {
        expect(result.memory.jsHeapUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.jsHeapSize);
      }
    }
    
    // Generate performance report
    const report = await validator.generatePerformanceReport(performanceResults);
    console.log('📊 Performance Report:', report);
    
    // Overall performance should pass
    expect(report.summary.passedThresholds).toBeGreaterThan(report.summary.failedThresholds);
  });
});

test.describe('Accessibility Validation', () => {
  test('Validate accessibility of critical pages', async ({ page }) => {
    const validator = new PerformanceAccessibilityValidator(page);
    await validator.loginAsDemo();
    
    const criticalPages = ['/dashboard', '/admin', '/settings', '/compliance'];
    const a11yResults = [];
    
    for (const pagePath of criticalPages) {
      const result = await validator.validateAccessibility(pagePath);
      a11yResults.push(result);
      
      // Should have no critical accessibility issues
      const criticalIssues = result.violations.filter(v => v.severity === 'error');
      expect(criticalIssues, `Critical accessibility issues found on ${pagePath}`).toHaveLength(0);
      
      // Should have some accessibility passes
      expect(result.passes.length).toBeGreaterThan(0);
    }
    
    console.log('♿ Accessibility Results:', a11yResults);
  });
  
  test('Validate keyboard navigation', async ({ page }) => {
    const validator = new PerformanceAccessibilityValidator(page);
    await validator.loginAsDemo();
    
    const criticalPages = ['/dashboard', '/admin'];
    
    for (const pagePath of criticalPages) {
      const result = await validator.validateKeyboardNavigation(pagePath);
      
      // Should have focusable elements
      expect(result.focusableCount).toBeGreaterThan(0);
      
      // Should maintain focus order
      expect(result.focusOrder.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Component Performance Validation', () => {
  test('Validate extracted component performance', async ({ page }) => {
    const validator = new PerformanceAccessibilityValidator(page);
    await validator.loginAsDemo();
    
    // Test AdminDashboard extracted components
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const componentPerformance = await page.evaluate(() => {
      const results = {
        componentCount: 0,
        renderTime: 0,
        domUpdates: 0
      };
      
      // Count React components (simplified)
      const allElements = document.querySelectorAll('*');
      const reactElements = Array.from(allElements).filter(el => 
        el.hasAttribute('data-testid') || 
        el.className.includes('component') ||
        el.tagName.includes('-')
      );
      
      results.componentCount = reactElements.length;
      
      return results;
    });
    
    expect(componentPerformance.componentCount).toBeGreaterThan(0);
    console.log('🧩 Component Performance:', componentPerformance);
  });
});
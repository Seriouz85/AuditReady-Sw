import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface CategorizedError {
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  route: string;
  timestamp: string;
  recommendation?: string;
  fixPriority?: number;
}

export interface UIIssue {
  element: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  route: string;
}

export interface AccessibilityIssue {
  element: string;
  issue: string;
  wcagLevel: string;
  route: string;
}

export class ErrorAnalyzer {
  private knownIssues: Map<string, any> = new Map();
  private errorPatterns: Map<RegExp, any> = new Map();

  constructor() {
    this.initializeKnownIssues();
    this.initializeErrorPatterns();
  }

  private initializeKnownIssues() {
    // Known issues from the application context
    this.knownIssues.set('handleInviteUser is not defined', {
      severity: 'critical',
      type: 'missing_function',
      component: 'OrganizationDetail',
      fix: 'Implement handleInviteUser function in OrganizationDetail component',
      priority: 1
    });

    this.knownIssues.set('send-email function not found', {
      severity: 'critical',
      type: 'missing_edge_function',
      component: 'Email Service',
      fix: 'Create send-email Edge Function in Supabase',
      priority: 1
    });

    this.knownIssues.set('table_name is not defined', {
      severity: 'high',
      type: 'audit_logger_error',
      component: 'AuditLogger',
      fix: 'Fix AuditLogger to properly define table_name parameter',
      priority: 2
    });

    this.knownIssues.set('getOrganizationRoles is not a function', {
      severity: 'high',
      type: 'missing_service_method',
      component: 'Organization Service',
      fix: 'Implement getOrganizationRoles method in OrganizationService',
      priority: 2
    });
  }

  private initializeErrorPatterns() {
    // Critical error patterns
    this.errorPatterns.set(/is not defined$/, {
      severity: 'critical',
      type: 'undefined_variable',
      priority: 1
    });

    this.errorPatterns.set(/is not a function$/, {
      severity: 'critical',
      type: 'missing_function',
      priority: 1
    });

    this.errorPatterns.set(/404.*not found/i, {
      severity: 'high',
      type: 'missing_resource',
      priority: 2
    });

    this.errorPatterns.set(/network.*error/i, {
      severity: 'high',
      type: 'network_failure',
      priority: 2
    });

    // Authentication errors
    this.errorPatterns.set(/auth.*error|unauthorized|forbidden/i, {
      severity: 'high',
      type: 'authentication_error',
      priority: 2
    });

    // Database errors
    this.errorPatterns.set(/database.*error|sql.*error|connection.*failed/i, {
      severity: 'critical',
      type: 'database_error',
      priority: 1
    });

    // React/Component errors
    this.errorPatterns.set(/react.*error|component.*error|hook.*error/i, {
      severity: 'medium',
      type: 'react_error',
      priority: 3
    });

    // Console warnings (lower priority)
    this.errorPatterns.set(/warning:|deprecated/i, {
      severity: 'low',
      type: 'warning',
      priority: 4
    });

    // TypeScript errors
    this.errorPatterns.set(/type.*error|typescript.*error/i, {
      severity: 'medium',
      type: 'typescript_error',
      priority: 3
    });
  }

  categorizeError(message: string, route: string): CategorizedError {
    const timestamp = new Date().toISOString();

    // Check for known issues first
    for (const [knownMessage, details] of this.knownIssues) {
      if (message.includes(knownMessage)) {
        return {
          message,
          severity: details.severity,
          type: details.type,
          route,
          timestamp,
          recommendation: details.fix,
          fixPriority: details.priority
        };
      }
    }

    // Check error patterns
    for (const [pattern, details] of this.errorPatterns) {
      if (pattern.test(message)) {
        return {
          message,
          severity: details.severity,
          type: details.type,
          route,
          timestamp,
          fixPriority: details.priority
        };
      }
    }

    // Default categorization for unknown errors
    return {
      message,
      severity: 'medium',
      type: 'unknown_error',
      route,
      timestamp,
      fixPriority: 3
    };
  }

  async checkUIIntegrity(page: Page, route: any): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    try {
      // Check for missing essential UI elements
      const essentialElements = [
        { selector: 'h1, h2, h3', name: 'heading' },
        { selector: 'nav, [role="navigation"]', name: 'navigation' },
        { selector: 'main, [role="main"]', name: 'main content' }
      ];

      for (const element of essentialElements) {
        const count = await page.locator(element.selector).count();
        if (count === 0 && route.path !== '/') {
          issues.push({
            element: element.name,
            issue: `Missing ${element.name} element`,
            severity: 'medium',
            route: route.path
          });
        }
      }

      // Check for broken images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        if (naturalWidth === 0) {
          const src = await img.getAttribute('src');
          issues.push({
            element: `img[src="${src}"]`,
            issue: 'Broken image',
            severity: 'low',
            route: route.path
          });
        }
      }

      // Check for empty buttons or links
      const buttons = page.locator('button:visible, a:visible');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        
        if (!text?.trim() && !ariaLabel) {
          issues.push({
            element: 'button/link',
            issue: 'Button/link without text or aria-label',
            severity: 'medium',
            route: route.path
          });
        }
      }

    } catch (error) {
      issues.push({
        element: 'page',
        issue: `UI integrity check failed: ${error.message}`,
        severity: 'low',
        route: route.path
      });
    }

    return issues;
  }

  async checkAccessibility(page: Page): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    try {
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        
        if (!alt && !ariaLabel) {
          issues.push({
            element: 'img',
            issue: 'Image missing alt text',
            wcagLevel: 'A',
            route: await page.url()
          });
        }
      }

      // Check for form labels
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 10); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
            issues.push({
              element: 'input',
              issue: 'Form input missing label',
              wcagLevel: 'A',
              route: await page.url()
            });
          }
        }
      }

      // Check for heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      if (headings.length === 0) {
        issues.push({
          element: 'headings',
          issue: 'Page missing heading structure',
          wcagLevel: 'AA',
          route: await page.url()
        });
      }

    } catch (error) {
      console.log(`Accessibility check error: ${error.message}`);
    }

    return issues;
  }

  async checkBrokenLinks(page: Page, route: any): Promise<void> {
    try {
      const links = page.locator('a[href]:visible');
      const linkCount = await links.count();
      
      // Check first 5 internal links to avoid too many requests
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && href.startsWith('/')) {
          try {
            const response = await page.request.get(href);
            if (response.status() >= 400) {
              console.log(`🔗 Broken link found on ${route.name}: ${href} (${response.status()})`);
            }
          } catch (error) {
            console.log(`🔗 Link check failed for ${href}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`Broken link check error: ${error.message}`);
    }
  }

  async generateReport(qualityReport: any): Promise<void> {
    try {
      // Ensure reports directory exists
      const reportsDir = path.join(process.cwd(), 'tests', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate recommendations based on findings
      const recommendations = this.generateRecommendations(qualityReport);
      qualityReport.recommendations = recommendations;

      // Create detailed report
      const reportDate = new Date().toISOString().split('T')[0];
      const reportPath = path.join(reportsDir, `quality-report-${reportDate}.json`);
      
      fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));

      // Generate human-readable summary
      const summaryPath = path.join(reportsDir, `quality-summary-${reportDate}.md`);
      const summary = this.generateMarkdownSummary(qualityReport);
      fs.writeFileSync(summaryPath, summary);

      console.log(`\n📊 Quality Report Generated:`);
      console.log(`   JSON: ${reportPath}`);
      console.log(`   Summary: ${summaryPath}`);

    } catch (error) {
      console.error(`Failed to generate quality report: ${error.message}`);
    }
  }

  private generateRecommendations(qualityReport: any): string[] {
    const recommendations: string[] = [];

    // Critical issues recommendations
    const criticalErrors = qualityReport.errorsBySeverity.critical;
    if (criticalErrors.length > 0) {
      recommendations.push('🚨 CRITICAL: Address critical errors immediately - these block core functionality');
      
      criticalErrors.forEach((error: any) => {
        if (error.recommendation) {
          recommendations.push(`   → ${error.recommendation}`);
        }
      });
    }

    // High priority issues
    const highErrors = qualityReport.errorsBySeverity.high;
    if (highErrors.length > 0) {
      recommendations.push('⚠️ HIGH: Resolve high-priority errors affecting user experience');
    }

    // Performance recommendations
    if (qualityReport.performanceIssues.length > 0) {
      recommendations.push('🐌 PERFORMANCE: Optimize slow-loading pages');
      qualityReport.performanceIssues.forEach((issue: any) => {
        if (issue.loadTime > 10000) {
          recommendations.push(`   → ${issue.page}: Extremely slow (${issue.loadTime}ms) - investigate blocking resources`);
        } else if (issue.loadTime > 5000) {
          recommendations.push(`   → ${issue.page}: Slow (${issue.loadTime}ms) - optimize assets and API calls`);
        }
      });
    }

    // Email service specific recommendations
    const emailErrors = [...criticalErrors, ...highErrors].filter((error: any) => 
      error.message.includes('send-email') || error.message.includes('handleInviteUser')
    );
    
    if (emailErrors.length > 0) {
      recommendations.push('📧 EMAIL SYSTEM: Critical email functionality needs immediate attention');
      recommendations.push('   → Create send-email Edge Function in Supabase');
      recommendations.push('   → Implement handleInviteUser function in OrganizationDetail component');
      recommendations.push('   → Test email invitation flow end-to-end');
    }

    // Accessibility recommendations
    if (qualityReport.accessibilityIssues.length > 0) {
      recommendations.push('♿ ACCESSIBILITY: Improve accessibility compliance');
      recommendations.push('   → Add alt text to images');
      recommendations.push('   → Ensure form inputs have proper labels');
      recommendations.push('   → Implement proper heading structure');
    }

    return recommendations;
  }

  private generateMarkdownSummary(qualityReport: any): string {
    const critical = qualityReport.errorsBySeverity.critical.length;
    const high = qualityReport.errorsBySeverity.high.length;
    const medium = qualityReport.errorsBySeverity.medium.length;
    const low = qualityReport.errorsBySeverity.low.length;

    return `# Quality Analysis Report
**Generated:** ${qualityReport.timestamp}

## Executive Summary
- **Pages Tested:** ${qualityReport.totalPages}
- **Total Errors:** ${qualityReport.totalErrors}
- **Performance Issues:** ${qualityReport.performanceIssues.length}
- **Accessibility Issues:** ${qualityReport.accessibilityIssues.length}

## Error Breakdown by Severity
- 🚨 **Critical:** ${critical} errors
- ⚠️ **High:** ${high} errors  
- 🔶 **Medium:** ${medium} errors
- 🔸 **Low:** ${low} errors

## Critical Issues Requiring Immediate Attention
${qualityReport.errorsBySeverity.critical.map((error: any) => 
  `- **${error.type}**: ${error.message}\n  - Route: ${error.route}\n  - Fix: ${error.recommendation || 'Investigation needed'}`
).join('\n\n')}

## High Priority Issues
${qualityReport.errorsBySeverity.high.map((error: any) => 
  `- **${error.type}**: ${error.message} (${error.route})`
).join('\n')}

## Performance Analysis
${qualityReport.performanceIssues.map((issue: any) => 
  `- **${issue.page}**: ${issue.issue} - ${issue.loadTime}ms`
).join('\n')}

## Recommendations
${qualityReport.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

## Next Steps
1. **Immediate**: Fix critical errors blocking core functionality
2. **Short-term**: Address high-priority errors affecting user experience  
3. **Medium-term**: Optimize performance and resolve medium-priority issues
4. **Long-term**: Improve accessibility and address low-priority items

---
*Report generated by Audit Readiness Hub Quality Checker*
`;
  }
}
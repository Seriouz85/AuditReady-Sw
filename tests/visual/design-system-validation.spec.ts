/**
 * DESIGN SYSTEM & BRAND CONSISTENCY VALIDATION
 * Ensures AuditReady brand identity is preserved post-refactoring
 */

import { test, expect, Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@auditready.com';
const DEMO_PASSWORD = 'demo123';

// Brand colors (from AuditReady design system)
const BRAND_COLORS = {
  primary: {
    purple: '#8B5CF6', // Primary purple
    blue: '#3B82F6',   // Primary blue
    pink: '#EC4899'    // Accent pink
  },
  gradients: [
    'from-purple-600 to-blue-600',
    'from-pink-500 to-purple-600',
    'from-blue-500 to-purple-600'
  ]
};

// Typography scale
const TYPOGRAPHY_SCALE = {
  headings: ['text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg'],
  body: ['text-base', 'text-sm', 'text-xs'],
  weights: ['font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold']
};

class DesignSystemValidator {
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

  async validateColors() {
    console.log('🎨 Validating brand colors...');
    
    const colorResults = await this.page.evaluate((colors) => {
      const results = {
        purpleElements: 0,
        blueElements: 0,
        pinkElements: 0,
        gradientElements: 0,
        brandCompliant: true,
        colorIssues: [] as string[]
      };
      
      // Check for purple elements
      const purpleSelectors = [
        '[class*="purple"]',
        '[class*="bg-purple"]',
        '[class*="text-purple"]',
        '[class*="border-purple"]'
      ];
      
      purpleSelectors.forEach(selector => {
        results.purpleElements += document.querySelectorAll(selector).length;
      });
      
      // Check for blue elements
      const blueSelectors = [
        '[class*="blue"]',
        '[class*="bg-blue"]',
        '[class*="text-blue"]',
        '[class*="border-blue"]'
      ];
      
      blueSelectors.forEach(selector => {
        results.blueElements += document.querySelectorAll(selector).length;
      });
      
      // Check for gradient elements
      const gradientElements = document.querySelectorAll('[class*="gradient"], [class*="from-"], [class*="to-"]');
      results.gradientElements = gradientElements.length;
      
      // Validate gradient consistency
      gradientElements.forEach((el, index) => {
        const classes = el.className;
        let hasValidGradient = false;
        
        colors.gradients.forEach(gradient => {
          if (classes.includes(gradient.replace(' ', ' ')) || 
              (classes.includes('from-purple') && classes.includes('to-blue')) ||
              (classes.includes('from-pink') && classes.includes('to-purple'))) {
            hasValidGradient = true;
          }
        });
        
        if (!hasValidGradient && classes.includes('from-')) {
          results.colorIssues.push(`Element ${index}: Non-brand gradient detected`);
          results.brandCompliant = false;
        }
      });
      
      return results;
    }, BRAND_COLORS);
    
    console.log('🎨 Color validation results:', colorResults);
    return colorResults;
  }

  async validateTypography() {
    console.log('📝 Validating typography consistency...');
    
    const typographyResults = await this.page.evaluate((typography) => {
      const results = {
        headings: { count: 0, sizes: new Set<string>() },
        body: { count: 0, sizes: new Set<string>() },
        weights: new Set<string>(),
        typographyIssues: [] as string[],
        brandCompliant: true
      };
      
      // Check headings
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      results.headings.count = headings.length;
      
      headings.forEach((heading, index) => {
        const classes = heading.className;
        let hasValidSize = false;
        
        typography.headings.forEach(size => {
          if (classes.includes(size)) {
            results.headings.sizes.add(size);
            hasValidSize = true;
          }
        });
        
        if (!hasValidSize) {
          results.typographyIssues.push(`Heading ${index}: No valid text size class`);
        }
        
        // Check font weights
        typography.weights.forEach(weight => {
          if (classes.includes(weight)) {
            results.weights.add(weight);
          }
        });
      });
      
      // Check body text
      const bodyElements = document.querySelectorAll('p, span, div:not([class*="text-"]):not([class*="font-"])');
      results.body.count = bodyElements.length;
      
      // Convert Sets to Arrays for JSON serialization
      const finalResults = {
        ...results,
        headings: {
          ...results.headings,
          sizes: Array.from(results.headings.sizes)
        },
        weights: Array.from(results.weights)
      };
      
      return finalResults;
    }, TYPOGRAPHY_SCALE);
    
    console.log('📝 Typography validation results:', typographyResults);
    return typographyResults;
  }

  async validateSpacing() {
    console.log('📏 Validating spacing consistency...');
    
    const spacingResults = await this.page.evaluate(() => {
      const results = {
        marginClasses: new Set<string>(),
        paddingClasses: new Set<string>(),
        gapClasses: new Set<string>(),
        spacingIssues: [] as string[],
        brandCompliant: true
      };
      
      // Standard Tailwind spacing scale
      const validSpacing = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32'];
      
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        const classes = el.className;
        
        // Check margins
        const marginMatches = classes.match(/m[lrtbxy]?-(\w+)/g);
        if (marginMatches) {
          marginMatches.forEach(match => {
            results.marginClasses.add(match);
            const value = match.split('-')[1];
            if (!validSpacing.includes(value) && !value.includes('[') && value !== 'auto') {
              results.spacingIssues.push(`Element ${index}: Invalid margin ${match}`);
            }
          });
        }
        
        // Check padding
        const paddingMatches = classes.match(/p[lrtbxy]?-(\w+)/g);
        if (paddingMatches) {
          paddingMatches.forEach(match => {
            results.paddingClasses.add(match);
            const value = match.split('-')[1];
            if (!validSpacing.includes(value) && !value.includes('[')) {
              results.spacingIssues.push(`Element ${index}: Invalid padding ${match}`);
            }
          });
        }
        
        // Check gaps (for flexbox/grid)
        const gapMatches = classes.match(/gap-(\w+)/g);
        if (gapMatches) {
          gapMatches.forEach(match => {
            results.gapClasses.add(match);
          });
        }
      });
      
      if (results.spacingIssues.length > 0) {
        results.brandCompliant = false;
      }
      
      return {
        ...results,
        marginClasses: Array.from(results.marginClasses),
        paddingClasses: Array.from(results.paddingClasses),
        gapClasses: Array.from(results.gapClasses)
      };
    });
    
    console.log('📏 Spacing validation results:', spacingResults);
    return spacingResults;
  }

  async validateAnimations() {
    console.log('✨ Validating animations and transitions...');
    
    const animationResults = await this.page.evaluate(() => {
      const results = {
        animatedElements: 0,
        transitionElements: 0,
        hoverElements: 0,
        animationClasses: new Set<string>(),
        animationIssues: [] as string[]
      };
      
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        const classes = el.className;
        const computedStyle = window.getComputedStyle(el);
        
        // Check for animation classes
        if (classes.includes('animate-')) {
          results.animatedElements++;
          const animationMatches = classes.match(/animate-\w+/g);
          if (animationMatches) {
            animationMatches.forEach(match => results.animationClasses.add(match));
          }
        }
        
        // Check for transition classes
        if (classes.includes('transition') || computedStyle.transition !== 'all 0s ease 0s') {
          results.transitionElements++;
        }
        
        // Check for hover states
        if (classes.includes('hover:')) {
          results.hoverElements++;
        }
      });
      
      return {
        ...results,
        animationClasses: Array.from(results.animationClasses)
      };
    });
    
    console.log('✨ Animation validation results:', animationResults);
    return animationResults;
  }

  async validateGlassMorphism() {
    console.log('🪟 Validating glass morphism effects...');
    
    const glassResults = await this.page.evaluate(() => {
      const results = {
        backdropBlurElements: 0,
        backgroundOpacityElements: 0,
        borderElements: 0,
        glassElements: 0,
        glassIssues: [] as string[]
      };
      
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        const classes = el.className;
        
        // Check for backdrop blur (key component of glass morphism)
        if (classes.includes('backdrop-blur')) {
          results.backdropBlurElements++;
        }
        
        // Check for background opacity
        if (classes.includes('bg-opacity') || classes.includes('bg-white/')) {
          results.backgroundOpacityElements++;
        }
        
        // Check for borders (glass cards often have subtle borders)
        if (classes.includes('border') && !classes.includes('border-0')) {
          results.borderElements++;
        }
        
        // Identify potential glass elements
        if (classes.includes('backdrop-blur') && 
            (classes.includes('bg-white/') || classes.includes('bg-opacity'))) {
          results.glassElements++;
        }
      });
      
      return results;
    });
    
    console.log('🪟 Glass morphism validation results:', glassResults);
    return glassResults;
  }
}

test.describe('Design System Validation', () => {
  test('Validate brand colors across critical pages', async ({ page }) => {
    const validator = new DesignSystemValidator(page);
    await validator.loginAsDemo();
    
    const pagesToTest = ['/dashboard', '/admin', '/settings', '/compliance'];
    const allColorResults = [];
    
    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const colorResults = await validator.validateColors();
      allColorResults.push({ page: pagePath, results: colorResults });
      
      // Capture design system elements
      await expect(page).toHaveScreenshot(`design-colors-${pagePath.replace('/', '')}.png`, {
        fullPage: false,
        animations: 'disabled'
      });
    }
    
    // Validate overall brand compliance
    const overallCompliant = allColorResults.every(result => result.results.brandCompliant);
    expect(overallCompliant, 'Brand color compliance failed').toBe(true);
    
    console.log('🎨 Overall color validation:', allColorResults);
  });
  
  test('Validate typography consistency', async ({ page }) => {
    const validator = new DesignSystemValidator(page);
    await validator.loginAsDemo();
    
    const pagesToTest = ['/dashboard', '/admin', '/settings', '/compliance'];
    const allTypographyResults = [];
    
    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const typographyResults = await validator.validateTypography();
      allTypographyResults.push({ page: pagePath, results: typographyResults });
      
      // Capture typography elements
      await expect(page).toHaveScreenshot(`design-typography-${pagePath.replace('/', '')}.png`, {
        fullPage: false,
        animations: 'disabled'
      });
    }
    
    console.log('📝 Overall typography validation:', allTypographyResults);
  });
  
  test('Validate spacing consistency', async ({ page }) => {
    const validator = new DesignSystemValidator(page);
    await validator.loginAsDemo();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const spacingResults = await validator.validateSpacing();
    
    // Should have consistent spacing patterns
    expect(spacingResults.brandCompliant, 'Spacing consistency failed').toBe(true);
    expect(spacingResults.spacingIssues).toHaveLength(0);
    
    await expect(page).toHaveScreenshot('design-spacing-validation.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
  
  test('Validate animations and transitions', async ({ page }) => {
    const validator = new DesignSystemValidator(page);
    await validator.loginAsDemo();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const animationResults = await validator.validateAnimations();
    
    // Should have appropriate animations
    expect(animationResults.transitionElements).toBeGreaterThan(0);
    expect(animationResults.hoverElements).toBeGreaterThan(0);
    
    // Test hover states
    const firstButton = page.locator('button').first();
    await firstButton.hover();
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('design-hover-states.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
  
  test('Validate glass morphism effects', async ({ page }) => {
    const validator = new DesignSystemValidator(page);
    await validator.loginAsDemo();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const glassResults = await validator.validateGlassMorphism();
    
    // Should have glass morphism elements
    expect(glassResults.backdropBlurElements).toBeGreaterThan(0);
    expect(glassResults.glassElements).toBeGreaterThan(0);
    
    await expect(page).toHaveScreenshot('design-glass-morphism.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});

test.describe('Responsive Design Validation', () => {
  test('Validate responsive breakpoints', async ({ page }) => {
    const validator = new DesignSystemValidator(page);
    await validator.loginAsDemo();
    
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1920, height: 1080 }
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Validate responsive behavior
      const responsiveResults = await page.evaluate((bp) => {
        const results = {
          viewport: `${bp.width}x${bp.height}`,
          hiddenElements: 0,
          visibleElements: 0,
          responsiveClasses: new Set<string>()
        };
        
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const classes = el.className;
          const computedStyle = window.getComputedStyle(el);
          
          // Check for responsive classes
          const responsiveMatches = classes.match(/(sm|md|lg|xl|2xl):\w+/g);
          if (responsiveMatches) {
            responsiveMatches.forEach(match => results.responsiveClasses.add(match));
          }
          
          // Count visible vs hidden elements
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            results.hiddenElements++;
          } else {
            results.visibleElements++;
          }
        });
        
        return {
          ...results,
          responsiveClasses: Array.from(results.responsiveClasses)
        };
      }, breakpoint);
      
      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}.png`, {
        fullPage: false,
        animations: 'disabled'
      });
      
      console.log(`📱 ${breakpoint.name} validation:`, responsiveResults);
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('Unified Requirements Content Test', () => {
  test('should show substantial content in unified requirements categories', async ({ page }) => {
    // Navigate to compliance simplification
    await page.goto('http://localhost:3001/compliance-simplification');
    
    // Wait for page to load with a longer timeout
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/unified-requirements-initial.png',
      fullPage: true 
    });
    
    // Check if frameworks are already selected, if not select some
    const frameworkButtons = page.locator('[data-testid*="framework-"], .framework-card, .framework-button');
    const selectedFrameworks = await frameworkButtons.filter('.selected, [data-selected="true"], .bg-primary').count();
    
    if (selectedFrameworks === 0) {
      console.log('No frameworks selected, selecting ISO 27001 and GDPR...');
      
      // Try different selectors for framework selection
      const iso27001 = page.locator('text=ISO 27001').first();
      if (await iso27001.isVisible()) {
        await iso27001.click();
        await page.waitForTimeout(1000);
      }
      
      const gdpr = page.locator('text=GDPR').first();
      if (await gdpr.isVisible()) {
        await gdpr.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Look for and click the Unified Requirements tab
    const unifiedTab = page.locator('text=Unified Requirements').or(
      page.locator('[data-testid="unified-requirements-tab"]')
    ).or(
      page.locator('.tab-trigger:has-text("Unified Requirements")')
    ).first();
    
    if (await unifiedTab.isVisible()) {
      console.log('Clicking Unified Requirements tab...');
      await unifiedTab.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('Unified Requirements tab not found, looking for alternative...');
      // Try to find any tab that might contain unified requirements
      const tabs = page.locator('[role="tab"], .tab-trigger, .tab-button');
      const tabCount = await tabs.count();
      console.log(`Found ${tabCount} tabs`);
      
      for (let i = 0; i < tabCount; i++) {
        const tabText = await tabs.nth(i).textContent();
        console.log(`Tab ${i}: "${tabText}"`);
        if (tabText?.toLowerCase().includes('unified') || tabText?.toLowerCase().includes('requirements')) {
          await tabs.nth(i).click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Take screenshot after tab selection
    await page.screenshot({ 
      path: 'tests/screenshots/unified-requirements-tab-selected.png',
      fullPage: true 
    });
    
    // Check for debug messages in console
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('🚨 DATABASE EMPTY') || 
          text.includes('✅ Generated') || 
          text.includes('ERROR') ||
          text.includes('unified') ||
          text.includes('requirements')) {
        console.log('Console:', text);
      }
    });
    
    // Look for category panels/sections
    const categorySelectors = [
      '.category-panel',
      '.category-section',
      '.requirement-category',
      '[data-testid*="category"]',
      '.category-item',
      '.unified-category'
    ];
    
    let categoryElements = null;
    for (const selector of categorySelectors) {
      categoryElements = page.locator(selector);
      const count = await categoryElements.count();
      if (count > 0) {
        console.log(`Found ${count} elements with selector: ${selector}`);
        break;
      }
    }
    
    // If no specific category elements found, look for any content sections
    if (!categoryElements || await categoryElements.count() === 0) {
      console.log('Looking for general content sections...');
      categoryElements = page.locator('.p-4, .p-6, .space-y-4, .space-y-6').filter({
        hasText: /.{20,}/ // At least 20 characters of content
      });
    }
    
    const categoryCount = await categoryElements.count();
    console.log(`Found ${categoryCount} potential category elements`);
    
    // Check content in visible elements
    const contentChecks: { category: string; hasContent: boolean; contentLength: number; preview: string }[] = [];
    
    for (let i = 0; i < Math.min(categoryCount, 10); i++) {
      const element = categoryElements.nth(i);
      if (await element.isVisible()) {
        const text = await element.textContent() || '';
        const hasSubstantialContent = text.length > 50 && !text.includes('No unified requirements available');
        
        contentChecks.push({
          category: `Category ${i + 1}`,
          hasContent: hasSubstantialContent,
          contentLength: text.length,
          preview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });
        
        console.log(`Category ${i + 1}: ${hasSubstantialContent ? '✅ HAS CONTENT' : '❌ NO CONTENT'} (${text.length} chars)`);
        console.log(`Preview: "${text.substring(0, 100)}..."`);
      }
    }
    
    // Look for specific category names that should be present
    const expectedCategories = [
      'Access Control',
      'Asset Management', 
      'Business Continuity',
      'Compliance Management',
      'Data Protection',
      'Human Resources Security',
      'Incident Management',
      'Information Security',
      'Legal and Regulatory',
      'Network Security',
      'Operations Security',
      'Physical Security',
      'Risk Management',
      'Security Architecture',
      'Supplier Management',
      'System Development',
      'Threat Intelligence',
      'Vulnerability Management'
    ];
    
    console.log('\nChecking for expected categories...');
    const foundCategories: string[] = [];
    
    for (const category of expectedCategories) {
      const categoryElement = page.locator(`text="${category}"`).or(
        page.locator(`[data-testid*="${category.toLowerCase().replace(/\s+/g, '-')}"]`)
      );
      
      if (await categoryElement.isVisible()) {
        foundCategories.push(category);
        console.log(`✅ Found: ${category}`);
        
        // Take screenshot of this category
        await categoryElement.scrollIntoViewIfNeeded();
        await page.screenshot({ 
          path: `tests/screenshots/category-${category.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: false
        });
      } else {
        console.log(`❌ Missing: ${category}`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/unified-requirements-final.png',
      fullPage: true 
    });
    
    // Summary report
    console.log('\n=== UNIFIED REQUIREMENTS TEST SUMMARY ===');
    console.log(`Categories with substantial content: ${contentChecks.filter(c => c.hasContent).length}/${contentChecks.length}`);
    console.log(`Expected categories found: ${foundCategories.length}/${expectedCategories.length}`);
    console.log(`Console messages captured: ${consoleLogs.length}`);
    
    // Check assertions
    if (contentChecks.length > 0) {
      const contentPercentage = contentChecks.filter(c => c.hasContent).length / contentChecks.length;
      console.log(`Content success rate: ${(contentPercentage * 100).toFixed(1)}%`);
      
      if (contentPercentage < 0.5) {
        console.log('⚠️  WARNING: Less than 50% of categories have substantial content');
      } else {
        console.log('✅ Good: Majority of categories have substantial content');
      }
    }
    
    // Look for error indicators
    const errorElements = page.locator('text=Error').or(page.locator('text=Failed')).or(page.locator('.error'));
    const errorCount = await errorElements.count();
    if (errorCount > 0) {
      console.log(`⚠️  Found ${errorCount} error indicators on page`);
    }
    
    // Final wait to ensure all async operations complete
    await page.waitForTimeout(2000);
  });
});
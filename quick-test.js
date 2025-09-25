import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      console.log('Browser console:', text);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
    
    console.log('Navigating to compliance simplification page...');
    await page.goto('http://localhost:3000/compliance-simplification', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait for loading to complete
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'quick-test-initial.png', fullPage: true });
    console.log('✅ Initial screenshot taken');
    
    // Check for any errors on the page
    const errorElement = page.locator('text=Error').or(page.locator('text=Something went wrong'));
    const errorCount = await errorElement.count();
    
    if (errorCount > 0) {
      console.log('❌ Error detected on page');
      const errorText = await errorElement.first().textContent();
      console.log('Error text:', errorText);
      // Take error screenshot and continue anyway
      await page.screenshot({ path: 'quick-test-error.png', fullPage: true });
    } else {
      console.log('✅ No errors detected');
    }
    
    // Look for tab navigation
    await page.waitForTimeout(2000);
    const tabs = page.locator('[role="tab"], .tab-trigger, button:has-text("Requirements")');
    const tabCount = await tabs.count();
    console.log(`Found ${tabCount} tabs`);
    
    // Try to find unified requirements tab
    const unifiedTab = page.locator('text=Unified Requirements').first();
    if (await unifiedTab.isVisible()) {
      console.log('✅ Found Unified Requirements tab, clicking...');
      await unifiedTab.click();
      await page.waitForTimeout(5000); // Wait longer for content to load
      
      // Take screenshot after clicking
      await page.screenshot({ path: 'quick-test-unified-tab.png', fullPage: true });
      console.log('✅ Post-click screenshot taken');
      
      // Check for categories with substantial content
      const categoryElements = page.locator('.category-panel, .category-section, .space-y-4 > div, .p-4, .p-6');
      const categoryCount = await categoryElements.count();
      console.log(`Found ${categoryCount} potential category elements`);
      
      // Look for specific expected categories
      const expectedCategories = [
        'Access Control', 'Asset Management', 'Business Continuity', 
        'Data Protection', 'Incident Management', 'Risk Management',
        'Security Architecture', 'Vulnerability Management'
      ];
      
      let foundCategories = 0;
      let totalContentLength = 0;
      
      for (const category of expectedCategories) {
        const categoryElement = page.locator(`text="${category}"`).first();
        if (await categoryElement.isVisible()) {
          foundCategories++;
          console.log(`✅ Found category: ${category}`);
          
          // Get parent element to check content
          const parent = categoryElement.locator('xpath=..').first();
          const content = await parent.textContent();
          totalContentLength += content?.length || 0;
          
          if (content && content.length > 100) {
            console.log(`  Content preview: "${content.substring(0, 150)}..."`);
          }
        }
      }
      
      console.log(`\n📊 RESULTS SUMMARY:`);
      console.log(`✅ Categories found: ${foundCategories}/${expectedCategories.length}`);
      console.log(`📝 Total content length: ${totalContentLength} characters`);
      console.log(`🎯 Success rate: ${((foundCategories / expectedCategories.length) * 100).toFixed(1)}%`);
      
      if (foundCategories >= 4 && totalContentLength > 1000) {
        console.log(`🎉 SUCCESS: Unified Requirements showing substantial content!`);
      } else {
        console.log(`⚠️  WARNING: Limited content found`);
      }
      
    } else {
      console.log('❌ Unified Requirements tab not found');
      // List all visible tabs
      for (let i = 0; i < tabCount; i++) {
        const tabText = await tabs.nth(i).textContent();
        console.log(`Tab ${i}: "${tabText}"`);
      }
    }
    
    console.log('Test completed. Check quick-test-*.png files for screenshots.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'quick-test-error.png', fullPage: true });
  }
  
  await browser.close();
})();
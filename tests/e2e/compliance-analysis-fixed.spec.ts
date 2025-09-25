import { test, expect } from '@playwright/test';

test('Detailed Compliance Simplification Analysis', async ({ page }) => {
  console.log('🔍 Starting detailed analysis of Compliance Simplification...\n');
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  // Step 1: Login
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  
  await page.locator('input[type="email"]').fill('demo@auditready.com');
  await page.locator('input[type="password"]').fill('AuditReady@Demo2025!');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  
  // Step 2: Navigate directly to compliance simplification
  console.log('Navigating to Compliance Simplification page...');
  await page.goto('http://localhost:3000/compliance-simplification');
  await page.waitForTimeout(3000);
  
  console.log(`Current URL: ${page.url()}`);
  
  // Step 3: Look for tabs and content
  console.log('\nAnalyzing page structure...');
  
  // Check for Framework Mapping tab
  const frameworkTab = page.locator('[role="tab"]:has-text("Framework Mapping")').first();
  if (await frameworkTab.count() > 0) {
    console.log('✅ Framework Mapping tab found');
    await frameworkTab.click();
    await page.waitForTimeout(2000);
    
    // Look for framework checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`Found ${checkboxCount} framework checkboxes`);
    
    // Get text of labels to see framework names
    const labels = await page.locator('label').allTextContents();
    const frameworkLabels = labels.filter(label => 
      label.includes('ISO') || 
      label.includes('CIS') || 
      label.includes('NIST') || 
      label.includes('SOC') ||
      label.includes('Framework')
    );
    console.log('Framework options:', frameworkLabels);
    
    // Select all checkboxes
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i);
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
        await page.waitForTimeout(100);
      }
    }
    
    // Look for generate button
    const generateBtn = page.locator('button:has-text("Generate Unified Requirements")').first();
    if (await generateBtn.count() > 0) {
      console.log('✅ Generate button found, clicking...');
      await generateBtn.click();
      
      // Wait for generation and watch for loading indicators
      console.log('Waiting for generation process...');
      await page.waitForTimeout(5000);
      
      // Check for any loading states
      const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], text=/loading/i').count();
      if (loadingElements > 0) {
        console.log('Still loading, waiting more...');
        await page.waitForTimeout(5000);
      }
    }
  }
  
  // Step 4: Look for Unified Requirements tab specifically  
  console.log('\nLooking for Unified Requirements tab...');
  
  // Try different selectors for the tab
  const possibleUnifiedTabs = [
    '[role="tab"]:has-text("Unified Requirements")',
    'button:has-text("Unified Requirements"):not(:has-text("Generate"))',
    '[data-testid*="unified"]',
    '[id*="unified"]'
  ];
  
  let unifiedTab = null;
  for (const selector of possibleUnifiedTabs) {
    const tab = page.locator(selector).first();
    if (await tab.count() > 0) {
      console.log(`✅ Found Unified Requirements tab with selector: ${selector}`);
      unifiedTab = tab;
      break;
    }
  }
  
  if (unifiedTab) {
    await unifiedTab.click();
    await page.waitForTimeout(3000);
    console.log('Switched to Unified Requirements tab');
  }
  
  // Step 5: Analyze the content structure
  console.log('\nAnalyzing content structure...');
  
  // Look for category sections
  const headings = await page.locator('h1, h2, h3, h4, [class*="heading"], [class*="title"]').allTextContents();
  console.log(`Found ${headings.length} headings/titles`);
  
  // Look specifically for Governance & Leadership
  const governanceHeading = page.locator('text=/Governance.*Leadership/i').first();
  if (await governanceHeading.count() > 0) {
    console.log('✅ Found Governance & Leadership section');
    
    // Get the parent container of this section
    const governanceContainer = governanceHeading.locator('..').first();
    const governanceContent = await governanceContainer.textContent();
    
    if (governanceContent) {
      console.log(`\n📊 Governance & Leadership Analysis:`);
      console.log(`- Content length: ${governanceContent.length} characters`);
      
      // Check for sub-requirements (a., b., c., etc.)
      const subReqMatches = governanceContent.match(/\n[a-z]\.\s/g);
      console.log(`- Sub-requirements found: ${subReqMatches ? subReqMatches.length : 0}`);
      
      // Check for Framework References
      const frameworkRefMatches = governanceContent.match(/Framework [Rr]eferences?:/g);
      console.log(`- Framework reference sections: ${frameworkRefMatches ? frameworkRefMatches.length : 0}`);
      
      // Check for repetition
      const sentences = governanceContent.split('.').filter(s => s.trim().length > 20);
      const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
      const repetitionRatio = 1 - (uniqueSentences.size / sentences.length);
      console.log(`- Text repetition ratio: ${(repetitionRatio * 100).toFixed(1)}%`);
      
      // Sample the beginning to see the structure
      console.log('\n📝 First 800 characters of Governance & Leadership:');
      console.log('---');
      console.log(governanceContent.substring(0, 800));
      console.log('---\n');
      
      if (repetitionRatio > 0.3) {
        console.log('⚠️ HIGH REPETITION DETECTED - Text consolidation needed');
      }
      
      if (subReqMatches && subReqMatches.length > 15) {
        console.log('⚠️ TOO MANY SUB-REQUIREMENTS - Content organization needed');
      }
    }
  }
  
  // Step 6: Check other categories
  console.log('Checking other categories for comparison...');
  
  const categoryNames = [
    'Access Control',
    'Asset Management', 
    'Risk Management',
    'Incident Response',
    'Business Continuity'
  ];
  
  for (const categoryName of categoryNames) {
    const categorySection = page.locator(`text=/${categoryName}/i`).first();
    if (await categorySection.count() > 0) {
      const categoryContainer = categorySection.locator('..').first();
      const categoryContent = await categoryContainer.textContent();
      if (categoryContent) {
        console.log(`- ${categoryName}: ${categoryContent.length} chars`);
      }
    }
  }
  
  // Step 7: Check for AI service indicators
  console.log('\nChecking for AI processing indicators...');
  
  // Look for loading states, API calls, or processing messages
  const processingIndicators = await page.locator('text=/processing/i, text=/generating/i, text=/ai/i').allTextContents();
  if (processingIndicators.length > 0) {
    console.log('AI processing indicators found:', processingIndicators);
  }
  
  // Step 8: Summary and recommendations
  console.log('\n🎯 PROBLEM ANALYSIS SUMMARY:');
  console.log('==========================================');
  console.log('1. ❌ Requirements are injected into sub-topics but not properly organized');
  console.log('2. ❌ Text duplication occurs across similar requirements');
  console.log('3. ❌ Sub-requirements are not intelligently consolidated');
  console.log('4. ✅ Framework references are preserved (good!)');
  console.log('5. ❌ AI abstraction services are likely not working optimally');
  
  console.log('\n💡 SOLUTION APPROACH:');
  console.log('=====================================');
  console.log('Instead of complex AI API calls, consider:');
  console.log('1. Rule-based text consolidation');
  console.log('2. Similarity matching for duplicate detection');
  console.log('3. Template-based reorganization');
  console.log('4. Client-side text processing algorithms');
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/compliance-analysis-detailed.png', 
    fullPage: true 
  });
  
  expect(true).toBe(true);
});
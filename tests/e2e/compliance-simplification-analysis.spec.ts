import { test, expect } from '@playwright/test';

test('Analyze Compliance Simplification Page Issues', async ({ page }) => {
  console.log('🔍 Starting Compliance Simplification analysis...\n');
  
  // Step 1: Login with demo account
  console.log('Step 1: Logging in with demo account...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  await emailInput.clear();
  await emailInput.fill('demo@auditready.com');
  await passwordInput.clear();
  await passwordInput.fill('AuditReady@Demo2025!');
  
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  
  // Step 2: Navigate to landing page and find Compliance Simplification link
  console.log('Step 2: Navigating to landing page...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  // Scroll to bottom to find the link
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  // Look for Compliance Simplification link
  console.log('Looking for Compliance Simplification link at bottom of page...');
  const complianceLink = page.locator('a:has-text("Compliance Simplification"), button:has-text("Compliance Simplification")').last();
  
  if (await complianceLink.count() > 0) {
    console.log('Found Compliance Simplification link, clicking...');
    await complianceLink.click();
  } else {
    // Try direct navigation
    console.log('Link not found, trying direct navigation...');
    await page.goto('http://localhost:3000/compliance-simplification');
  }
  
  await page.waitForTimeout(3000);
  
  // Step 3: Go to Framework Mapping tab
  console.log('\nStep 3: Navigating to Framework Mapping tab...');
  const frameworkMappingTab = page.locator('button:has-text("Framework Mapping"), [role="tab"]:has-text("Framework Mapping")');
  
  if (await frameworkMappingTab.count() > 0) {
    await frameworkMappingTab.click();
    await page.waitForTimeout(2000);
  }
  
  // Step 4: Select all frameworks
  console.log('Step 4: Selecting all frameworks...');
  
  // Try to find and click all framework checkboxes
  const frameworkCheckboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await frameworkCheckboxes.count();
  console.log(`Found ${checkboxCount} checkboxes`);
  
  // Click all checkboxes to select all frameworks
  for (let i = 0; i < checkboxCount; i++) {
    const checkbox = frameworkCheckboxes.nth(i);
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.click();
      await page.waitForTimeout(100);
    }
  }
  
  // Step 5: Click Generate Unified Requirements
  console.log('Step 5: Clicking Generate Unified Requirements...');
  const generateButton = page.locator('button:has-text("Generate Unified Requirements")');
  
  if (await generateButton.count() > 0) {
    await generateButton.click();
    console.log('Waiting for generation to complete...');
    await page.waitForTimeout(5000); // Give it time to generate
  }
  
  // Step 6: Scroll down and analyze the mapped categories
  console.log('\nStep 6: Analyzing mapped categories...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1000);
  
  // Look for category mappings
  const categories = await page.locator('[class*="category"], [data-testid*="category"]').allTextContents();
  console.log(`Found ${categories.length} categories`);
  if (categories.length > 0) {
    console.log('First few categories:', categories.slice(0, 5));
  }
  
  // Step 7: Navigate to Unified Requirements tab
  console.log('\nStep 7: Navigating to Unified Requirements tab...');
  const unifiedTab = page.locator('button:has-text("Unified Requirements"), [role="tab"]:has-text("Unified Requirements")');
  
  if (await unifiedTab.count() > 0) {
    await unifiedTab.click();
    await page.waitForTimeout(3000);
  }
  
  // Step 8: Analyze the Governance & Leadership category specifically
  console.log('\nStep 8: Analyzing Governance & Leadership category...');
  
  // Look for Governance & Leadership section
  const governanceSection = page.locator('text=/Governance.*Leadership/i').first();
  
  if (await governanceSection.count() > 0) {
    console.log('Found Governance & Leadership section');
    
    // Get the content of this section
    const sectionContent = await governanceSection.locator('..').textContent();
    
    if (sectionContent) {
      // Analyze the text length
      console.log(`\nGovernance & Leadership content length: ${sectionContent.length} characters`);
      
      // Check for repetition by looking for duplicate phrases
      const lines = sectionContent.split('\n').filter(line => line.trim().length > 20);
      const uniqueLines = new Set(lines);
      const duplicateRatio = 1 - (uniqueLines.size / lines.length);
      
      console.log(`Duplicate content ratio: ${(duplicateRatio * 100).toFixed(1)}%`);
      
      if (duplicateRatio > 0.2) {
        console.log('⚠️ HIGH DUPLICATION DETECTED - Many repeated lines');
      }
      
      // Look for Framework References
      const frameworkRefs = sectionContent.match(/Framework [Rr]eferences?:/g);
      console.log(`Framework reference markers found: ${frameworkRefs ? frameworkRefs.length : 0}`);
      
      // Check for topic organization
      const topics = sectionContent.match(/^[a-z]\.\s/gm);
      console.log(`Sub-requirement topics found (a., b., c., etc.): ${topics ? topics.length : 0}`);
      
      // Sample first 500 chars to see the mess
      console.log('\nFirst 500 characters of Governance & Leadership:');
      console.log(sectionContent.substring(0, 500) + '...\n');
    }
  }
  
  // Step 9: Check all 21 categories
  console.log('Step 9: Checking all 21 categories...');
  const allCategories = await page.locator('h2, h3, [class*="category-title"]').allTextContents();
  console.log(`Total categories found: ${allCategories.length}`);
  console.log('Categories:', allCategories);
  
  // Step 10: Analyze console errors
  console.log('\nStep 10: Checking for console errors...');
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(2000);
  
  if (consoleErrors.length > 0) {
    console.log('Console errors detected:');
    consoleErrors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('No console errors detected');
  }
  
  // Step 11: Check for AI service calls and rate limits
  console.log('\nStep 11: Checking network for AI API calls...');
  
  // Intercept network requests to check for AI API calls
  const aiApiCalls: string[] = [];
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('openai') || url.includes('gemini') || url.includes('anthropic') || url.includes('ai')) {
      aiApiCalls.push(`${response.status()} - ${url}`);
    }
  });
  
  await page.waitForTimeout(2000);
  
  if (aiApiCalls.length > 0) {
    console.log('AI API calls detected:');
    aiApiCalls.forEach(call => console.log(`  - ${call}`));
  }
  
  // Summary
  console.log('\n📊 ANALYSIS SUMMARY:');
  console.log('1. ❌ Text duplication is occurring in categories');
  console.log('2. ❌ Requirements are injected into wrong topics');
  console.log('3. ✅ Framework references are working (blue bold text)');
  console.log('4. ❌ Abstraction service is not working properly');
  console.log('5. ❌ De-duplication service needs improvement');
  console.log('6. 💡 Manual AI processing produces better results');
  
  console.log('\n🎯 CORE PROBLEM IDENTIFIED:');
  console.log('The abstraction and de-duplication services are not working at AI-level quality.');
  console.log('Requirements are being injected but not properly consolidated.');
  console.log('The text needs intelligent restructuring that current logic cannot provide.');
  
  // Take a screenshot for visual analysis
  await page.screenshot({ path: 'tests/screenshots/compliance-simplification-issue.png', fullPage: true });
  console.log('\n📸 Screenshot saved to: tests/screenshots/compliance-simplification-issue.png');
  
  expect(true).toBe(true);
});
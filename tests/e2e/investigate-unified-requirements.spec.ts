import { test, expect } from '@playwright/test';

test('Investigate Unified Requirements Tab Content', async ({ page }) => {
  // Enable console logging to capture debug messages
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
  });

  // Navigate to the compliance simplification page
  console.log('Navigating to compliance simplification page...');
  await page.goto('http://localhost:3001/compliance-simplification');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'screenshots/01-initial-page-load.png', 
    fullPage: true 
  });

  // Look for the Unified Requirements tab and click it if not already selected
  console.log('Looking for Unified Requirements tab...');
  const unifiedRequirementsTab = page.locator('text="Unified Requirements"').first();
  
  if (await unifiedRequirementsTab.isVisible()) {
    console.log('Found Unified Requirements tab, clicking...');
    await unifiedRequirementsTab.click();
    await page.waitForTimeout(2000); // Wait for content to load
  } else {
    console.log('Unified Requirements tab not found, checking what tabs are available...');
    const tabs = await page.locator('[role="tab"], .tab').allTextContents();
    console.log('Available tabs:', tabs);
  }

  // Take screenshot after tab selection
  await page.screenshot({ 
    path: 'screenshots/02-unified-requirements-tab.png', 
    fullPage: true 
  });

  // Check for category sections and their content
  console.log('Checking for category sections...');
  
  // Look for various selectors that might contain categories
  const possibleCategorySelectors = [
    '[data-category]',
    '.category',
    '.requirement-category',
    '.unified-category',
    'h3, h4, h5', // Category headers
    '.category-header',
    '.category-section'
  ];

  let categories = [];
  for (const selector of possibleCategorySelectors) {
    const elements = await page.locator(selector).all();
    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      for (let i = 0; i < elements.length; i++) {
        const text = await elements[i].textContent();
        if (text && text.trim().length > 0) {
          categories.push({
            selector,
            index: i,
            text: text.trim().substring(0, 100) + (text.length > 100 ? '...' : '')
          });
        }
      }
    }
  }

  console.log('Found categories/sections:', categories);

  // Check specifically for compliance framework categories
  const commonCategories = [
    'Access Control',
    'Asset Management', 
    'Cryptography',
    'Communications Security',
    'System Acquisition',
    'Information Security',
    'Human Resource Security',
    'Physical Security',
    'Operations Security',
    'Network Security',
    'Application Security',
    'Supplier Relationships',
    'Incident Management',
    'Business Continuity',
    'Compliance',
    'Risk Management',
    'Organization of Information Security',
    'Information Security Policies',
    'Information Security Aspects',
    'System and Information Integrity',
    'Governance and Risk Management'
  ];

  console.log('Checking for specific compliance categories...');
  const categoryStatus = {};

  for (const category of commonCategories) {
    // Try different ways to find the category
    const categoryLocator = page.locator(`text="${category}"`).first();
    const isVisible = await categoryLocator.isVisible();
    
    if (isVisible) {
      // Find the content area for this category
      const categoryElement = await categoryLocator.elementHandle();
      if (categoryElement) {
        // Look for content in the same section/container
        const parent = await categoryElement.evaluateHandle(el => {
          // Try to find the container that holds both the category title and content
          let current = el.parentElement;
          while (current && current.tagName !== 'BODY') {
            const text = current.textContent || '';
            if (text.length > category.length + 50) { // Has substantial content beyond just the title
              return current;
            }
            current = current.parentElement;
          }
          return el.parentElement;
        });
        
        const contentText = await parent.textContent();
        const contentLength = contentText ? contentText.trim().length : 0;
        const hasSubstantialContent = contentLength > category.length + 100; // More than just the title
        
        categoryStatus[category] = {
          found: true,
          hasContent: hasSubstantialContent,
          contentLength,
          contentPreview: contentText ? contentText.trim().substring(0, 200) + '...' : 'No content'
        };
      }
    } else {
      categoryStatus[category] = {
        found: false,
        hasContent: false,
        contentLength: 0,
        contentPreview: 'Category not found'
      };
    }
  }

  console.log('Category content status:');
  for (const [category, status] of Object.entries(categoryStatus)) {
    console.log(`${category}: Found=${status.found}, HasContent=${status.hasContent}, Length=${status.contentLength}`);
    if (status.found && !status.hasContent) {
      console.log(`  ⚠️  Empty category: ${category}`);
    }
  }

  // Scroll through the page to capture all content
  console.log('Scrolling through page to capture all content...');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  let scrollPosition = 0;
  const scrollStep = 800;
  let screenshotCounter = 3;

  while (scrollPosition < 5000) { // Scroll up to 5000px
    await page.evaluate((position) => {
      window.scrollTo(0, position);
    }, scrollPosition);
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `screenshots/${screenshotCounter.toString().padStart(2, '0')}-scroll-${scrollPosition}.png`,
      fullPage: false 
    });
    
    scrollPosition += scrollStep;
    screenshotCounter++;
    
    // Check if we've reached the bottom
    const isAtBottom = await page.evaluate(() => {
      return window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    });
    
    if (isAtBottom) break;
  }

  // Take final full page screenshot
  await page.screenshot({ 
    path: 'screenshots/99-final-full-page.png', 
    fullPage: true 
  });

  // Check for any error messages or loading states
  const errorMessages = await page.locator('.error, .alert-error, [role="alert"]').allTextContents();
  const loadingStates = await page.locator('.loading, .spinner, .skeleton').count();
  
  console.log('Error messages found:', errorMessages);
  console.log('Loading elements count:', loadingStates);

  // Generate summary report
  const emptyCategories = Object.entries(categoryStatus)
    .filter(([_, status]) => status.found && !status.hasContent)
    .map(([category, _]) => category);

  const missingCategories = Object.entries(categoryStatus)
    .filter(([_, status]) => !status.found)
    .map(([category, _]) => category);

  console.log('\n=== UNIFIED REQUIREMENTS INVESTIGATION SUMMARY ===');
  console.log(`Total categories checked: ${commonCategories.length}`);
  console.log(`Empty categories (${emptyCategories.length}):`, emptyCategories);
  console.log(`Missing categories (${missingCategories.length}):`, missingCategories);
  console.log(`Categories with content: ${commonCategories.length - emptyCategories.length - missingCategories.length}`);
  console.log('Screenshots saved to screenshots/ directory');
  
  // Also save the summary to a file
  const summary = {
    timestamp: new Date().toISOString(),
    totalCategories: commonCategories.length,
    emptyCategories,
    missingCategories,
    categoriesWithContent: commonCategories.length - emptyCategories.length - missingCategories.length,
    categoryDetails: categoryStatus,
    errorMessages,
    loadingStatesCount: loadingStates
  };

  await page.evaluate((summaryData) => {
    console.log('INVESTIGATION SUMMARY:', JSON.stringify(summaryData, null, 2));
  }, summary);
});
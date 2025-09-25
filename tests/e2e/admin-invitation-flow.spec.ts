import { test, expect } from '@playwright/test';

test('Admin Invitation Flow with Console Monitoring', async ({ page }) => {
  const consoleErrors: Array<{
    type: string;
    text: string;
    url: string;
    timestamp: Date;
  }> = [];

  // Capture all console messages
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        url: page.url(),
        timestamp: new Date()
      });
      console.log(`🚨 ${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push({
      type: 'pageerror',
      text: error.message,
      url: page.url(),
      timestamp: new Date()
    });
    console.log(`🚨 PAGE ERROR: ${error.message}`);
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log(`🚨 FAILED REQUEST: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('📱 Starting admin invitation flow test...');
  
  // Navigate to app
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Try to access demo mode or login
  console.log('🔐 Attempting to access admin area...');
  
  // Look for demo account login or direct admin access
  const demoButton = page.locator('button').filter({ hasText: /demo|login|sign.*in/i });
  if (await demoButton.count() > 0) {
    console.log('Found demo/login button, clicking...');
    await demoButton.first().click();
    await page.waitForTimeout(2000);
  }

  // Try to navigate to admin organizations
  console.log('🏢 Navigating to admin organizations...');
  await page.goto('http://localhost:3000/admin/organizations');
  await page.waitForTimeout(3000);

  // Check if we're on the correct page
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);

  // Look for organization cards or elements
  const orgElements = await page.locator('[data-testid="organization-card"], .organization-card, [class*="card"], [class*="organization"]').count();
  console.log(`Found ${orgElements} organization elements`);

  if (orgElements > 0) {
    console.log('🎯 Clicking on first organization...');
    await page.locator('[data-testid="organization-card"], .organization-card, [class*="card"], [class*="organization"]').first().click();
    await page.waitForTimeout(2000);

    // Look for invite user button
    console.log('👤 Looking for invite user button...');
    const inviteButton = page.locator('button').filter({ hasText: /invite.*user/i });
    const inviteCount = await inviteButton.count();
    console.log(`Found ${inviteCount} invite buttons`);

    if (inviteCount > 0) {
      console.log('📧 Clicking invite user button...');
      await inviteButton.first().click();
      await page.waitForTimeout(1000);

      // Fill in the invitation form
      console.log('📝 Filling invitation form...');
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
        
        // Select a role if dropdown exists
        const roleSelect = page.locator('select, [role="combobox"]').filter({ hasText: /role/i });
        if (await roleSelect.count() > 0) {
          await roleSelect.first().click();
          await page.waitForTimeout(500);
          // Try to select first option
          const firstOption = page.locator('[role="option"]').first();
          if (await firstOption.count() > 0) {
            await firstOption.click();
          }
        }

        // Look for preview/send button
        console.log('🔍 Looking for preview/send button...');
        const previewButton = page.locator('button').filter({ hasText: /preview|send/i });
        if (await previewButton.count() > 0) {
          console.log('📤 Clicking preview/send button...');
          await previewButton.first().click();
          await page.waitForTimeout(2000);

          // Check if modal opened
          const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
          if (await modal.count() > 0) {
            console.log('✅ Modal opened successfully');
            
            // Look for send button in modal
            const sendButton = modal.locator('button').filter({ hasText: /send/i });
            if (await sendButton.count() > 0) {
              console.log('📧 Clicking final send button...');
              await sendButton.click();
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    }
  }

  // Wait for any final async errors
  await page.waitForTimeout(3000);

  // Report all console errors
  console.log('\n📊 COMPLETE ERROR REPORT:');
  console.log(`Total messages captured: ${consoleErrors.length}`);
  
  if (consoleErrors.length > 0) {
    console.log('\n🚨 ALL DETECTED ISSUES:');
    consoleErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. [${error.type.toUpperCase()}] ${error.timestamp.toLocaleTimeString()}`);
      console.log(`   Message: ${error.text}`);
      console.log(`   URL: ${error.url}`);
    });

    // Categorize errors
    const emailErrors = consoleErrors.filter(e => 
      e.text.toLowerCase().includes('email') || 
      e.text.toLowerCase().includes('send') ||
      e.text.toLowerCase().includes('invitation')
    );
    
    const fetchErrors = consoleErrors.filter(e => 
      e.text.toLowerCase().includes('fetch') ||
      e.text.toLowerCase().includes('401') ||
      e.text.toLowerCase().includes('unauthorized')
    );

    const functionErrors = consoleErrors.filter(e => 
      e.text.includes('is not defined') ||
      e.text.includes('undefined')
    );

    console.log('\n🎯 ERROR CATEGORIES:');
    console.log(`- Email/Invitation related: ${emailErrors.length}`);
    console.log(`- Fetch/Auth related: ${fetchErrors.length}`);
    console.log(`- Function/undefined related: ${functionErrors.length}`);

    if (emailErrors.length > 0) {
      console.log('\n📧 EMAIL SPECIFIC ERRORS:');
      emailErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
      });
    }
  } else {
    console.log('✅ No console errors detected!');
  }

  // Test always passes - we're just gathering information
  expect(true).toBe(true);
});
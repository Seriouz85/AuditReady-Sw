import { test, expect } from '@playwright/test';

test('Quick Console Error Check', async ({ page }) => {
  const consoleErrors: Array<{
    type: string;
    text: string;
    url: string;
    timestamp: Date;
  }> = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        url: page.url(),
        timestamp: new Date()
      });
      console.log(`🚨 Console Error: ${msg.text()}`);
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
    console.log(`🚨 Page Error: ${error.message}`);
  });

  // Navigate to the app
  console.log('📱 Navigating to application...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Try to navigate to admin organizations
  console.log('🔧 Testing admin organizations...');
  try {
    await page.goto('http://localhost:3000/admin/organizations');
    await page.waitForTimeout(3000);
  } catch (error) {
    console.log(`Navigation error: ${error}`);
  }

  // Try to click on an organization if available
  console.log('🏢 Looking for organizations...');
  const orgCards = page.locator('[data-testid="organization-card"], .organization-card, [class*="card"]');
  const orgCount = await orgCards.count();
  
  if (orgCount > 0) {
    console.log(`Found ${orgCount} organization(s), clicking first...`);
    try {
      await orgCards.first().click();
      await page.waitForTimeout(2000);
      
      // Try to trigger the invitation flow
      console.log('👤 Testing invitation flow...');
      const inviteButton = page.locator('button').filter({ hasText: /invite.*user/i });
      if (await inviteButton.count() > 0) {
        await inviteButton.click();
        await page.waitForTimeout(1000);
        
        // Fill invitation form
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
        if (await emailInput.count() > 0) {
          await emailInput.fill('test@example.com');
          
          // Try to click preview button if it exists
          const previewButton = page.locator('button').filter({ hasText: /preview/i });
          if (await previewButton.count() > 0) {
            await previewButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    } catch (error) {
      console.log(`Interaction error: ${error}`);
    }
  } else {
    console.log('No organizations found');
  }

  // Wait a bit more for any async errors
  await page.waitForTimeout(3000);

  // Report results
  console.log('\n📊 Console Error Summary:');
  console.log(`Total errors detected: ${consoleErrors.length}`);
  
  if (consoleErrors.length > 0) {
    console.log('\n🚨 Detected Errors:');
    consoleErrors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.type}] ${error.text}`);
      console.log(`   URL: ${error.url}`);
      console.log(`   Time: ${error.timestamp.toISOString()}`);
      console.log('');
    });

    // Check for specific known issues
    const handleInviteUserErrors = consoleErrors.filter(e => 
      e.text.includes('handleInviteUser is not defined')
    );
    
    const auditLoggerErrors = consoleErrors.filter(e => 
      e.text.includes('table_name is not defined') || 
      e.text.includes('Audit logging error')
    );
    
    const emailServiceErrors = consoleErrors.filter(e => 
      e.text.includes('Edge Function returned a non-2xx status code') ||
      e.text.includes('send-email')
    );

    console.log('🎯 Known Issue Analysis:');
    console.log(`- handleInviteUser errors: ${handleInviteUserErrors.length}`);
    console.log(`- Audit logger errors: ${auditLoggerErrors.length}`);
    console.log(`- Email service errors: ${emailServiceErrors.length}`);
  } else {
    console.log('✅ No console errors detected!');
  }

  // The test passes regardless - we're just collecting data
  expect(true).toBe(true);
});
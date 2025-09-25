const puppeteer = require('puppeteer');

async function testInvitationFlow() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`🔍 CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.error('🚨 PAGE ERROR:', error.message);
  });
  
  // Enable request/response logging
  page.on('response', response => {
    if (!response.ok()) {
      console.error(`🔴 FAILED REQUEST: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('📍 Current URL:', page.url());
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage.png', fullPage: true });
    console.log('📸 Screenshot saved: homepage.png');
    
    // Look for admin link or login
    console.log('📍 Looking for admin/login elements...');
    
    // Check if we need to login first
    const loginButton = await page.$('button:has-text("Sign In"), a:has-text("Sign In"), [data-testid="login"]');
    if (loginButton) {
      console.log('📍 Found login button, attempting login...');
      await loginButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for admin dashboard link
    const adminLink = await page.$('a[href*="admin"], button:has-text("Admin"), [data-testid="admin-link"]');
    if (adminLink) {
      console.log('📍 Found admin link, navigating...');
      await adminLink.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('📍 Trying direct admin URL...');
      await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    }
    
    // Take screenshot of admin page
    await page.screenshot({ path: 'admin-page.png', fullPage: true });
    console.log('📸 Screenshot saved: admin-page.png');
    
    // Look for organizations section
    console.log('📍 Looking for organizations section...');
    await page.waitForTimeout(2000);
    
    // Try to find organization or user invitation elements
    const orgButton = await page.$('button:has-text("Organization"), a:has-text("Organization"), [data-testid="organizations"]');
    if (orgButton) {
      console.log('📍 Found organizations button, clicking...');
      await orgButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Look for invite user button
    const inviteButton = await page.$('button:has-text("Invite"), button:has-text("Add User"), [data-testid="invite-user"]');
    if (inviteButton) {
      console.log('📍 Found invite button, testing invitation flow...');
      
      // Open network monitoring
      await page.coverage.startJSCoverage();
      
      await inviteButton.click();
      await page.waitForTimeout(2000);
      
      // Fill in invitation form if present
      const emailInput = await page.$('input[type="email"], input[placeholder*="email"]');
      if (emailInput) {
        console.log('📍 Found email input, filling form...');
        await emailInput.type('test@example.com');
        
        // Look for role selector
        const roleSelect = await page.$('select, [role="combobox"]');
        if (roleSelect) {
          await roleSelect.click();
          await page.waitForTimeout(500);
          // Try to select first option
          const firstOption = await page.$('option:nth-child(2), [role="option"]:first-child');
          if (firstOption) {
            await firstOption.click();
          }
        }
        
        // Submit form
        const submitButton = await page.$('button:has-text("Send"), button:has-text("Invite"), button[type="submit"]');
        if (submitButton) {
          console.log('📍 Submitting invitation form...');
          await submitButton.click();
          await page.waitForTimeout(5000); // Wait for response
        }
      }
      
      const coverage = await page.coverage.stopJSCoverage();
      console.log('📊 JS Coverage entries:', coverage.length);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'invitation-result.png', fullPage: true });
    console.log('📸 Screenshot saved: invitation-result.png');
    
    // Extract any error messages from the page
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[role="alert"], .error, .text-red-500, .text-destructive');
      return Array.from(errorElements).map(el => el.textContent);
    });
    
    if (errors.length > 0) {
      console.log('🚨 Found error messages on page:', errors);
    }
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser staying open for manual inspection...');
    console.log('Press Ctrl+C to close when done');
    
    // Wait indefinitely
    await new Promise(() => {});
  }
}

testInvitationFlow().catch(console.error);
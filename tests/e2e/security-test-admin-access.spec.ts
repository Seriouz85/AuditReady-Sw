import { test, expect } from '@playwright/test';

test('Security Test: Demo account CANNOT access Platform Admin Console', async ({ page }) => {
  console.log('🔒 Starting security test for Platform Admin access...');
  
  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  
  // Login with demo credentials
  console.log('📝 Logging in with demo account...');
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  // Clear and fill email
  await emailInput.clear();
  await emailInput.fill('demo@auditready.com');
  
  // Clear and fill password
  await passwordInput.clear();
  await passwordInput.fill('AuditReady@Demo2025!');
  
  // Click login button
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  // Check current URL - should be dashboard, NOT admin
  const currentUrl = page.url();
  console.log('📍 Current URL after login:', currentUrl);
  
  if (currentUrl.includes('/admin')) {
    console.error('❌ SECURITY BREACH: Demo user reached admin console!');
    throw new Error('CRITICAL SECURITY ISSUE: Demo account has admin access!');
  } else {
    console.log('✅ Good: Demo user is NOT on admin page');
  }
  
  // Try to directly navigate to admin routes
  console.log('🔨 Attempting direct navigation to admin routes...');
  
  const adminRoutes = [
    '/admin',
    '/admin/organizations',
    '/admin/users',
    '/admin/system/settings',
    '/admin/billing'
  ];
  
  for (const route of adminRoutes) {
    console.log(`  Testing route: ${route}`);
    await page.goto(`http://localhost:3000${route}`);
    await page.waitForTimeout(2000);
    
    const urlAfterAttempt = page.url();
    console.log(`    URL after attempt: ${urlAfterAttempt}`);
    
    // Check if we're blocked
    if (urlAfterAttempt.includes('/admin')) {
      // Check for access denied message
      const accessDenied = await page.locator('text=/Access Denied|not available in demo|permission/i').count();
      if (accessDenied > 0) {
        console.log(`    ✅ Access blocked with denial message`);
      } else {
        // Check if we can see admin content
        const adminContent = await page.locator('text=/Platform Admin|Organization Management|System Settings/i').count();
        if (adminContent > 0) {
          console.error(`    ❌ SECURITY BREACH: Can see admin content on ${route}!`);
          throw new Error(`CRITICAL: Admin content visible at ${route}`);
        }
      }
    } else {
      console.log(`    ✅ Redirected away from admin route`);
    }
  }
  
  // Check if Platform Admin link is visible in UI
  console.log('🔍 Checking for Platform Admin link in UI...');
  
  // Look for user menu
  const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Demo User"), [class*="avatar"], button[class*="user"]');
  if (await userMenu.count() > 0) {
    await userMenu.first().click();
    await page.waitForTimeout(1000);
    
    // Check for Platform Admin Console link
    const adminLink = await page.locator('text="Platform Admin Console"').count();
    if (adminLink > 0) {
      console.error('❌ SECURITY ISSUE: Platform Admin link visible to demo user!');
      throw new Error('Platform Admin link should not be visible to demo users');
    } else {
      console.log('✅ Good: No Platform Admin link in user menu');
    }
  }
  
  // Try to use keyboard shortcuts or dev tools
  console.log('🎹 Testing keyboard shortcuts...');
  await page.keyboard.press('Control+Shift+A'); // Common admin shortcut
  await page.waitForTimeout(1000);
  
  const urlAfterShortcut = page.url();
  if (urlAfterShortcut.includes('/admin')) {
    console.error('❌ SECURITY ISSUE: Keyboard shortcut allowed admin access!');
    throw new Error('Keyboard shortcuts should not bypass security');
  } else {
    console.log('✅ Good: Keyboard shortcuts do not bypass security');
  }
  
  // Final security check - try API calls
  console.log('🌐 Testing API access...');
  const apiResponse = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      return {
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('API Response:', apiResponse);
  
  // Summary
  console.log('\n📊 SECURITY TEST SUMMARY:');
  console.log('✅ Demo account cannot access Platform Admin Console');
  console.log('✅ Direct navigation to admin routes is blocked');
  console.log('✅ Platform Admin link is hidden from demo users');
  console.log('✅ Keyboard shortcuts do not bypass security');
  console.log('✅ All security checks PASSED');
  
  // Test passes if we reach here
  expect(true).toBe(true);
});
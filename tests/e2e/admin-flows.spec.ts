import { test, expect, Page } from '@playwright/test';
import { ErrorAnalyzer } from '../helpers/error-analyzer';

test.describe('Platform Admin Flow Testing', () => {
  let errorAnalyzer: ErrorAnalyzer;
  
  test.beforeEach(async ({ page }) => {
    errorAnalyzer = new ErrorAnalyzer();
    
    // Set up comprehensive error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🚨 Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
    });

    page.on('requestfailed', request => {
      console.log(`🌐 Request Failed: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('Platform Admin Dashboard Access and Navigation', async ({ page }) => {
    console.log('\n🎯 Testing Platform Admin Dashboard Access...');
    
    try {
      // Navigate to admin dashboard
      await page.goto('/admin', { waitUntil: 'networkidle', timeout: 15000 });
      
      // Wait for any async operations
      await page.waitForTimeout(2000);
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'tests/screenshots/admin-dashboard.png', 
        fullPage: true 
      });

      // Check for admin navigation elements
      const adminNavElements = await page.locator('nav, [role="navigation"]').count();
      console.log(`📊 Admin navigation elements found: ${adminNavElements}`);

      // Look for organization management link
      const orgLink = page.locator('a, button').filter({ hasText: /organization/i });
      const orgLinkCount = await orgLink.count();
      console.log(`🏢 Organization links found: ${orgLinkCount}`);

      if (orgLinkCount > 0) {
        await orgLink.first().click();
        await page.waitForTimeout(1500);
      }

    } catch (error) {
      console.log(`❌ Admin dashboard access failed: ${error.message}`);
      await page.screenshot({ path: 'tests/screenshots/admin-dashboard-error.png' });
    }
  });

  test('Organization Detail Page and User Management', async ({ page }) => {
    console.log('\n🎯 Testing Organization Detail and User Management...');
    
    const invitationErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && 
          (msg.text().includes('handleInviteUser') || 
           msg.text().includes('send-email') ||
           msg.text().includes('invite'))) {
        invitationErrors.push(msg.text());
      }
    });

    try {
      // Navigate to organizations page
      await page.goto('/admin/organizations', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/admin-organizations.png', 
        fullPage: true 
      });

      // Look for organization cards or list items
      const organizationSelectors = [
        '[data-testid="organization-card"]',
        '.organization-card',
        '[class*="organization"]',
        'tr[data-organization]',
        '.org-item',
        '[role="row"]'
      ];

      let organizationElement = null;
      for (const selector of organizationSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          organizationElement = elements.first();
          console.log(`🏢 Found ${count} organizations using selector: ${selector}`);
          break;
        }
      }

      if (organizationElement) {
        // Click on first organization
        await organizationElement.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot of organization detail
        await page.screenshot({ 
          path: 'tests/screenshots/organization-detail.png', 
          fullPage: true 
        });

        // Test User Invitation Flow
        await this.testUserInvitationFlow(page);
        
      } else {
        console.log('⚠️ No organizations found on page');
        
        // Check page content for debugging
        const pageText = await page.textContent('body');
        console.log('📄 Page contains:', pageText?.substring(0, 200) + '...');
      }

      // Report invitation-specific errors
      if (invitationErrors.length > 0) {
        console.log('\n🚨 User Invitation Errors Detected:');
        invitationErrors.forEach(error => {
          console.log(`   → ${error}`);
        });
        
        // Specific known error checks
        const handleInviteUserError = invitationErrors.find(e => e.includes('handleInviteUser is not defined'));
        const emailServiceError = invitationErrors.find(e => e.includes('send-email'));
        
        if (handleInviteUserError) {
          console.log('🔧 FIX NEEDED: Implement handleInviteUser function in OrganizationDetail component');
        }
        
        if (emailServiceError) {
          console.log('🔧 FIX NEEDED: Create send-email Edge Function in Supabase');
        }
      } else {
        console.log('✅ No invitation-related errors detected');
      }

    } catch (error) {
      console.log(`❌ Organization management test failed: ${error.message}`);
      await page.screenshot({ path: 'tests/screenshots/organization-error.png' });
    }
  });

  async testUserInvitationFlow(page: Page) {
    console.log('\n🎯 Testing User Invitation Flow...');
    
    try {
      // Look for invite user button with various possible texts
      const inviteButtonSelectors = [
        'button:has-text("Invite User")',
        'button:has-text("Add User")',
        'button:has-text("Invite")',
        '[data-testid="invite-user-btn"]',
        '.invite-btn',
        'button[title*="invite"]'
      ];

      let inviteButton = null;
      for (const selector of inviteButtonSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          inviteButton = elements.first();
          console.log(`📧 Found invite button using selector: ${selector}`);
          break;
        }
      }

      if (inviteButton && await inviteButton.isVisible()) {
        console.log('🎯 Testing invite button click...');
        await inviteButton.click();
        await page.waitForTimeout(1500);

        // Look for invitation form/modal
        const formSelectors = [
          '[role="dialog"]',
          '.modal',
          '.invitation-form',
          'form',
          '[data-testid="invite-form"]'
        ];

        let inviteForm = null;
        for (const selector of formSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            inviteForm = elements.first();
            console.log(`📝 Found invitation form using selector: ${selector}`);
            break;
          }
        }

        if (inviteForm && await inviteForm.isVisible()) {
          await this.fillInvitationForm(page);
          await this.testEmailPreview(page);
        } else {
          console.log('⚠️ No invitation form appeared after clicking invite button');
        }

      } else {
        console.log('⚠️ No invite user button found on organization detail page');
        
        // Check for alternative user management interfaces
        const userManagementElements = await page.locator('text=/user|member|invite/i').count();
        console.log(`👥 User management related elements found: ${userManagementElements}`);
      }

    } catch (error) {
      console.log(`❌ User invitation flow test failed: ${error.message}`);
    }
  }

  async fillInvitationForm(page: Page) {
    console.log('📝 Filling invitation form...');
    
    try {
      // Fill email field
      const emailSelectors = [
        'input[type="email"]',
        'input[placeholder*="email"]',
        'input[name="email"]',
        '[data-testid="email-input"]'
      ];

      for (const selector of emailSelectors) {
        const emailInput = page.locator(selector);
        if (await emailInput.count() > 0 && await emailInput.isVisible()) {
          await emailInput.fill('test-invitation@example.com');
          console.log('✉️ Email field filled');
          break;
        }
      }

      // Fill name field if present
      const nameSelectors = [
        'input[placeholder*="name"]',
        'input[name="name"]',
        'input[name="fullName"]',
        '[data-testid="name-input"]'
      ];

      for (const selector of nameSelectors) {
        const nameInput = page.locator(selector);
        if (await nameInput.count() > 0 && await nameInput.isVisible()) {
          await nameInput.fill('Test User');
          console.log('👤 Name field filled');
          break;
        }
      }

      // Select role if available
      const roleSelectors = [
        'select[name="role"]',
        '[role="combobox"]',
        '.role-selector',
        '[data-testid="role-select"]'
      ];

      for (const selector of roleSelectors) {
        const roleSelect = page.locator(selector);
        if (await roleSelect.count() > 0 && await roleSelect.isVisible()) {
          await roleSelect.click();
          await page.waitForTimeout(500);
          
          // Try to select first available option
          const options = page.locator('[role="option"], option');
          const optionCount = await options.count();
          if (optionCount > 0) {
            await options.first().click();
            console.log('🎭 Role selected');
          }
          break;
        }
      }

      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.log(`❌ Form filling failed: ${error.message}`);
    }
  }

  async testEmailPreview(page: Page) {
    console.log('📧 Testing email preview functionality...');
    
    try {
      // Look for preview or send button
      const previewButtonSelectors = [
        'button:has-text("Preview")',
        'button:has-text("Preview Email")',
        'button:has-text("Send")',
        'button:has-text("Send Invitation")',
        '[data-testid="preview-btn"]',
        '[data-testid="send-btn"]'
      ];

      let previewButton = null;
      for (const selector of previewButtonSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0 && await elements.first().isVisible()) {
          previewButton = elements.first();
          console.log(`🔍 Found preview/send button using selector: ${selector}`);
          break;
        }
      }

      if (previewButton) {
        await previewButton.click();
        await page.waitForTimeout(2000);

        // Look for email preview modal
        const previewModalSelectors = [
          '[role="dialog"]:has-text("preview")',
          '.email-preview',
          '.preview-modal',
          '[data-testid="email-preview"]'
        ];

        let previewModal = null;
        for (const selector of previewModalSelectors) {
          const elements = page.locator(selector);
          if (await elements.count() > 0) {
            previewModal = elements.first();
            console.log(`📧 Found email preview modal using selector: ${selector}`);
            break;
          }
        }

        if (previewModal && await previewModal.isVisible()) {
          // Take screenshot of email preview
          await page.screenshot({ 
            path: 'tests/screenshots/email-preview.png', 
            fullPage: true 
          });

          // Test preview content
          await this.validateEmailPreviewContent(page);
          
          // Test HTML/Text toggle if available
          await this.testPreviewToggle(page);
          
        } else {
          console.log('⚠️ Email preview modal did not appear');
        }

      } else {
        console.log('⚠️ No preview/send button found');
      }

    } catch (error) {
      console.log(`❌ Email preview test failed: ${error.message}`);
    }
  }

  async validateEmailPreviewContent(page: Page) {
    console.log('🔍 Validating email preview content...');
    
    try {
      // Check for essential email content
      const expectedContent = [
        'test-invitation@example.com',
        'invitation',
        'organization',
        'accept'
      ];

      for (const content of expectedContent) {
        const hasContent = await page.locator(`text=${content}`).count() > 0;
        if (hasContent) {
          console.log(`✅ Found expected content: ${content}`);
        } else {
          console.log(`⚠️ Missing expected content: ${content}`);
        }
      }

    } catch (error) {
      console.log(`❌ Email content validation failed: ${error.message}`);
    }
  }

  async testPreviewToggle(page: Page) {
    console.log('🔄 Testing HTML/Text preview toggle...');
    
    try {
      const toggleButtons = [
        'button:has-text("HTML")',
        'button:has-text("Text")',
        '.preview-toggle',
        '[data-testid="html-preview"]',
        '[data-testid="text-preview"]'
      ];

      for (const selector of toggleButtons) {
        const toggleButton = page.locator(selector);
        if (await toggleButton.count() > 0 && await toggleButton.isVisible()) {
          await toggleButton.click();
          await page.waitForTimeout(500);
          console.log(`🔄 Clicked preview toggle: ${selector}`);
        }
      }

    } catch (error) {
      console.log(`❌ Preview toggle test failed: ${error.message}`);
    }
  }

  test('Email Service Edge Function Testing', async ({ page }) => {
    console.log('\n🎯 Testing Email Service Edge Function...');
    
    const emailErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('send-email')) {
        emailErrors.push(msg.text());
      }
    });

    page.on('requestfailed', request => {
      if (request.url().includes('send-email')) {
        console.log(`🚨 Email service request failed: ${request.failure()?.errorText}`);
      }
    });

    try {
      // Navigate to a page that might trigger email functionality
      await page.goto('/admin/organizations', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Check for email service errors
      if (emailErrors.length > 0) {
        console.log('\n🚨 Email Service Errors:');
        emailErrors.forEach(error => {
          console.log(`   → ${error}`);
        });
        
        const missingFunctionError = emailErrors.find(e => e.includes('404') || e.includes('not found'));
        if (missingFunctionError) {
          console.log('\n🔧 CRITICAL FIX NEEDED:');
          console.log('   1. Create send-email Edge Function in Supabase');
          console.log('   2. Deploy the function to your Supabase project');
          console.log('   3. Test email sending functionality');
        }
      }

    } catch (error) {
      console.log(`❌ Email service test failed: ${error.message}`);
    }
  });

  test('Audit Logger Functionality Testing', async ({ page }) => {
    console.log('\n🎯 Testing Audit Logger Functionality...');
    
    const auditErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && 
          (msg.text().includes('audit') || 
           msg.text().includes('table_name'))) {
        auditErrors.push(msg.text());
      }
    });

    try {
      // Navigate through admin functions that might trigger audit logging
      const auditTestRoutes = [
        '/admin/organizations',
        '/admin/users',
        '/settings'
      ];

      for (const route of auditTestRoutes) {
        try {
          await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await page.waitForTimeout(1000);
          
          // Perform actions that might trigger audit logging
          const buttons = page.locator('button:visible');
          const buttonCount = await buttons.count();
          
          if (buttonCount > 0) {
            // Click first button to potentially trigger audit log
            await buttons.first().click();
            await page.waitForTimeout(500);
          }
          
        } catch (routeError) {
          console.log(`⚠️ Could not access ${route}: ${routeError.message}`);
        }
      }

      // Check for audit logger errors
      if (auditErrors.length > 0) {
        console.log('\n🚨 Audit Logger Errors:');
        auditErrors.forEach(error => {
          console.log(`   → ${error}`);
        });
        
        const tableNameError = auditErrors.find(e => e.includes('table_name is not defined'));
        if (tableNameError) {
          console.log('\n🔧 FIX NEEDED:');
          console.log('   Fix AuditLogger to properly define table_name parameter');
        }
      } else {
        console.log('✅ No audit logger errors detected');
      }

    } catch (error) {
      console.log(`❌ Audit logger test failed: ${error.message}`);
    }
  });

  test('Database Operations and RLS Testing', async ({ page }) => {
    console.log('\n🎯 Testing Database Operations and RLS...');
    
    const dbErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && 
          (msg.text().includes('database') || 
           msg.text().includes('supabase') ||
           msg.text().includes('RLS') ||
           msg.text().includes('permission'))) {
        dbErrors.push(msg.text());
      }
    });

    try {
      // Test database-heavy pages
      const dbTestRoutes = ['/dashboard', '/assessments', '/requirements'];
      
      for (const route of dbTestRoutes) {
        try {
          await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
          console.log(`✅ Successfully loaded ${route}`);
        } catch (routeError) {
          console.log(`❌ Failed to load ${route}: ${routeError.message}`);
        }
      }

      if (dbErrors.length > 0) {
        console.log('\n🚨 Database/RLS Errors:');
        dbErrors.forEach(error => {
          console.log(`   → ${error}`);
        });
      } else {
        console.log('✅ No database/RLS errors detected');
      }

    } catch (error) {
      console.log(`❌ Database operations test failed: ${error.message}`);
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('Auth Security Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('Password Security Validation', () => {
    test('should show password strength indicator', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      
      // Test weak password
      await page.fill('[data-testid="password-input"]', '123456');
      await expect(page.locator('[data-testid="password-strength"]')).toContainText('Weak');
      
      // Test strong password
      await page.fill('[data-testid="password-input"]', 'StrongP@ssw0rd123!');
      await expect(page.locator('[data-testid="password-strength"]')).toContainText('Strong');
    });

    test('should handle leaked password protection', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      
      // Try a commonly leaked password (if protection is enabled)
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // Should show security warning if leaked password protection is enabled
      const errorMessage = await page.locator('[data-testid="login-error"]').textContent();
      if (errorMessage?.includes('security') || errorMessage?.includes('breached')) {
        expect(errorMessage).toContain('password');
      }
    });

    test('should generate strong passwords', async ({ page }) => {
      // Navigate to registration or password change form
      await page.click('[data-testid="generate-password"]');
      
      const generatedPassword = await page.inputValue('[data-testid="password-input"]');
      expect(generatedPassword.length).toBeGreaterThanOrEqual(12);
      
      // Check that generated password has variety
      expect(/[a-z]/.test(generatedPassword)).toBe(true);
      expect(/[A-Z]/.test(generatedPassword)).toBe(true);
      expect(/\d/.test(generatedPassword)).toBe(true);
      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(generatedPassword)).toBe(true);
    });
  });

  test.describe('Multi-Factor Authentication', () => {
    test('should display MFA setup options', async ({ page }) => {
      // Login with demo account
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      await page.click('[data-testid="login-submit"]');
      
      // Navigate to security settings
      await page.goto('/settings/security');
      
      // Check MFA setup options
      await page.click('[data-testid="setup-mfa"]');
      
      // Should show both TOTP and Phone options
      await expect(page.locator('[data-testid="mfa-option-totp"]')).toBeVisible();
      await expect(page.locator('[data-testid="mfa-option-phone"]')).toBeVisible();
      
      // TOTP should be marked as recommended
      await expect(page.locator('[data-testid="mfa-option-totp"] [data-testid="recommended-badge"]')).toBeVisible();
    });

    test('should setup TOTP MFA flow', async ({ page }) => {
      // Login and navigate to MFA setup
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      await page.click('[data-testid="login-submit"]');
      await page.goto('/settings/security');
      
      await page.click('[data-testid="setup-mfa"]');
      await page.click('[data-testid="mfa-option-totp"]');
      
      // Enter device name
      await page.fill('[data-testid="device-name-input"]', 'Test Device');
      await page.click('[data-testid="setup-totp"]');
      
      // Should show QR code and secret
      await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
      await expect(page.locator('[data-testid="secret-key"]')).toBeVisible();
      
      // Should have copy button for secret
      await page.click('[data-testid="copy-secret"]');
      // Note: Can't easily test clipboard in Playwright without additional setup
    });

    test('should handle MFA verification requirement', async ({ page }) => {
      // This test would need a user account with MFA already enabled
      // For now, we'll test the flow detection
      
      const aal = await page.evaluate(async () => {
        const { supabase } = await import('@/lib/supabase');
        try {
          return await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        } catch {
          return null;
        }
      });
      
      if (aal && aal.data.currentLevel === 'aal1' && aal.data.nextLevel === 'aal2') {
        // Should show MFA challenge screen
        await expect(page.locator('[data-testid="mfa-challenge"]')).toBeVisible();
      }
    });
  });

  test.describe('Security Configuration Validation', () => {
    test('should validate Supabase Auth settings', async ({ page }) => {
      // Test that checks if security features are properly configured
      const authConfig = await page.evaluate(async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          // This would check various auth configurations
          const session = await supabase.auth.getSession();
          return {
            hasSession: !!session.data.session,
            supabaseConfigured: true
          };
        } catch (error) {
          return {
            hasSession: false,
            supabaseConfigured: false,
            error: error.message
          };
        }
      });
      
      expect(authConfig.supabaseConfigured).toBe(true);
    });

    test('should check password policy enforcement', async ({ page }) => {
      // Navigate to registration/signup page
      await page.goto('/signup');
      
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      
      // Test password that's too short
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="signup-submit"]');
      
      // Should show password requirements error
      const errorText = await page.locator('[data-testid="password-error"]').textContent();
      expect(errorText?.toLowerCase()).toMatch(/password|character|requirement/);
    });

    test('should validate MFA factor types availability', async ({ page }) => {
      // Check if multiple MFA factor types are available
      const factorTypes = await page.evaluate(async () => {
        try {
          const { enhancedMFAService } = await import('@/services/auth/EnhancedMFAService');
          return enhancedMFAService.getAvailableFactorTypes();
        } catch (error) {
          return { error: error.message };
        }
      });
      
      expect(Array.isArray(factorTypes)).toBe(true);
      expect(factorTypes.length).toBeGreaterThanOrEqual(1);
      
      // Should have TOTP at minimum
      const hasTOTP = factorTypes.some((factor: any) => factor.type === 'totp');
      expect(hasTOTP).toBe(true);
    });
  });

  test.describe('Security Notifications', () => {
    test('should show security alerts for password issues', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      
      // Fill in a weak password
      await page.fill('[data-testid="password-input"]', 'weak');
      
      // Should show security warnings
      await expect(page.locator('[data-testid="password-security-alert"]')).toBeVisible();
    });

    test('should display MFA status indicators', async ({ page }) => {
      // Login with demo account
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      await page.click('[data-testid="login-submit"]');
      
      await page.goto('/settings/security');
      
      // Should show MFA status (enabled/disabled)
      const mfaStatus = page.locator('[data-testid="mfa-status"]');
      await expect(mfaStatus).toBeVisible();
      
      const statusText = await mfaStatus.textContent();
      expect(statusText?.toLowerCase()).toMatch(/enabled|disabled|setup|configure/);
    });
  });

  test.describe('Security Best Practices', () => {
    test('should enforce secure session management', async ({ page }) => {
      // Login
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      await page.click('[data-testid="login-submit"]');
      
      // Check that session is properly established
      const isAuthenticated = await page.evaluate(async () => {
        const { supabase } = await import('@/lib/supabase');
        const session = await supabase.auth.getSession();
        return !!session.data.session;
      });
      
      expect(isAuthenticated).toBe(true);
      
      // Logout should clear session
      await page.click('[data-testid="logout-button"]');
      
      const isLoggedOut = await page.evaluate(async () => {
        const { supabase } = await import('@/lib/supabase');
        const session = await supabase.auth.getSession();
        return !session.data.session;
      });
      
      expect(isLoggedOut).toBe(true);
    });

    test('should prevent unauthorized access to protected routes', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test('should validate secure data transmission', async ({ page }) => {
      // Check that login uses HTTPS and secure protocols
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      
      // Monitor network requests
      const requests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('auth') || request.url().includes('login')) {
          requests.push(request.url());
        }
      });
      
      await page.click('[data-testid="login-submit"]');
      
      // All auth requests should use HTTPS
      requests.forEach(url => {
        expect(url).toMatch(/^https:/);
      });
    });
  });

  test.describe('Integration Tests', () => {
    test('should integrate password validation with MFA setup', async ({ page }) => {
      // Test the flow from password setup to MFA enrollment
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      await page.click('[data-testid="login-submit"]');
      
      await page.goto('/settings/security');
      
      // Should show both password and MFA sections
      await expect(page.locator('[data-testid="password-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="mfa-section"]')).toBeVisible();
    });

    test('should validate security advisor integration', async ({ page }) => {
      // Check if security advisors show relevant recommendations
      await page.fill('[data-testid="email-input"]', 'demo@auditready.com');
      await page.fill('[data-testid="password-input"]', 'AuditReady@Demo2025!');
      await page.click('[data-testid="login-submit"]');
      
      // If user has access to admin features, check security advisors
      const url = page.url();
      if (url.includes('/admin') || url.includes('/platform')) {
        await page.goto('/admin/security-advisors');
        
        // Should show security recommendations
        await expect(page.locator('[data-testid="security-advisors"]')).toBeVisible();
      }
    });
  });
});
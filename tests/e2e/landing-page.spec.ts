import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/');

    // Check header elements
    await expect(page.getByText('AuditReady')).toBeVisible();
    await expect(page.getByText('About Dev')).toBeVisible();
    await expect(page.getByText('Log in')).toBeVisible();
    await expect(page.getByText('Get Started')).toBeVisible();

    // Check main heading
    await expect(page.getByText('Transform Your Compliance Journey')).toBeVisible();
    
    // Check stats section
    await expect(page.getByText('85%')).toBeVisible();
    await expect(page.getByText('Time Saved on Assessments')).toBeVisible();
    await expect(page.getByText('24/7')).toBeVisible();
    await expect(page.getByText('Continuous Monitoring')).toBeVisible();
  });

  test('should navigate to documentation page', async ({ page }) => {
    await page.goto('/');
    
    // Click on documentation link in footer
    await page.getByText('Documentation').click();
    
    // Should be on documentation page
    await expect(page).toHaveURL('/documentation');
    await expect(page.getByText('AuditReady Documentation')).toBeVisible();
  });

  test('should navigate to onboarding from CTA button', async ({ page }) => {
    await page.goto('/');
    
    // Click main CTA button
    await page.getByRole('button', { name: 'Start Your Journey' }).click();
    
    // Should navigate to onboarding
    await expect(page).toHaveURL('/onboarding');
  });

  test('should display pricing cards', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pricing section
    await page.getByText('Choose Your Plan').scrollIntoViewIfNeeded();
    
    // Check pricing cards are visible
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Team')).toBeVisible();
    await expect(page.getByText('Business')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');
    
    // Check initial theme (should be dark by default)
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    
    // Click theme toggle
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Should switch to light theme
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile navigation
    await expect(page.getByText('AuditReady')).toBeVisible();
    
    // Check that content is properly laid out on mobile
    await expect(page.getByText('Transform Your Compliance Journey')).toBeVisible();
    
    // Check that buttons are accessible
    await expect(page.getByRole('button', { name: 'Start Your Journey' })).toBeVisible();
  });
});
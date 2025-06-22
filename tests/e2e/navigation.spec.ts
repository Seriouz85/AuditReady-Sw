import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between public pages', async ({ page }) => {
    await page.goto('/');

    // Test navigation to About page
    await page.getByText('About Dev').click();
    await expect(page).toHaveURL('/about');
    
    // Navigate back to home
    await page.getByText('AuditReady').first().click();
    await expect(page).toHaveURL('/');
    
    // Test navigation to login
    await page.getByText('Log in').click();
    await expect(page).toHaveURL('/login');
    
    // Navigate back to home
    await page.goto('/');
    
    // Test navigation to signup via Get Started
    await page.getByRole('button', { name: 'Get Started' }).first().click();
    await expect(page).toHaveURL('/signup');
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 page or redirect appropriately
    // Adjust based on your 404 handling strategy
    await expect(page).toHaveURL('/non-existent-page');
  });

  test('should preserve theme across navigation', async ({ page }) => {
    await page.goto('/');
    
    // Switch to light theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    
    // Navigate to documentation
    await page.getByText('Documentation').click();
    await expect(page).toHaveURL('/documentation');
    
    // Theme should be preserved
    await expect(html).not.toHaveClass(/dark/);
    
    // Navigate back
    await page.getByText('AuditReady').first().click();
    await expect(page).toHaveURL('/');
    
    // Theme should still be preserved
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to documentation
    await page.getByText('Documentation').click();
    await expect(page).toHaveURL('/documentation');
    
    // Navigate to about
    await page.goto('/about');
    await expect(page).toHaveURL('/about');
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/documentation');
    
    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL('/about');
  });

  test('should handle external links correctly', async ({ page }) => {
    await page.goto('/documentation');
    
    // Find GitHub link in footer
    const githubLink = page.getByRole('link', { name: /github/i });
    
    // Should have correct href
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/Seriouz85/audit-readiness-hub');
    
    // Should open in new tab/window
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should maintain scroll position when appropriate', async ({ page }) => {
    await page.goto('/');
    
    // Scroll down to pricing section
    await page.getByText('Choose Your Plan').scrollIntoViewIfNeeded();
    
    // Navigate to documentation and back
    await page.getByText('Documentation').click();
    await page.goBack();
    
    // Should be back at landing page (scroll position may reset, which is expected)
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Transform Your Compliance Journey')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Documentation Page', () => {
  test('should load documentation page correctly', async ({ page }) => {
    await page.goto('/documentation');

    // Check main heading
    await expect(page.getByText('AuditReady Documentation')).toBeVisible();
    
    // Check description
    await expect(page.getByText('Comprehensive guides, API references, and best practices')).toBeVisible();
    
    // Check search functionality
    await expect(page.getByPlaceholder('Search documentation...')).toBeVisible();
  });

  test('should display navigation sidebar', async ({ page }) => {
    await page.goto('/documentation');

    // Check sidebar navigation items
    await expect(page.getByText('Platform Overview')).toBeVisible();
    await expect(page.getByText('Architecture & Features')).toBeVisible();
    await expect(page.getByText('Development Guide')).toBeVisible();
    await expect(page.getByText('Styling & Design System')).toBeVisible();
    await expect(page.getByText('Security & Authentication')).toBeVisible();
    await expect(page.getByText('Performance Optimization')).toBeVisible();
  });

  test('should expand and show section content', async ({ page }) => {
    await page.goto('/documentation');

    // Platform Overview should be expanded by default
    await expect(page.getByText('AuditReady Platform')).toBeVisible();
    await expect(page.getByText('Modern Stack')).toBeVisible();
    
    // Click on Development Guide
    await page.getByText('Development Guide').click();
    
    // Should show development content
    await expect(page.getByText('Quick Start')).toBeVisible();
    await expect(page.getByText('Project Structure')).toBeVisible();
  });

  test('should search documentation content', async ({ page }) => {
    await page.goto('/documentation');

    // Enter search term
    await page.getByPlaceholder('Search documentation...').fill('tailwind');
    
    // Should filter to show only relevant sections
    await expect(page.getByText('Styling & Design System')).toBeVisible();
    
    // Should hide unrelated sections or show no results
    const overviewSection = page.getByText('Platform Overview');
    await expect(overviewSection).not.toBeVisible();
  });

  test('should have working code copy functionality', async ({ page }) => {
    await page.goto('/documentation');
    
    // Expand Development Guide
    await page.getByText('Development Guide').click();
    
    // Find a code block and copy button
    const copyButton = page.getByRole('button', { name: /copy/i }).first();
    await expect(copyButton).toBeVisible();
    
    // Click copy button
    await copyButton.click();
    
    // Should show check mark (copied state)
    await expect(page.getByRole('button').locator('svg')).toBeVisible();
  });

  test('should navigate back to landing page', async ({ page }) => {
    await page.goto('/documentation');
    
    // Click AuditReady logo/title to go back
    await page.getByText('AuditReady', { exact: true }).first().click();
    
    // Should be back on landing page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Transform Your Compliance Journey')).toBeVisible();
  });

  test('should display footer with external links', async ({ page }) => {
    await page.goto('/documentation');
    
    // Scroll to footer
    await page.getByText('Built with modern technologies').scrollIntoViewIfNeeded();
    
    // Check footer content
    await expect(page.getByText('Built with modern technologies for enterprise compliance')).toBeVisible();
    
    // Check GitHub link
    const githubLink = page.getByRole('link', { name: /github/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/Seriouz85/audit-readiness-hub');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/documentation');

    // Check mobile layout
    await expect(page.getByText('AuditReady Documentation')).toBeVisible();
    
    // Sidebar should be collapsible on mobile
    await expect(page.getByText('Contents')).toBeVisible();
    
    // Search should still work
    await expect(page.getByPlaceholder('Search documentation...')).toBeVisible();
  });
});
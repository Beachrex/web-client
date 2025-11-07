import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the page title is present
    await expect(page).toHaveTitle(/Beachrex/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have footer navigation', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for footer navigation
    const footer = page.getByRole('navigation', { name: 'Footer' });
    await expect(footer).toBeVisible();
  });
});


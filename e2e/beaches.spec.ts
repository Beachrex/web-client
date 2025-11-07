import { test, expect } from '@playwright/test';

/**
 * Simple Zephyr Integration Test
 *
 * Just 2 tests to verify Zephyr Scale integration works:
 * - One passing test
 * - One failing test
 *
 * IMPORTANT: Create TEST CASES (not Test Cycles) in Zephyr!
 *
 * Steps to create Test Cases:
 * 1. Go to: https://davidtacer.atlassian.net/jira/software/projects/SCRUM
 * 2. Click on "Zephyr Scale" in the left sidebar
 * 3. Click "Test Cases" (NOT "Test Cycles")
 * 4. Click "Create Test Case" button
 * 5. Create 2 test cases:
 *    - Name: "Should load the homepage successfully"
 *    - Name: "Should fail intentionally"
 * 6. After creating, note the Test Case Keys (e.g., SCRUM-T1, SCRUM-T2)
 * 7. Update the test IDs below with just the ID part (e.g., T1, T2)
 *
 * Results should appear in: https://davidtacer.atlassian.net/jira/software/projects/SCRUM
 */

test.describe('Zephyr Integration Test', () => {
  test('[T1] Should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // This should PASS
    await expect(page).toHaveTitle(/Test/i);
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  // test('[T2] Should fail intentionally - FAIL', async ({ page }) => {
  //   await page.goto('/');
  //   await page.waitForLoadState('networkidle');
  //
  //   // This should FAIL intentionally to test Zephyr reporting
  //   await expect(page).toHaveTitle(/This Will Fail/i);
  // });
});


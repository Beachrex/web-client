import { test, expect } from '@playwright/test';

/**
 * Example tests with Zephyr Scale integration
 * 
 * To link tests to Zephyr test cases, include the test case ID in the test title
 * Format: [PROJECT_KEY-NUMBER] Test description
 * Example: [QA-123] Verify login functionality
 * 
 * Replace QA with your actual Jira project key
 */

test.describe('Homepage - Zephyr Integration Example', () => {
  // Example 1: Test with Zephyr test case ID in title
  // Replace [QA-001] with your actual test case ID from Zephyr
  test('[QA-001] Should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is present
    await expect(page).toHaveTitle(/Beachrex/i);
  });

  // Example 2: Test with annotation (alternative method)
  test('Should display hero section', async ({ page }) => {
    // Add Zephyr test case ID as annotation
    test.info().annotations.push({ 
      type: 'testCaseKey', 
      description: 'QA-002' // Replace with your actual test case ID
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  // Example 3: Test without Zephyr ID (will auto-create if autoCreateTestCases is enabled)
  test('Should have footer navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footer = page.getByRole('navigation', { name: 'Footer' });
    await expect(footer).toBeVisible();
  });
});

test.describe('Beach Search - Zephyr Integration Example', () => {
  // Example with multiple test case IDs for the same test
  test('[QA-010] [QA-011] Should allow searching for beaches', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // This test covers multiple test cases in Zephyr
    // Both QA-010 and QA-011 will be updated with the same result
    
    // Add your search test logic here
    // Example:
    // await page.fill('[data-testid="search-input"]', 'Miami Beach');
    // await page.click('[data-testid="search-button"]');
    // await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });
});

/**
 * Tips for Zephyr Integration:
 * 
 * 1. Test Case ID Format:
 *    - Use [PROJECT_KEY-NUMBER] at the start of test title
 *    - Example: [QA-123], [BEACH-456], [TEST-789]
 * 
 * 2. Multiple Test Cases:
 *    - You can link one test to multiple Zephyr test cases
 *    - Example: [QA-001] [QA-002] Test description
 * 
 * 3. Auto-Create Test Cases:
 *    - If autoCreateTestCases is enabled in config, tests without IDs
 *      will automatically create new test cases in Zephyr
 * 
 * 4. Test Organization:
 *    - Use test.describe() to group related tests
 *    - This helps organize test results in Zephyr
 * 
 * 5. Test Data:
 *    - Use data-testid attributes in your components for stable selectors
 *    - This makes tests more maintainable
 */


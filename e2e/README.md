# End-to-End Tests with Playwright

This directory contains end-to-end tests for the Beachrex application using Playwright.

## Running Tests

### Run all tests
```bash
yarn test:e2e
```

### Run tests in UI mode (interactive)
```bash
yarn test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
yarn test:e2e:headed
```

### Run tests in debug mode
```bash
yarn test:e2e:debug
```

### View test report
```bash
yarn test:e2e:report
```

## Writing Tests

Tests are written in TypeScript and use the Playwright Test framework. Each test file should:

1. Be named with the `.spec.ts` extension
2. Import `test` and `expect` from `@playwright/test`
3. Use descriptive test names
4. Follow the Arrange-Act-Assert pattern

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');
    
    // Act
    await page.click('button[type="submit"]');
    
    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project. It includes:

- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, and WebKit
- Automatic dev server startup

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** when testing dynamic content
3. **Use page object models** for complex pages
4. **Keep tests independent** - each test should be able to run in isolation
5. **Use descriptive test names** that explain what is being tested
6. **Group related tests** using `test.describe()`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)


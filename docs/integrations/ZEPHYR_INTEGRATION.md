# 🚀 Zephyr Scale Integration with Playwright

This guide will help you integrate Playwright test results with Zephyr Scale in Jira.

## 📋 Prerequisites

Before you start, make sure you have:

1. ✅ Jira account with Zephyr Scale installed
2. ✅ A Jira project with Zephyr Scale enabled
3. ✅ API access to Zephyr Scale
4. ✅ Playwright tests set up (already done!)

## 🔑 Step 1: Get Your Zephyr Scale API Token

### For Zephyr Scale Cloud:

1. Log in to your Jira instance
2. Go to **Jira Settings** (⚙️ icon) → **Apps** → **Zephyr Scale API Access Tokens**
   - Or navigate directly to: `https://yourdomain.atlassian.net/plugins/servlet/ac/com.kanoah.test-manager/api-access-tokens`
3. Click **"Create API Access Token"**
4. Give it a name (e.g., "Playwright Integration")
5. Copy the generated token (you won't be able to see it again!)

### For Zephyr Scale Server/Data Center:

1. Go to **Jira Settings** → **Apps** → **Zephyr Scale** → **API Tokens**
2. Generate a new token
3. Copy and save it securely

## 🔧 Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.zephyr.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   ZEPHYR_PROJECT_KEY=QA  # Your Jira project key
   ZEPHYR_AUTH_TOKEN=your_actual_token_here
   ```

3. Find your Project Key:
   - Look at your Jira project URL: `https://yourdomain.atlassian.net/jira/software/projects/QA/boards/123`
   - The project key is `QA` in this example

## 📝 Step 3: Enable Zephyr Reporter in Playwright Config

Open `playwright.config.ts` and uncomment the Zephyr reporter section:

```typescript
reporter: [
  ['html'],
  ['list'],
  ['playwright-zephyr/lib/src/cloud', {
    projectKey: process.env.ZEPHYR_PROJECT_KEY || 'YOUR_PROJECT_KEY',
    authorizationToken: process.env.ZEPHYR_AUTH_TOKEN,
    autoCreateTestCases: true,
    testCycle: {
      name: `Automated Test Run - ${new Date().toISOString()}`,
      description: 'Playwright automated test execution',
    },
  }],
],
```

## 🏷️ Step 4: Tag Your Tests with Zephyr Test Case IDs

To link Playwright tests to existing Zephyr test cases, add the test case ID to your test title:

### Option 1: Using Test Case Key in Title

```typescript
import { test, expect } from '@playwright/test';

test('[QA-123] Verify login functionality', async ({ page }) => {
  await page.goto('/login');
  // Your test code here
});
```

### Option 2: Using Test Annotations

```typescript
import { test, expect } from '@playwright/test';

test('Verify login functionality', async ({ page }) => {
  test.info().annotations.push({ type: 'testCaseKey', description: 'QA-123' });
  
  await page.goto('/login');
  // Your test code here
});
```

### Auto-Create Test Cases

If you set `autoCreateTestCases: true` in the config, tests without a Zephyr ID will automatically create new test cases in Zephyr Scale.

## 🎯 Step 5: Run Tests and Send Results to Zephyr

Run your tests normally:

```bash
# Make sure Node.js 20 is active
nvm use 20

# Run tests
yarn test:e2e
```

The results will automatically be sent to Zephyr Scale! 🎉

## 📊 Step 6: View Results in Zephyr Scale

1. Log in to Jira
2. Go to your project
3. Click on **Zephyr Scale** in the left sidebar
4. Navigate to **Test Cycles**
5. You should see a new test cycle with your automated test results

## 🔍 Troubleshooting

### Error: "projectKey must match pattern"

**Solution:** Make sure your project key is in uppercase and contains only letters, numbers, and underscores.

```bash
# ✅ Correct
ZEPHYR_PROJECT_KEY=QA
ZEPHYR_PROJECT_KEY=BEACH_TEST

# ❌ Incorrect
ZEPHYR_PROJECT_KEY=qa
ZEPHYR_PROJECT_KEY=beach-test
```

### Error: "Authentication failed"

**Solution:** 
- Verify your API token is correct
- Make sure the token hasn't expired
- Check that you have the correct permissions in Jira

### Tests not syncing to Zephyr

**Solution:**
- Check the console output for errors
- Verify your `ZEPHYR_PROJECT_KEY` matches your Jira project
- Ensure Zephyr Scale is enabled for your project
- Check that your API token has the necessary permissions

### Error: "Test case not found"

**Solution:**
- If using test case IDs in titles, make sure the test case exists in Zephyr
- Or enable `autoCreateTestCases: true` to automatically create them

## 📚 Advanced Configuration

### Custom Test Cycle Names

You can customize the test cycle name in `playwright.config.ts`:

```typescript
testCycle: {
  name: `E2E Tests - ${process.env.CI ? 'CI' : 'Local'} - ${new Date().toLocaleDateString()}`,
  description: 'Automated Playwright test execution',
  folderId: 'your-folder-id', // Optional: organize cycles in folders
},
```

### Environment-Specific Configuration

Create different configurations for different environments:

```typescript
// playwright.config.ts
const zephyrConfig = process.env.ENABLE_ZEPHYR === 'true' ? [
  ['playwright-zephyr/lib/src/cloud', {
    projectKey: process.env.ZEPHYR_PROJECT_KEY,
    authorizationToken: process.env.ZEPHYR_AUTH_TOKEN,
    autoCreateTestCases: true,
  }]
] : [];

export default defineConfig({
  reporter: [
    ['html'],
    ['list'],
    ...zephyrConfig,
  ],
  // ... rest of config
});
```

Then run with:
```bash
ENABLE_ZEPHYR=true yarn test:e2e
```

## 🎓 Best Practices

1. **Use Descriptive Test Names**: Make test names clear and descriptive
2. **Tag Tests Consistently**: Use a consistent format for test case IDs
3. **Organize Test Cycles**: Use meaningful names and descriptions for test cycles
4. **Review Results**: Regularly check Zephyr Scale for test results and trends
5. **Keep Tokens Secure**: Never commit `.env.local` to version control

## 📖 Additional Resources

- [Playwright Zephyr NPM Package](https://www.npmjs.com/package/playwright-zephyr)
- [Zephyr Scale Documentation](https://support.smartbear.com/zephyr-scale-cloud/docs/)
- [Playwright Documentation](https://playwright.dev/)

## 🆘 Need Help?

If you encounter any issues:
1. Check the error messages in the console
2. Review the Zephyr Scale API documentation
3. Verify your API token and permissions
4. Check the playwright-zephyr package issues on GitHub

---

Happy Testing! 🧪✨


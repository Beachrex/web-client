# GitLab CI Setup for Playwright E2E Tests

This guide explains how to set up and troubleshoot GitLab CI for running Playwright E2E tests with automatic report upload to DigitalOcean Spaces.

---

## Prerequisites

1. **GitLab Repository** with CI/CD enabled
2. **DigitalOcean Spaces** bucket for storing test reports
3. **DigitalOcean Spaces Access Keys** (API credentials)

---

## GitLab CI/CD Variables Setup

### Required Variables

You must set these variables in your GitLab repository:

**Settings → CI/CD → Variables → Add Variable**

| Variable Name | Value | Protected | Masked | Description |
|---------------|-------|-----------|--------|-------------|
| `AWS_ACCESS_KEY_ID` | `DO801YNM9KVVEUN2DD4U` | ❌ | ❌ | DigitalOcean Spaces access key |
| `AWS_SECRET_ACCESS_KEY` | `/R23MDRFs0BShdo4QEYLum1461CYUlhx0t826tIWLVw` | ❌ | ✅ | DigitalOcean Spaces secret key |

**IMPORTANT**: Uncheck "Protect variable" unless you only run tests on protected branches (like `main`). If you're testing on feature branches like `playwright-v2`, the variables MUST be unprotected.

### Optional Variables

These are already set in `.gitlab-ci.yml` but can be overridden:

| Variable Name | Default Value | Description |
|---------------|---------------|-------------|
| `DO_SPACES_BUCKET` | `beachrex-tests` | DigitalOcean Spaces bucket name |
| `DO_SPACES_REGION` | `fra1` | DigitalOcean Spaces region |
| `BASE_URL` | `https://dev.beachrex.com` | Base URL for tests - tests against deployed site instead of starting dev server |
| `BROWSER` | `all` | Browser to test: `all`, `chromium`, `firefox`, or `webkit` |

---

## How to Set Variables in GitLab

### Step-by-Step Instructions

1. **Navigate to your repository** in GitLab
2. Go to **Settings** (left sidebar)
3. Click **CI/CD**
4. Expand **Variables** section
5. Click **Add variable** button
6. Fill in the form:
   - **Key**: `AWS_ACCESS_KEY_ID`
   - **Value**: Your DigitalOcean Spaces access key
   - **Type**: Variable
   - **Environment scope**: All (default)
   - **Protect variable**: ❌ **UNCHECK** (unless you only test on protected branches)
   - **Mask variable**: ❌ Uncheck (access keys can't be masked due to format)
   - **Expand variable reference**: ❌ Uncheck
7. Click **Add variable**
8. Repeat for `AWS_SECRET_ACCESS_KEY`:
   - **Key**: `AWS_SECRET_ACCESS_KEY`
   - **Value**: Your DigitalOcean Spaces secret key
   - **Protect variable**: ❌ **UNCHECK** (unless you only test on protected branches)
   - **Mask variable**: ✅ Check (recommended for secrets)

---

## Running Tests in GitLab CI

### Manual Trigger

The pipeline is configured to run **manually only** (not on every commit).

1. Go to **CI/CD → Pipelines**
2. Click **Run pipeline** button
3. Select the branch (e.g., `main` or `develop`)
4. (Optional) Add custom variables:
   - `BASE_URL`: `https://dev.beachrex.com`
   - `BROWSER`: `chromium`
5. Click **Run pipeline**
6. Click on the pipeline to see progress
7. Click on the `e2e-tests` job to see logs

### What Happens

1. **Setup**: Installs dependencies with Yarn
2. **Test**: Runs Playwright tests
3. **Upload**: Uploads HTML report to DigitalOcean Spaces
4. **Artifacts**: Saves test results and reports for 30 days

---

## Troubleshooting

### Error: "Missing credentials"

**Symptom**: Upload script fails with:
```
❌ Missing credentials!
   AWS_ACCESS_KEY_ID: ❌ Not set
   AWS_SECRET_ACCESS_KEY: ❌ Not set
```

**Solution**:
1. Check that variables are set in **Settings → CI/CD → Variables**
2. Variable names must be **exactly**: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
3. Make sure variables are **not** set to "Protected" if running on unprotected branches
4. Check the debug output in `after_script` section of the job logs

### Error: "AccessDenied" when uploading

**Symptom**: Upload fails with S3 AccessDenied error

**Solution**:
1. Verify the credentials are correct
2. Check that the DigitalOcean Spaces API key has **write permissions**
3. Verify the bucket name is correct: `beachrex-tests`
4. Check that the bucket exists in the `fra1` region

### Error: "Report directory not found"

**Symptom**: Upload script fails with:
```
❌ Report directory not found: playwright-report
```

**Solution**:
1. This means Playwright tests didn't generate a report
2. Check if tests ran successfully in the `script` section
3. Verify `playwright.config.ts` has HTML reporter enabled
4. Check for errors in the test execution logs

### Variables Not Available in after_script

**Symptom**: Debug output shows variables are not set

**Solution**:
GitLab CI variables should be available in all script sections. If they're not:
1. Check variable scope (should be "All" not specific environments)
2. Verify variable names don't have typos
3. Try setting variables at the job level in `.gitlab-ci.yml`:
   ```yaml
   variables:
     AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
     AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
   ```

### Protected Variables on Unprotected Branches

**Symptom**: Variables work on `main` but not on feature branches

**Solution**:
Protected variables are only available on protected branches (e.g., `main`, `production`).

**Option 1**: Unprotect the variables (less secure)
- Edit variable → Uncheck "Protect variable"

**Option 2**: Protect your branch
- Settings → Repository → Protected branches → Add your branch

**Option 3**: Use different variables for different environments
- Create unprotected variables for development: `DEV_AWS_ACCESS_KEY_ID`
- Update `.gitlab-ci.yml` to use different variables based on branch

---

## Viewing Test Reports

### In GitLab UI

1. Go to **CI/CD → Pipelines**
2. Click on the pipeline
3. Click on the `e2e-tests` job
4. Click **Browse** next to artifacts
5. Navigate to `playwright-report/index.html`
6. Click to download and open locally

### Via DigitalOcean Spaces URL

After the upload completes, check the job logs for:
```
✅ Upload complete!

📊 View your report at:
   https://beachrex-tests.fra1.digitaloceanspaces.com/playwright-reports/2025-11-27T16-00-55/index.html

REPORT_URL=https://beachrex-tests.fra1.digitaloceanspaces.com/playwright-reports/2025-11-27T16-00-55/index.html
```

Copy the URL and open it in your browser.

---

## CI/CD Pipeline Configuration

The pipeline is defined in `.gitlab-ci.yml`:

```yaml
stages:
  - test

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.49.1-jammy
  
  rules:
    - when: manual  # Manual trigger only
      allow_failure: true
  
  variables:
    CI: "true"
    DO_SPACES_BUCKET: "beachrex-tests"
    DO_SPACES_REGION: "fra1"
  
  before_script:
    - corepack enable
    - yarn install --frozen-lockfile
  
  script:
    - yarn playwright test
  
  after_script:
    - yarn test:e2e:upload || true  # Upload even if tests fail
  
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 30 days
    reports:
      junit: test-results/junit.xml
```

---

## Local Testing

To test the upload script locally:

```bash
# Make sure .env has the credentials
cat .env | grep AWS

# Run tests
yarn test:e2e

# Upload report
yarn test:e2e:upload
```

---

## Security Best Practices

1. **Never commit credentials** to the repository
2. **Use protected variables** for production credentials
3. **Mask secret keys** in GitLab variables
4. **Rotate credentials** periodically
5. **Use separate credentials** for CI/CD vs. production
6. **Limit bucket permissions** to only what's needed (write to specific prefix)

---

## Next Steps

1. ✅ Set up GitLab CI/CD variables
2. ✅ Run a test pipeline manually
3. ✅ Verify report upload works
4. 🔄 Configure automatic triggers (if needed)
5. 🔄 Set up notifications for failed tests
6. 🔄 Integrate with Jira/Zephyr (optional)

---

## Support

If you encounter issues not covered here:

1. Check the GitLab CI job logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the upload script locally first
4. Check DigitalOcean Spaces console for bucket permissions


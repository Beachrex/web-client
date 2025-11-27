# Quick Fix: GitLab CI Variables Not Working

## The Problem

When you run the GitLab CI pipeline, you get:
```
❌ AWS_SECRET_ACCESS_KEY is not set!
```

Even though you added the variables manually when triggering the pipeline.

---

## The Solution (Do This Once)

### Set Variables in GitLab Repository Settings

Instead of adding variables manually every time, set them **once** in the repository:

1. **Go to**: https://gitlab.com/DavidTacer/front

2. **Navigate**: Settings → CI/CD → Variables → Expand

3. **Add Variable #1**:
   - Click **Add variable**
   - **Key**: `AWS_ACCESS_KEY_ID`
   - **Value**: `DO801YNM9KVVEUN2DD4U`
   - **Protect variable**: ❌ **UNCHECK THIS** (important!)
   - **Mask variable**: ❌ Uncheck
   - Click **Add variable**

4. **Add Variable #2**:
   - Click **Add variable**
   - **Key**: `AWS_SECRET_ACCESS_KEY`
   - **Value**: `/R23MDRFs0BShdo4QEYLum1461CYUlhx0t826tIWLVw`
   - **Protect variable**: ❌ **UNCHECK THIS** (important!)
   - **Mask variable**: ✅ Check
   - Click **Add variable**

### Why Uncheck "Protect variable"?

**Protected variables** only work on **protected branches** (like `main`, `master`).

Since you're testing on the `playwright-v2` branch, which is NOT protected, you must **uncheck "Protect variable"** for both variables.

---

## After Setting Variables

1. **Commit and push** the updated `.gitlab-ci.yml` and `playwright.config.ts` files
2. **Go to**: CI/CD → Pipelines
3. **Click**: Run pipeline
4. **Select branch**: `playwright-v2`
5. **Don't add any variables** - they're already set!
6. **Click**: Run pipeline

The pipeline should now work automatically without needing to enter variables manually.

---

## What Changed

### 1. `.gitlab-ci.yml`
- Added `BASE_URL: "https://dev.beachrex.com"` to test against deployed site
- This avoids the timeout error from trying to start a dev server in CI

### 2. `playwright.config.ts`
- Updated to use `BASE_URL` environment variable
- Only starts dev server if `BASE_URL` is not provided
- Increased timeout to 2 minutes for CI environments

### 3. Better Error Messages
- The upload script now shows exactly which credentials are missing
- Debug output in GitLab CI logs shows credential status

---

## Verification

After running the pipeline, check the logs for:

```
Checking AWS credentials...
✅ AWS_ACCESS_KEY_ID is set (length: 21)
✅ AWS_SECRET_ACCESS_KEY is set (length: 44)
```

Both should show ✅ now.

---

## Common Mistakes

❌ **Adding variables manually when triggering** - Don't do this anymore
❌ **Checking "Protect variable"** - Uncheck for non-protected branches
❌ **Typos in variable names** - Must be exact: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
❌ **Wrong scope** - Should be "All" not specific environments

---

## Still Not Working?

If you still see the error after setting variables in repository settings:

1. **Double-check variable names** - They're case-sensitive
2. **Check "Protect variable" is unchecked** - This is the most common issue
3. **Try on `main` branch** - If it works there, it's a protected variable issue
4. **Check the debug output** in the job logs under `after_script`

---

## Testing Locally

To test the upload script locally:

```bash
# Make sure .env has the credentials
cat .env | grep AWS

# Run tests
yarn test:e2e

# Upload report
yarn test:e2e:upload
```

This should work without any changes since your local `.env` file already has the credentials.


# GitLab E2E Test Trigger Examples

Quick reference for triggering E2E tests via GitLab API.

## Basic Setup

```bash
GITLAB_TOKEN="<GITLAB_TRIGGER_TOKEN>"
GITLAB_PROJECT_ID="61956481"
GITLAB_API="https://gitlab.com/api/v4/projects/$GITLAB_PROJECT_ID/trigger/pipeline"
```

---

## 1. Run All Tests (Default)

```bash
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  "$GITLAB_API"
```

**What runs**: All tests on all browsers (chromium, firefox, webkit) against `https://dev.beachrex.com`

---

## 2. Test Different Environment

```bash
# Staging
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BASE_URL]=https://staging.beachrex.com" \
  "$GITLAB_API"

# Production
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BASE_URL]=https://beachrex.com" \
  "$GITLAB_API"
```

---

## 3. Test Specific Browser

```bash
# Chromium only
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BROWSER]=chromium" \
  "$GITLAB_API"

# Firefox only
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BROWSER]=firefox" \
  "$GITLAB_API"

# WebKit only
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BROWSER]=webkit" \
  "$GITLAB_API"
```

---

## 4. Run Specific Test File

```bash
# Single test file
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/home.spec.ts" \
  "$GITLAB_API"

# Another example
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/beach-detail.spec.ts" \
  "$GITLAB_API"
```

---

## 5. Run All Tests in Folder

```bash
# All auth tests
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/auth/" \
  "$GITLAB_API"

# All API tests
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/api/" \
  "$GITLAB_API"
```

---

## 6. Run Tests Matching Pattern (Grep)

```bash
# All tests with "login" in the name
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=-g 'login'" \
  "$GITLAB_API"

# All tests with "hero" in the name
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=-g 'hero'" \
  "$GITLAB_API"

# All tests with "search" in the name
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=-g 'search'" \
  "$GITLAB_API"
```

---

## 7. Combine Multiple Filters

```bash
# Specific file + pattern
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/home.spec.ts -g 'hero'" \
  "$GITLAB_API"

# Specific browser + specific file
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BROWSER]=chromium" \
  --form "variables[TEST_FILTER]=tests/home.spec.ts" \
  "$GITLAB_API"

# Environment + browser + pattern
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BASE_URL]=https://staging.beachrex.com" \
  --form "variables[BROWSER]=firefox" \
  --form "variables[TEST_FILTER]=-g 'login'" \
  "$GITLAB_API"

# All filters combined
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BASE_URL]=https://staging.beachrex.com" \
  --form "variables[BROWSER]=chromium" \
  --form "variables[TEST_FILTER]=tests/auth/login.spec.ts -g 'successful'" \
  "$GITLAB_API"
```

---

## 8. Real-World Use Cases

### After Deploying to Staging
```bash
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BASE_URL]=https://staging.beachrex.com" \
  "$GITLAB_API"
```

### Quick Smoke Test (Critical Paths Only)
```bash
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[BROWSER]=chromium" \
  --form "variables[TEST_FILTER]=-g 'smoke'" \
  "$GITLAB_API"
```

### Test Specific Feature After Fix
```bash
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/beach-search.spec.ts" \
  "$GITLAB_API"
```

### Cross-Browser Test for Critical Feature
```bash
curl -X POST \
  --fail \
  --form token=$GITLAB_TOKEN \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/checkout.spec.ts" \
  "$GITLAB_API"
```

---

## Available Variables Reference

| Variable | Description | Examples |
|----------|-------------|----------|
| `BASE_URL` | Environment to test | `https://dev.beachrex.com`<br>`https://staging.beachrex.com`<br>`https://beachrex.com` |
| `BROWSER` | Browser to use | `chromium`<br>`firefox`<br>`webkit`<br>`all` (default) |
| `TEST_FILTER` | Which tests to run | `tests/home.spec.ts` (file)<br>`tests/auth/` (folder)<br>`-g 'login'` (pattern)<br>`tests/home.spec.ts -g 'hero'` (combined) |

---

## Tips

1. **Use specific browsers for faster feedback**:
   ```bash
   --form "variables[BROWSER]=chromium"
   ```

2. **Use grep patterns for test suites**:
   ```bash
   --form "variables[TEST_FILTER]=-g 'smoke'"
   --form "variables[TEST_FILTER]=-g 'critical'"
   --form "variables[TEST_FILTER]=-g '@regression'"
   ```

3. **Test specific features after deployment**:
   ```bash
   --form "variables[TEST_FILTER]=tests/new-feature/"
   ```

4. **Combine for targeted testing**:
   ```bash
   --form "variables[BROWSER]=chromium" \
   --form "variables[TEST_FILTER]=tests/checkout.spec.ts"
   ```

---

## Viewing Results

After triggering, you'll get a response with:
```json
{
  "id": 123456,
  "web_url": "https://gitlab.com/your-project/-/pipelines/123456"
}
```

1. **View pipeline**: Open the `web_url`
2. **Check logs**: Click on `e2e-tests` job
3. **Get report URL**: Look for the DigitalOcean Spaces URL in logs:
   ```
   https://beachrex-tests.fra1.digitaloceanspaces.com/playwright-reports/2025-11-27T20-10-10/index.html
   ```
4. **Download artifacts**: Click "Browse" button in job page

---

## Troubleshooting

### No tests run
- Check `TEST_FILTER` path is correct
- Verify file/folder exists in repository
- Check grep pattern matches test names

### All browsers run despite BROWSER variable
- Make sure variable name is exactly `BROWSER` (case-sensitive)
- Check value is one of: `chromium`, `firefox`, `webkit`

### Tests fail to start
- Verify `BASE_URL` is accessible
- Check GitLab CI/CD variables are set (AWS credentials)
- Review job logs for errors


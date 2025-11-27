# Frontend Development Handoff

This document summarizes recent changes made to the Beachrex frontend application.

---

## 1. CDN Image Path Updates

### Background
The backend API was updated to return **relative paths** instead of full CDN URLs for all media. Previously, the API returned full URLs like:
```
https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-6-o-hvar/hr-6-o-hvar-sl3.jpg
```

Now it returns only relative paths:
```
img/beaches/hr-6-o-hvar/hr-6-o-hvar-sl3.jpg
```

### Frontend Changes Required
The frontend must now prepend the CDN endpoint and use `encodeCdnImagePath()` to properly encode non-ASCII characters (e.g., Croatian characters like 'č', 'ž', 'š').

### Pattern to Use
```typescript
import { env } from '@/env';
import { encodeCdnImagePath } from '@/lib/utils/beach-images';

// For any image URL from the API:
const imageUrl = `${env.NEXT_PUBLIC_CDN_ENDPOINT}${encodeCdnImagePath(apiImagePath)}`;
```

### Files Updated
| File | Changes |
|------|---------|
| `src/app/[locale]/page.tsx` | Added `buildCdnUrl` helper, fixed mapImageUrl, beachViewsItems, accommodationImages, featuredItems |
| `src/components/Home/HeroSection.tsx` | Fixed backgroundImage URL from hero banner media |
| `src/components/IslandPage/IslandSearchBeaches.tsx` | Fixed `country.image_path` |
| `src/components/WorldPage/WorldSearchBeaches.tsx` | Fixed `country.image_path` |
| `src/app/[locale]/beaches/[continent]/page.tsx` | Replaced hardcoded CDN URL with dynamic URL using `country.image_path` |
| `src/components/Beach/BeachDetails/beachDetailsSection.tsx` | Fixed TypeScript type assertions |

### Files Already Correctly Implemented
- `src/components/CountryPage/CountrySearchBeaches.tsx`
- `src/components/CityPage/citySearchBeaches.tsx`
- `src/components/regions/RegionSearchBeaches.tsx`
- `src/components/Continent/SearchBeach.tsx`
- `src/components/DestinationCard.tsx`
- `src/components/Beach/BeachPageView.tsx`
- `src/components/PropertyCard/DynamicPropertyCard.tsx`

---

## 2. Playwright E2E Testing with DigitalOcean Report Upload

### Overview
Implemented automatic upload of Playwright HTML test reports to DigitalOcean Spaces for easy sharing and CI/CD integration.

### New Files Created

#### `scripts/upload-playwright-report.mjs`
A Node.js script that uploads the `playwright-report/` directory to DigitalOcean Spaces using the AWS SDK (S3-compatible API).

Features:
- Loads credentials from `.env` file automatically
- Uploads all files with correct MIME types
- Sets files as `public-read` for easy access
- Generates timestamped folder names (e.g., `playwright-reports/2025-11-27T15-36-02`)
- Outputs the report URL at the end

### Configuration Changes

#### `playwright.config.ts`
```typescript
reporter: [
    ['html', { open: 'never' }],  // Changed: prevents local browser opening
    ['list'],
],
```

#### `package.json` Scripts
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:upload": "node scripts/upload-playwright-report.mjs",
    "test:e2e:ci": "playwright test; yarn test:e2e:upload"
  }
}
```

### Dependencies Added
```json
{
  "devDependencies": {
    "@aws-sdk/client-s3": "^3.940.0",
    "mime-types": "^3.0.2"
  }
}
```

### Environment Variables Required

Add these to your `.env` file:

```bash
# DigitalOcean Spaces credentials (for AWS CLI compatible SDK)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Optional: customize bucket and region (defaults shown)
DO_SPACES_BUCKET=beachrex-tests
DO_SPACES_REGION=fra1
```

### Usage

#### Run tests locally (opens report in browser)
```bash
yarn test:e2e
```

#### Run tests and upload report to DigitalOcean (CI mode)
```bash
yarn test:e2e:ci
```

This will:
1. Run all Playwright tests
2. Generate HTML report (without opening browser)
3. Upload report to DigitalOcean Spaces
4. Print the report URL

#### Upload existing report only
```bash
yarn test:e2e:upload
```

#### View local report
```bash
yarn test:e2e:report
```

### Report URL Format
Reports are uploaded to:
```
https://beachrex-tests.fra1.digitaloceanspaces.com/playwright-reports/{timestamp}/index.html
```

Example:
```
https://beachrex-tests.fra1.digitaloceanspaces.com/playwright-reports/2025-11-27T16-00-55/index.html
```

### Notes
- The `;` separator in `test:e2e:ci` ensures the upload runs even if tests fail (you still want to see the report!)
- The `{ open: 'never' }` option prevents Playwright from opening the HTML report locally after tests
- Reports are publicly accessible via the URL (ACL: public-read)

---

## 3. GitLab CI/CD Integration

### Overview
Automated E2E testing in GitLab CI with test report upload to DigitalOcean Spaces.

### Configuration Files

#### `.gitlab-ci.yml`
```yaml
stages:
  - test

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.56.1-jammy

  rules:
    - when: manual
      allow_failure: true

  variables:
    CI: "true"
    BASE_URL: "https://dev.beachrex.com"
    DO_SPACES_BUCKET: "beachrex-tests"
    DO_SPACES_REGION: "fra1"
```

**Important**: Docker image version must match `@playwright/test` version in `package.json`.

#### `playwright.config.ts`
- Uses `BASE_URL` environment variable when set (for CI)
- Only starts local dev server if `BASE_URL` is not provided
- Increased webServer timeout to 120 seconds for CI environments
- Configured reporters: HTML, list, and JUnit (for GitLab integration)

### GitLab CI/CD Variables Setup

**Required**: Set these in GitLab repository settings (Settings → CI/CD → Variables):

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `AWS_ACCESS_KEY_ID` | Your DO Spaces access key | ❌ No | ❌ No |
| `AWS_SECRET_ACCESS_KEY` | Your DO Spaces secret key | ❌ No | ✅ Yes |
| `DO_SPACES_BUCKET` | `beachrex-tests` | ❌ No | ❌ No |
| `DO_SPACES_REGION` | `fra1` | ❌ No | ❌ No |

**Important**: Uncheck "Protect variable" to allow tests on non-protected branches (like feature branches).

### Running Tests in GitLab CI

1. Go to **CI/CD → Pipelines**
2. Click **Run pipeline**
3. Select branch (e.g., `main`, `playwright-v2`)
4. (Optional) Override variables:
   - `BASE_URL`: Test against different environment
   - `BROWSER`: `chromium`, `firefox`, `webkit`, or `all`
5. Click **Run pipeline**

### Pipeline Behavior

- **Manual trigger only** - Won't run automatically on commits
- **Tests run** against deployed site (`BASE_URL`)
- **Report uploads** to DigitalOcean Spaces (even if tests fail)
- **Artifacts saved** in GitLab for 30 days
- **JUnit report** integrated with GitLab test results

### Report Access

After pipeline completes, find the report URL in job logs:
```
https://beachrex-tests.fra1.digitaloceanspaces.com/playwright-reports/{timestamp}/index.html
```

Or download artifacts from GitLab UI: **CI/CD → Pipelines → Job → Browse artifacts**

### Troubleshooting GitLab CI

**"Missing credentials" error**:
- Verify variables are set in Settings → CI/CD → Variables
- Ensure "Protect variable" is **unchecked** for non-protected branches
- Check variable names are exact: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

**"Playwright version mismatch" error**:
- Update Docker image in `.gitlab-ci.yml` to match `@playwright/test` version in `package.json`
- Example: `mcr.microsoft.com/playwright:v1.56.1-jammy`

**"Webserver timeout" error**:
- Ensure `BASE_URL` is set to test against deployed site
- Don't try to start dev server in CI (too slow)

**"Job failed: exit code 1" (but upload succeeded)**:
- This is normal when tests fail
- The upload still completes successfully
- Check the report URL to see which tests failed

---

## 4. Zephyr Scale Integration (Optional)

Zephyr Scale integration for Jira is configured but currently disabled. To enable:

1. Uncomment the Zephyr reporter in `playwright.config.ts`
2. Set environment variables:
   ```bash
   ZEPHYR_PROJECT_KEY=YOUR_PROJECT_KEY
   ZEPHYR_AUTH_TOKEN=your_api_token
   ```

See `ZEPHYR_INTEGRATION.md` for detailed setup instructions.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `yarn test:e2e` | Run tests locally |
| `yarn test:e2e:ui` | Run tests in interactive UI mode |
| `yarn test:e2e:headed` | Run tests with visible browser |
| `yarn test:e2e:debug` | Run tests in debug mode |
| `yarn test:e2e:report` | Open local HTML report |
| `yarn test:e2e:upload` | Upload report to DigitalOcean |
| `yarn test:e2e:ci` | Run tests + upload report (for CI) |

---

## Troubleshooting Local Development

### Upload fails with "Missing credentials"
Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in your `.env` file.

### Upload fails with "AccessDenied"
Check that the credentials have write access to the DigitalOcean Spaces bucket.

### Report not found after upload
Verify `DO_SPACES_BUCKET` is set correctly (default: `beachrex-tests`).

### Tests fail but upload doesn't run
This shouldn't happen with the current setup (uses `;` instead of `&&`). If it does, run `yarn test:e2e:upload` manually.

---

## Summary of Changes

### Files Modified
- `.gitlab-ci.yml` - GitLab CI/CD pipeline configuration
- `playwright.config.ts` - Dynamic BASE_URL and conditional webServer
- `scripts/upload-playwright-report.mjs` - Upload script with better error messages

### Files Created
- `scripts/upload-playwright-report.mjs` - DigitalOcean Spaces upload script

### Dependencies Added
- `@aws-sdk/client-s3` - For uploading to DigitalOcean Spaces
- `mime-types` - For setting correct content types

### Environment Variables
**Local (.env)**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DO_SPACES_BUCKET`
- `DO_SPACES_REGION`

**GitLab CI/CD Variables** (Settings → CI/CD → Variables):
- `AWS_ACCESS_KEY_ID` (unprotected)
- `AWS_SECRET_ACCESS_KEY` (unprotected, masked)
- `DO_SPACES_BUCKET` (unprotected)
- `DO_SPACES_REGION` (unprotected)


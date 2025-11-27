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

## 3. Zephyr Scale Integration (Optional)

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

## Troubleshooting

### Upload fails with "Missing credentials"
Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in your `.env` file.

### Upload fails with "AccessDenied"
Check that the credentials have write access to the DigitalOcean Spaces bucket.

### Report not found after upload
Verify `DO_SPACES_BUCKET` is set correctly (default: `beachrex-tests`).

### Tests fail but upload doesn't run
This shouldn't happen with the current setup (uses `;` instead of `&&`). If it does, run `yarn test:e2e:upload` manually.


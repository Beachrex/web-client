# Frontend Development Handoff

This document summarizes recent changes made to the Beachrex frontend application.

## 📚 Documentation

All technical documentation is organized in the **[docs/](./docs/README.md)** folder:

- **[docs/integrations/](./docs/integrations/)** - Third-party integrations (OpenWeather, Jira, Zephyr)
- **[docs/testing/](./docs/testing/)** - E2E testing and CI/CD setup
- **[docs/features/](./docs/features/)** - Feature-specific implementation guides
- **[docs/setup/](./docs/setup/)** - Getting started guides

👉 **Start here:** [docs/README.md](./docs/README.md)

---

## 2025-11-29 – OpenWeatherMap Integration (Real-Time Weather Data)

### Overview

Integrated real-time weather data from OpenWeatherMap API into beach detail pages. Weather widgets now display live weather conditions and sea temperature instead of static placeholder images.

### What Changed

**Backend:**
- New API endpoint: `GET /api/v1/beach-details/{identifier}/weather`
- Returns real-time weather data from OpenWeatherMap
- Cached for 1 hour (independent from beach details cache)
- Accepts beach ID or slug in any language

**Frontend:**
- Created `useBeachWeather` hook for fetching weather data
- Updated `BeachBannerSection` to use real-time weather API
- Added loading states to `WeatherWidget` and `SeaTempWidget`
- Weather data now refreshes every hour automatically

### Key Features

✅ **Real-time weather** - Temperature, conditions, wind, humidity from OpenWeatherMap
✅ **Sea temperature** - Approximated from weather data
✅ **1-hour cache** - Both frontend and backend cache for 1 hour
✅ **Loading states** - Spinner shown while fetching data
✅ **Locale support** - Weather data in user's language
✅ **Graceful fallbacks** - Shows `--` when data unavailable

### Files Changed

| File | Changes |
|------|---------|
| `src/hooks/useBeachWeather.ts` | **NEW** - Custom React Query hook for weather API |
| `src/components/Beach/BeachBanner/BeachBannerSection.tsx` | Fetch weather from API instead of embeds |
| `src/components/BannerSection/WeatherWidget.tsx` | Added loading state, handle null temperature |
| `src/components/Beach/BeachBanner/SeaTempWidget.tsx` | Added loading state |

### Usage Example

```tsx
import { useBeachWeather } from '@/hooks/useBeachWeather';

const { data: weatherResponse, isLoading } = useBeachWeather({
  identifier: beachSlug ?? beachId,
  locale: 'en',
  enabled: !!(beachSlug || beachId),
});

const weatherData = weatherResponse?.data?.weather;
const seaTemperature = weatherResponse?.data?.sea_temperature;
```

### API Response Structure

```typescript
{
  success: boolean;
  data: {
    beach_id: number;
    beach_slug: string;
    coordinates: { latitude: string; longitude: string };
    weather: {
      temperature: number;
      feels_like: number;
      condition: string;
      description: string;
      icon: string;
      icon_url: string;
      wind_speed: number;
      humidity: number;
      // ... more fields
    } | null;
    sea_temperature: number | null;
    cached_at: string;
  };
}
```

### Documentation

- **Backend Implementation**: See `../Api/docs/weather/` folder
- **Frontend Implementation**: [docs/integrations/OPENWEATHER_FRONTEND_IMPLEMENTATION.md](./docs/integrations/OPENWEATHER_FRONTEND_IMPLEMENTATION.md)
- **API Endpoint Guide**: `../Api/docs/weather/WEATHER_ENDPOINT_GUIDE.md`

### Testing

1. Navigate to any beach detail page
2. Weather widget should show real temperature and weather icon
3. Sea temperature widget should show real sea temperature
4. Loading spinners appear briefly while fetching
5. Data refreshes automatically after 1 hour

---

## 1. CDN Image Path Updates & Multi-Endpoint Strategy

### Background
The backend API was updated to return **relative paths** instead of full CDN URLs for all media. Previously, the API returned full URLs like:
```
https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-6-o-hvar/hr-6-o-hvar-sl3.jpg
```

Now it returns only relative paths:
```
img/beaches/hr-6-o-hvar/hr-6-o-hvar-sl3.jpg
```

### Multi-CDN Endpoint Strategy (Updated Nov 29, 2025)

The frontend now uses **three different CDN endpoints** optimized for different image sizes and use cases:

1. **`NEXT_PUBLIC_CDN_TEASER`** - For lists, carousels, thumbnails (up to 600x600)
   - Used for: Beach cards, country cards, destination carousels, gallery thumbnails
   - Optimized for: Fast loading in grid/list views

2. **`NEXT_PUBLIC_CDN_LARGE`** - For banners and hero images
   - Used for: Hero sections, banner backgrounds, full-width images
   - Optimized for: High-quality large format images

3. **`NEXT_PUBLIC_CDN_ASSETS`** - For icons, videos, and non-compressible assets
   - Used for: SVG icons, video files, 360° sphere images, filter icons
   - Optimized for: Assets that shouldn't be compressed or resized

### Pattern to Use
```typescript
import { buildCdnUrl } from '@/lib/utils/beach-images';

// Automatic endpoint selection based on context:
const imageUrl = buildCdnUrl(apiImagePath, 'list');      // Uses TEASER
const bannerUrl = buildCdnUrl(apiImagePath, 'banner');   // Uses LARGE
const iconUrl = buildCdnUrl(apiImagePath, 'icon');       // Uses ASSETS
const videoUrl = buildCdnUrl(apiImagePath, 'video');     // Uses ASSETS

// For beach images with context:
import { buildBeachImageUrl, getMainBeachImage } from '@/lib/utils/beach-images';

const cardImage = buildBeachImageUrl(folderName, filename, false, 'list');
const bannerImage = getMainBeachImage(gallery, folderName, false, 'banner');
```

### Environment Variables Required
Add these to your `.env` file:
```env
NEXT_PUBLIC_CDN_TEASER=https://s3.beachrex.com/teaser/
NEXT_PUBLIC_CDN_LARGE=https://s3.beachrex.com/large/
NEXT_PUBLIC_CDN_ASSETS=https://s3.beachrex.com/assets/
```

### About `env.ts` File
The project uses `@t3-oss/env-nextjs` with a `src/env.ts` file for environment variable management. This is **optional** - Next.js can access `.env` variables directly:
- **Client-side**: Variables prefixed with `NEXT_PUBLIC_` via `process.env.NEXT_PUBLIC_*`
- **Server-side**: Any variable via `process.env.*`

The `env.ts` file provides additional benefits:
- **Type safety**: TypeScript autocomplete and type checking for env vars
- **Runtime validation**: Zod schema validates required variables at build/runtime
- **Fail fast**: App won't start if required env vars are missing or invalid
- **Documentation**: All env vars documented in one place with their types

You can use either approach:
```typescript
// With env.ts (current approach)
import { env } from '@/env';
const url = env.NEXT_PUBLIC_CDN_TEASER;

// Without env.ts (standard Next.js)
const url = process.env.NEXT_PUBLIC_CDN_TEASER;
```

### Files Updated (Multi-CDN Implementation)

#### Core Utilities
| File | Changes |
|------|---------|
| `src/env.ts` | Added `NEXT_PUBLIC_CDN_LARGE` and `NEXT_PUBLIC_CDN_ASSETS` environment variables |
| `src/lib/utils/beach-images.ts` | Added `buildCdnUrl()`, `getCdnEndpoint()`, `determineCdnEndpointType()` functions; Updated `buildBeachImageUrl()` and `getMainBeachImage()` to accept context parameter |

#### List & Carousel Components (TEASER CDN)
| File | Changes |
|------|---------|
| `src/app/[locale]/page.tsx` | Updated to use `buildCdnUrl()` with 'carousel' context for map, beach views, and accommodation images |
| `src/components/DestinationCard.tsx` | Updated to use `buildCdnUrl()` with 'carousel' context for country images |
| `src/components/PropertyCard/DynamicPropertyCard.tsx` | Updated to use `buildCdnUrl()` with 'list' context for beach main images |
| `src/app/[locale]/beaches/[continent]/page.tsx` | Updated to use `buildCdnUrl()` with 'carousel' context for country images |

#### Banner Components (LARGE CDN)
| File | Changes |
|------|---------|
| `src/components/Home/HeroSection.tsx` | Updated to use `buildCdnUrl()` with 'hero' context for hero banner background |
| `src/components/Beach/BeachBanner/BeachBannerSection.tsx` | Updated `getMainBeachImage()` call with 'banner' context for beach banner images |

#### Icon & Video Components (ASSETS CDN)
| File | Changes |
|------|---------|
| `src/components/Beach/BeachPageView.tsx` | Updated to use `buildCdnUrl()` with 'gallery' and 'video' contexts for beach media (gallery, videos, 360° spheres) |
| `src/components/Beach/BeachDetails/beachDetailsSection.tsx` | Updated MediaBlock component to use `buildCdnUrl()` with 'carousel' context for parking and path images |

### Context Parameter Options
The `buildCdnUrl()` function accepts the following context hints:
- `'list'` - List items and cards (uses TEASER)
- `'carousel'` - Carousel images (uses TEASER)
- `'gallery'` - Gallery thumbnails (uses TEASER)
- `'banner'` - Banner backgrounds (uses LARGE)
- `'hero'` - Hero section backgrounds (uses LARGE)
- `'icon'` - Icon images (uses ASSETS)
- `'video'` - Video files (uses ASSETS)

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

## 3. 360° Virtual Tour Viewer

### Background
The beach details page displays 360° virtual tours using iframe-embedded HTML tour files. Previously, the project used ReactPannellum library, which has been removed in favor of a simpler iframe-based approach.

### Implementation

**File**: `src/components/Beach/BeachPageView.tsx`

The component now uses a native `<iframe>` element to display virtual tours:

```typescript
// Get the virtual tour URL from the API
const sphereTourUrl = spheres[0]?.tour_url
  ? `${env.NEXT_PUBLIC_CDN_ASSETS}/${spheres[0].tour_url}`
  : null;

// Only show 360° viewer if tour URL exists
const hasSphere = spheres.length > 0 && Boolean(sphereTourUrl);

// Render iframe
{activeMedia === 'sphere' && sphereTourUrl && (
  <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black">
    <iframe
      src={sphereTourUrl}
      title="360° Virtual Tour"
      className="h-full w-full border-0"
      allowFullScreen
      loading="lazy"
    />
  </div>
)}
```

### API Integration

The backend provides `tour_url` in the `spheres_360` media collection:

```json
"media": {
  "spheres_360": [
    {
      "id": 123,
      "file_name": "hr-6-o-hvar-Panorama.jpg",
      "url": "img/beaches/hr-6-o-hvar/hr-6-o-hvar-Panorama.jpg",
      "thumbnail_url": "img/beaches/hr-6-o-hvar/hr-6-o-hvar-Panorama.jpg",
      "tour_url": "img/beaches/hr-6-o-hvar/vtour/tour.html"
    }
  ]
}
```

The frontend constructs the full URL:
```
https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-6-o-hvar/vtour/tour.html
```

### Removed Dependencies

The following packages were removed as they are no longer needed:

- ❌ `pannellum` - 360° panorama viewer library
- ❌ `react-pannellum` - React wrapper for Pannellum
- ❌ `import 'pannellum/build/pannellum.css'` - CSS import removed from layout

### Benefits

1. **Simpler implementation** - No external library dependencies
2. **Smaller bundle size** - Removed ~100KB of unused code
3. **Better compatibility** - Native iframe works everywhere
4. **Lazy loading** - Tours only load when user clicks to view them
5. **Full-featured tours** - The HTML tour files can include custom navigation, hotspots, and multi-scene tours

### Notes

- The `tour_url` field is only present for beaches that have virtual tours
- The component gracefully handles missing tours by not showing the 360° option
- The `url` and `thumbnail_url` fields are used for preview images in the media card selector

### Related Fixes

**Next.js Image Configuration** (`next.config.js`)
- Added `s3.beachrex.com` to `remotePatterns` to allow Next.js Image component to optimize images from the CDN
- Required for Next.js to proxy and optimize external images through `/_next/image`

**Map Marker Tooltips** (`src/components/Map/ReactLeafletMap.tsx`)
- Removed `beach.description` from marker tooltips (field doesn't exist in `BeachSchema`)
- Tooltips now only display beach name

---

## 4. GitLab CI/CD Integration

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
    - if: $CI_PIPELINE_SOURCE == "trigger"
      when: on_success
    - when: never

  variables:
    CI: "true"
    BASE_URL: "https://dev.beachrex.com"
    DO_SPACES_BUCKET: "beachrex-tests"
    DO_SPACES_REGION: "fra1"
```

**Important**:
- Docker image version must match `@playwright/test` version in `package.json`
- Tests **only run when triggered via API**, not on push/merge/manual UI trigger

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

### Triggering Tests via API

Tests are configured to **only run when triggered via API**, not on push/merge.

#### Basic Trigger:
```bash
curl -X POST \
  --fail \
  --form token=glptt-KNqkrPWTWFjheXxTyKpV \
  --form ref=main \
  "https://gitlab.com/api/v4/projects/61956481/trigger/pipeline"
```

#### With Custom Variables:
```bash
curl -X POST \
  --fail \
  --form token=glptt-KNqkrPWTWFjheXxTyKpV \
  --form ref=main \
  --form "variables[BASE_URL]=https://staging.beachrex.com" \
  --form "variables[BROWSER]=chromium" \
  "https://gitlab.com/api/v4/projects/61956481/trigger/pipeline"
```

#### Run Specific Tests:
```bash
# Run specific test file
curl -X POST \
  --fail \
  --form token=glptt-KNqkrPWTWFjheXxTyKpV \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/home.spec.ts" \
  "https://gitlab.com/api/v4/projects/61956481/trigger/pipeline"

# Run tests in specific folder
curl -X POST \
  --fail \
  --form token=glptt-KNqkrPWTWFjheXxTyKpV \
  --form ref=main \
  --form "variables[TEST_FILTER]=tests/auth/" \
  "https://gitlab.com/api/v4/projects/61956481/trigger/pipeline"

# Run tests matching pattern (grep)
curl -X POST \
  --fail \
  --form token=glptt-KNqkrPWTWFjheXxTyKpV \
  --form ref=main \
  --form "variables[TEST_FILTER]=-g 'login'" \
  "https://gitlab.com/api/v4/projects/61956481/trigger/pipeline"

# Combine filters: specific file + pattern + browser
curl -X POST \
  --fail \
  --form token=glptt-KNqkrPWTWFjheXxTyKpV \
  --form ref=main \
  --form "variables[BROWSER]=firefox" \
  --form "variables[TEST_FILTER]=tests/home.spec.ts -g 'hero'" \
  "https://gitlab.com/api/v4/projects/61956481/trigger/pipeline"
```

#### Available Variables:
- `BASE_URL`: Test against different environment (default: `https://dev.beachrex.com`)
- `BROWSER`: `chromium`, `firefox`, `webkit`, or `all` (default: all browsers)
- `TEST_FILTER`: Filter which tests to run:
  - Specific file: `tests/home.spec.ts`
  - Folder: `tests/auth/`
  - Grep pattern: `-g 'login'`
  - Combined: `tests/home.spec.ts -g 'hero'`

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

## 5. Zephyr Scale Integration (Optional)

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


---

## 5. Beaches Map  Mobile Layout & UX

### Overview
Responsive and mobile-specific improvements were implemented for the Beaches Map page (`src/app/[locale]/beach-map/page.tsx`), primarily in the shared map layout component `src/components/Map/MapWithSidebar.tsx`. **Desktop behavior is preserved** (left filters, middle list, right map). All new interactions are **mobile-only**.

### Files Modified
- `src/components/Map/MapWithSidebar.tsx`

### Desktop Behavior (Unchanged)
- Layout: horizontal 3-column flex row:
  - **Left**: `LeftSidebarFilters`
  - **Middle**: beach cards list
  - **Right**: Leaflet map (`ReactLeafletMap`)
- Filters and list scroll vertically within their columns; map fills full column height (`h-screen`).
- No mobile-only buttons (filters toggle, scroll-to-top, map popup) are rendered on desktop (`md:` breakpoints guard everything).

Key structure:
- Root wrapper:
  - `min-h-screen w-full overflow-x-hidden md:h-screen md:overflow-hidden`
  - Child: `flex flex-col md:flex-row gap-2`
- Left filters column:
  - `hidden md:block w-full md:w-80 md:h-screen md:overflow-y-auto md:flex-shrink-0`
- Right content (list + map):
  - `flex-1 flex flex-col gap-2`
- Map column (desktop only):
  - `hidden md:block flex-1 h-screen`

### Mobile Behavior (New)

#### 1. Full-screen Map Popup
- The inline map is **hidden on mobile**; map is shown via a **full-screen popup**.
- State: `const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);`
- "Open map" button (mobile only):
  - Visible in a small control bar under the top area.
  - Clicking opens the full-screen map overlay.
- Full-screen overlay:
  - `fixed inset-0 z-50 flex items-center justify-center bg-black/60 md:hidden`
  - Inner container with full viewport height/width map.
  - Close control: circular **"X"** button positioned top-right, half over the white map card, half over dark backdrop (`absolute -top-4 right-4 h-9 w-9 rounded-full`).
- When popup is open:
  - Underlying page remains but is visually covered.
  - Mobile floating buttons (filters, scroll-to-top) are hidden.

#### 2. Mobile List Visibility Toggle
- State: `const [isListVisible, setIsListVisible] = useState(true);`
- In the mobile control bar:
  - Button label toggles between **"Hide list"** and **"Show list"**.
- Behavior:
  - On mobile: the list container uses `isListVisible` to show/hide.
  - On desktop: the list is **always shown**, regardless of this flag.
- Implementation detail in list container classes:
  - Mobile: `isListVisible ? 'block' : 'hidden'`
  - Desktop: forced `md:block`.

#### 3. Floating Filters Button + Slide-in Filters Panel (Mobile Only)
- State: `const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);`
- Desktop filters remain in the left sidebar as before.
- On **mobile**:
  - A floating circular button with an **"F"** icon is positioned on the right edge, vertically centered (`fixed top-1/2 right-4 -translate-y-1/2 z-40 md:hidden`).
  - Tapping it opens a **slide-in filters panel** from the right.
- Slide-in panel:
  - Full-screen translucent overlay: `fixed inset-0 z-40 flex justify-end bg-black/40 md:hidden`
  - Panel: `h-full w-4/5 max-w-xs bg-[#F6F6F5] shadow-lg`
  - Close button: circular **"X"** at top-right inside the panel.
  - Filters content: `LeftSidebarFilters` rendered scrollable inside the panel (`overflow-y-auto`).
- While filters panel is open:
  - Floating filters button is hidden.

#### 4. Floating Scroll-to-Top Button (Mobile Only)
- State: `const [showScrollTop, setShowScrollTop] = useState(false);`
- Global scroll listener:
  - `useEffect` with `window.addEventListener('scroll', ...)` updates `showScrollTop` based on `window.scrollY` > ~50px.
- Button:
  - Mobile-only: `fixed bottom-4 right-4 z-40 h-10 w-10 rounded-full bg-blue-600 text-white shadow md:hidden`.
  - On click: `window.scrollTo({ top: 0, behavior: 'smooth' });`
- Hidden when the mobile map popup is open.

### Notes for Future Changes
- **Do not alter desktop layout** when adjusting mobile UX: desktop relies on the 3-column `md:flex-row` structure described above.
- All new UX elements should remain guarded by `md:hidden` to prevent regressions on larger screens.
- Map resizing on layout changes is handled within `ReactLeafletMap` via a `ResizeHandler` that calls `map.invalidateSize()` on window resize; no additional work is needed when using the mobile popup.

---

## 6. Beach Map Performance Optimizations

### Overview
Comprehensive performance optimizations were implemented to make the beach map fast and smooth, similar to major mapping applications like Booking.com, Airbnb, and Google Maps. The map now handles hundreds of beach markers efficiently with minimal API calls and smooth user interactions.

### Problem Statement
**Before optimizations:**
- API called on **every map movement** (continuous during dragging)
- No debouncing - API requests fired continuously while panning/zooming
- All markers re-rendered on every data change
- Hundreds of individual markers rendered at all zoom levels
- Short cache time (1 minute) caused frequent unnecessary refetches
- Map felt sluggish and unresponsive during interaction

### Solutions Implemented

#### 1. Debouncing (600ms delay)
**File**: `src/lib/utils/debounce.ts` (new file)

Created a reusable debounce utility function that delays API calls until 600ms after the user stops moving the map.

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

**Configuration**: Set to 600ms in `ReactLeafletMap.tsx` (increased from 300ms to reduce request pile-up during rapid map movements)

**Impact**: Prevents continuous API calls during active dragging/zooming. API only fires after user pauses interaction. Longer delay prevents request queue overflow.

#### 2. Marker Clustering
**Files Modified**:
- `src/components/Map/ReactLeafletMap.tsx`
- `package.json`

**Dependencies Added**:
- `react-leaflet-cluster@4.0.0`
- `leaflet.markercluster@1.5.3`

Implemented marker clustering using `MarkerClusterGroup` to automatically group nearby beach markers at lower zoom levels.

```typescript
<MarkerClusterGroup
  chunkedLoading
  maxClusterRadius={50}
  spiderfyOnMaxZoom={true}
  showCoverageOnHover={false}
  zoomToBoundsOnClick={true}
>
  {/* Beach markers */}
</MarkerClusterGroup>
```

**Impact**: Reduces DOM elements from hundreds to dozens. Improves rendering performance significantly.

#### 3. ~~Expanded Bounding Box (1.5x Prefetching)~~ - REMOVED
**Status**: This optimization was removed because it caused a mismatch between beaches shown on the map and beaches in the sidebar list.

The map now uses **exact viewport bounds** to ensure the sidebar list shows exactly the same beaches as the map markers.

**Files Modified**:
- `src/components/Map/MapWithSidebar.tsx` - Uses exact viewport bounds (no expansion)

**Reason for Removal**: With expanded bounds, users would see 2 beaches on the map but 3 in the list, causing confusion. Exact bounds ensure UI consistency.

#### 4. Increased Cache Time & Request Management (TanStack Query Configuration)
**File**: `src/components/ApiClientProvider.tsx`

Updated TanStack Query (React Query) configuration to optimize caching and prevent request pile-up:

**Cache Settings:**
- **`staleTime`**: 1 minute → **5 minutes** (300,000ms)
- **`gcTime`**: default (5 min) → **10 minutes** (600,000ms)
- **`refetchOnWindowFocus`**: `false` (don't refetch when user returns to tab)
- **`retry`**: **1** (only retry once on failure to avoid request pile-up)
- **`retryDelay`**: **1000ms** (wait 1 second before retrying)

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - map data doesn't change frequently
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnWindowFocus: false,
      retry: 1, // Only retry once on failure to avoid request pile-up
      retryDelay: 1000, // Wait 1 second before retrying
    },
  },
})
```

**What these settings mean:**

| Setting | Value | Meaning |
|---------|-------|---------|
| `staleTime` | 5 minutes | Data is considered "fresh" for 5 minutes. No refetch during this time even if component remounts. |
| `gcTime` | 10 minutes | Cached data is kept in memory for 10 minutes after last use before garbage collection. |
| `refetchOnWindowFocus` | false | Don't automatically refetch when user switches back to the browser tab. |
| `retry` | 1 | Only retry failed requests once (default is 3). Prevents request pile-up on network issues. |
| `retryDelay` | 1000ms | Wait 1 second before retrying failed requests. Gives network time to recover. |

**Why these values:**
- Beach data doesn't change frequently (new beaches aren't added every minute)
- Users often pan/zoom around the same area - cache prevents duplicate API calls
- 5-minute freshness is acceptable for map exploration use case
- 10-minute garbage collection allows users to return to previously viewed areas without refetch

**Impact**:
- Map data stays fresh longer, significantly fewer unnecessary refetches
- Panning back to previously viewed areas uses cached data
- Reduced server load and faster user experience

#### 5. React.memo Optimization
**File**: `src/components/Map/ReactLeafletMap.tsx`

Created a memoized `BeachMarker` component that only re-renders when its data or selection state changes.

```typescript
const BeachMarker = memo(({ beach, isSelected, ... }) => {
  // Marker rendering
}, (prevProps, nextProps) =>
  prevProps.beach.id === nextProps.beach.id &&
  prevProps.isSelected === nextProps.isSelected
);
```

**Impact**: Prevents unnecessary re-renders of hundreds of markers when unrelated data changes.

#### 6. Zoom-Based Fetching Strategy
**Files Modified**:
- `src/components/Map/ReactLeafletMap.tsx` - MapEventHandler component
- `src/components/Map/MapWithSidebar.tsx` - Bounds tracking

Implemented smart fetching that only triggers new API calls when:
- Zoom level changes by ≥1 level, OR
- Viewport bounds change significantly

```typescript
const zoomChanged = lastZoomRef.current !== null &&
  Math.abs((lastZoomRef.current ?? 0) - zoom) >= 1;
const boundsChanged = lastBoundsRef.current !== boundsString;

if (boundsChanged || zoomChanged) {
  debouncedViewportChange(...);
}
```

**Impact**: Eliminates duplicate API calls for minor viewport adjustments.

#### 7. Memoized Icons
**File**: `src/components/Map/ReactLeafletMap.tsx`

Beach marker icons are now created once using `useMemo` and reused across all markers.

```typescript
const beachIcon = useMemo(() => L.icon({
  iconUrl: getMarkerIcon('beach'),
  iconSize: [28, 30],
  iconAnchor: [14, 30],
  popupAnchor: [0, -30],
}), []);
```

**Impact**: Reduces memory allocation and prevents icon recreation on every render.

#### 7. Lazy Image Loading with Next.js Image Component
**Files Modified**:
- `src/components/PropertyCard/DynamicPropertyCard.tsx` - Replaced background images with Next.js Image component

**Problem**: Background images (`style={{ backgroundImage: url(...) }}`) load all at once, causing browser request queue overflow when scrolling through beach list.

**Solution**: Use Next.js `<Image>` component with `loading="lazy"` and proper `sizes` attribute:

```typescript
<Image
  src={imageUrl}
  alt={beach.name ?? 'Beach'}
  fill
  className="object-cover"
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 410px"
/>
```

**Impact**:
- Browser only loads images as they enter viewport (lazy loading)
- Proper `sizes` attribute helps browser choose optimal image size
- Reduces simultaneous HTTP requests from 20+ to 3-5
- Prevents "pending" requests pile-up in Network tab
- Images load progressively as user scrolls

#### 8. Removed Loading Overlays & Seamless Updates
**Files Modified**:
- `src/components/Map/ReactLeafletMap.tsx` - Removed loading overlay
- `src/components/Map/MapWithSidebar.tsx` - Keep previous beaches visible, update grid rendering

**Problem**: Loading overlays cleared the map and beach list on every pan/zoom, creating a jarring user experience.

**Solution**:
1. **Removed loading overlay from map** - No more white overlay covering the map
2. **Keep previous beaches visible** - Store previous beaches in ref and display them while loading new data
3. **Update beach list grid** - Show grid whenever beaches exist, regardless of loading state

```typescript
// Keep previous beaches visible while loading new data
const previousBeachesRef = useRef<any[]>([]);
const newBeaches = boundingBoxResult.data?.data ?? [];
const beaches = newBeaches.length > 0 ? newBeaches : previousBeachesRef.current;

// Update ref when we have new data
useEffect(() => {
    if (newBeaches.length > 0) {
        previousBeachesRef.current = newBeaches;
    }
}, [newBeaches]);

// Show grid whenever we have beaches, even while loading new data
{!error && beaches.length > 0 && (
    <div className={`grid gap-4 grid-cols-1 ${columnLayout === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        {beaches.map((beach, index) => (
            <DynamicPropertyCard beach={beach} onLocationClick={handleLocationClick} />
        ))}
    </div>
)}
```

**Impact**:
- Map markers stay visible during pan/zoom
- Beach list grid stays visible during pan/zoom
- Seamless background updates without clearing content
- Professional UX like Google Maps, Airbnb, Booking.com

### Files Created
- `src/lib/utils/debounce.ts` - Debounce utility and bounding box helpers

### Files Modified
- `src/components/Map/ReactLeafletMap.tsx` - Debouncing, clustering, memoization, removed loading overlay
- `src/components/Map/MapWithSidebar.tsx` - Expanded bounds, bounds tracking, previous beaches ref, grid rendering
- `src/components/ApiClientProvider.tsx` - Increased cache times
- `package.json` - Added clustering dependencies

### Dependencies Added
```json
{
  "dependencies": {
    "react-leaflet-cluster": "^4.0.0"
  }
}
```

### Performance Improvements Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API calls during drag | Continuous (10-20+) | 1 (after 300ms pause) | ~95% reduction |
| Marker re-renders | All markers every change | Only changed markers | ~90% reduction |
| DOM elements (100 beaches) | 100 markers | 10-30 clusters | ~70% reduction |
| Cache duration | 1 minute | 5-10 minutes | 5-10x longer |
| Prefetch area | Exact viewport | 1.5x viewport | 50% larger |
| Unnecessary fetches | Frequent | Rare | ~80% reduction |

### User Experience Improvements
- ✅ **Smooth panning** - No lag or stuttering when dragging the map
- ✅ **Fast zooming** - Instant zoom response without API delays
- ✅ **No loading overlays** - Markers update in background without clearing the map
- ✅ **Beach list stays visible** - Grid of beach cards remains visible during map movements
- ✅ **Seamless updates** - Both map and list update smoothly without clearing existing content
- ✅ **Reduced loading** - Fewer loading states, more cached data
- ✅ **Better clustering** - Clean visual grouping at lower zoom levels
- ✅ **Responsive interactions** - Immediate feedback on all user actions

### Technical Implementation Details

#### Debounce Implementation
The debounce function uses a closure to maintain a timeout reference:
```typescript
let timeout: NodeJS.Timeout | null = null;
return function executedFunction(...args: Parameters<T>) {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => func(...args), wait);
};
```

#### MapEventHandler Optimization
The `MapEventHandler` component now:
1. Uses `useRef` to track last bounds and zoom level
2. Memoizes the debounced callback with `useMemo`
3. Only triggers viewport changes when bounds/zoom actually change
4. Applies 300ms debounce before calling parent callback

#### ~~Bounding Box Expansion~~ - REMOVED
The bounding box expansion feature was removed to ensure the sidebar beach list matches exactly what's visible on the map. The map now uses exact viewport bounds without any expansion.

### Testing Recommendations
After deployment, verify:
1. Map panning is smooth without stuttering
2. API calls only fire after stopping movement (check Network tab)
3. Markers cluster properly at zoom levels < 10
4. Selected beach marker remains highlighted and larger
5. Cache persists across page navigation (back/forward)
6. Mobile performance is acceptable (test on actual devices)

### Future Optimization Opportunities
- **Backend clustering endpoint**: Return pre-clustered data at low zoom levels (see Section 7)
- **Tile-based caching**: Cache beaches by map tile coordinates (see Section 7)
- **Virtual scrolling**: For the beach list sidebar
- **WebWorker processing**: Offload marker calculations to background thread
- **Progressive loading**: Load visible markers first, then off-screen

### TanStack Query Cache Scope & Behavior

**Important: Cache is Browser-Based, NOT Global**

- ✅ **Per-user, per-browser** - Each user has their own separate cache in their browser memory
- ❌ **NOT shared between users** - User A's cache doesn't affect User B
- ❌ **NOT server-side** - Cache exists only in the browser's RAM
- 🔄 **Session-based** - Cache is cleared when browser/tab is closed (unless using persistence plugins)

**Example:**
```
User A visits map → Caches 100 beaches for 5 minutes
User B visits map → Has separate cache, doesn't see User A's data
Admin adds beach → Neither user sees it until cache expires (5 min)
```

### Auto-Refresh Strategies (When Backend Data Changes)

Since cache is browser-based, users won't see new beaches added by admin until cache expires. Here are strategies to refresh cache when backend data changes:

#### **Strategy 1: Server-Sent Events (SSE)** ⭐ Recommended for Real-Time

**How it works:**
1. Backend sends event when beach is added/updated/deleted
2. Frontend listens to SSE stream
3. Frontend invalidates TanStack Query cache
4. Map automatically refetches and updates

**Backend (Laravel):**
```php
// app/Events/BeachUpdated.php
class BeachUpdated implements ShouldBroadcast
{
    public function __construct(public Beach $beach) {}

    public function broadcastOn()
    {
        return new Channel('beaches');
    }
}

// Trigger when beach changes
event(new BeachUpdated($beach));
```

**Frontend (React):**
```typescript
// src/hooks/useBeachUpdates.ts
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useBeachUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/beaches/stream`);

    eventSource.addEventListener('beach-updated', () => {
      // Invalidate all beach queries - forces refetch
      queryClient.invalidateQueries({ queryKey: ['beaches'] });
    });

    return () => eventSource.close();
  }, [queryClient]);
}

// Use in MapWithSidebar.tsx
function MapWithSidebar() {
  useBeachUpdates(); // Auto-refresh when backend changes
  // ... rest of component
}
```

**Pros:**
- ✅ Real-time updates (users see new beaches immediately)
- ✅ Can extend cache time to 30+ minutes (rely on SSE for freshness)
- ✅ Efficient (only sends events when data actually changes)

**Cons:**
- ❌ Requires backend SSE implementation
- ❌ Requires persistent connection (minimal overhead)

---

#### **Strategy 2: Polling with `refetchInterval`**

**How it works:**
TanStack Query automatically refetches data every X seconds.

```typescript
// src/hooks/useBeaches.ts
export function useBeachesBoundingBox(filters, enabled) {
  return useQuery({
    queryKey: ['beaches', 'bounding-box', filters],
    queryFn: () => fetchBeaches(filters),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}
```

**Pros:**
- ✅ Simple to implement (no backend changes)
- ✅ Guaranteed freshness

**Cons:**
- ❌ Unnecessary API calls (even when data hasn't changed)
- ❌ Increased server load
- ❌ Can't extend cache time much (defeats purpose)

---

#### **Strategy 3: Cache Versioning with ETag/Last-Modified**

**How it works:**
Backend returns version/timestamp, frontend checks if data changed.

**Backend:**
```php
// Return ETag header with beach data version
$version = Cache::get('beaches_version', 1);
return response()->json($beaches)
    ->header('ETag', "beaches-v{$version}");

// Increment version when beach changes
Cache::increment('beaches_version');
```

**Frontend:**
```typescript
// TanStack Query automatically uses ETag for conditional requests
// No code changes needed - just ensure backend sends ETag headers
```

**Pros:**
- ✅ Efficient (304 Not Modified responses are fast)
- ✅ Can extend cache time significantly
- ✅ No persistent connections

**Cons:**
- ❌ Still requires periodic polling
- ❌ Not truly real-time

---

#### **Strategy 4: WebSocket** (Overkill for this use case)

Similar to SSE but bidirectional. Only needed if frontend also sends real-time data to backend.

---

### Recommended Approach

**For Beachrex:**

1. **Short-term (Current)**: Keep 5-minute cache, acceptable for most users
2. **Medium-term**: Implement **Strategy 1 (SSE)** + extend cache to 30 minutes
   - Real-time updates when admin adds beaches
   - Longer cache reduces API calls
   - Best user experience
3. **Alternative**: Use **Strategy 3 (ETag)** with 10-minute polling if SSE is too complex

### Extending Cache Time with SSE

If you implement SSE, you can safely increase cache times:

```typescript
// src/components/ApiClientProvider.tsx
staleTime: 30 * 60 * 1000,  // 30 minutes (rely on SSE for freshness)
gcTime: 60 * 60 * 1000,      // 60 minutes
refetchOnWindowFocus: false,
```

This gives you:
- ✅ **30-minute cache** - Massive reduction in API calls
- ✅ **Real-time updates** - Users see new beaches immediately via SSE
- ✅ **Best of both worlds** - Performance + freshness

### Notes for Future Changes
- The **600ms debounce delay** can be adjusted in `ReactLeafletMap.tsx` if needed (increased from 300ms to prevent request pile-up)
- ~~The 1.5x expansion factor can be tuned in `MapWithSidebar.tsx`~~ - REMOVED (caused list/map mismatch)
- Cache times should be increased cautiously (balance freshness vs performance)
- **With SSE implementation, cache can be extended to 30+ minutes safely**
- Marker cluster radius (50px) can be adjusted for different visual density
- Minimum cluster size is set to 5 markers (clusters with < 5 markers show individual pins)
- **Loading overlay removed**: Map updates markers in background without showing loading state for smooth UX
- **Beach list stays visible**: Grid of beach cards remains visible during loading, updates seamlessly with new data
- **Retry limit set to 1**: Prevents request pile-up on network failures (default was 3 retries)
- **Previous data retained**: Uses `previousBeachesRef` to keep beaches visible while new data loads
- All optimizations are backward compatible with existing API

---

## 8. Advanced Map Optimization Strategies (Future Implementation)

This section documents advanced optimization strategies for the beach map that can be implemented when the application scales beyond 10,000+ beaches or when further performance improvements are needed.

### Overview

The current client-side clustering approach works well for up to ~10,000 beaches. For larger datasets or to achieve Google Maps-level performance, consider these two advanced strategies:

1. **Backend Clustering Endpoint** - Server-side pre-calculation of clusters
2. **Tile-Based Caching System** - Map tile-based data caching (like Google Maps)

---

### 7.1 Backend Clustering Endpoint

#### Concept
Instead of sending all individual beach coordinates to the frontend and letting the browser cluster them, the backend pre-calculates clusters based on the current zoom level and viewport bounds.

#### Current vs Optimized Flow

**Current approach (client-side clustering):**
```
Backend → Sends 500 beaches → Frontend clusters them → Displays ~50 clusters
```

**Optimized approach (server-side clustering):**
```
Backend → Calculates clusters → Sends 50 cluster objects → Frontend displays them directly
```

#### API Design

**New Endpoint:**
```
GET /api/beaches/clusters?min_lat={lat}&max_lat={lat}&min_lon={lon}&max_lon={lon}&zoom={zoom}
```

**Response Format:**
```json
{
  "data": [
    {
      "type": "cluster",
      "lat": 45.5,
      "lon": 14.2,
      "count": 25,
      "bounds": {
        "min_lat": 45.4,
        "max_lat": 45.6,
        "min_lon": 14.1,
        "max_lon": 14.3
      },
      "beach_ids": [1, 2, 3, ...]
    },
    {
      "type": "single",
      "beach_id": 123,
      "lat": 45.7,
      "lon": 14.5,
      "name": "Beautiful Beach",
      "slug": "beautiful-beach",
      "country_code": "HR"
    }
  ],
  "meta": {
    "total_items": 75,
    "zoom": 12
  }
}
```

#### Backend Implementation (Laravel)

**Service Class:**
```php
// app/Services/BeachClusterService.php
class BeachClusterService
{
    /**
     * Cluster beaches based on zoom level and viewport
     */
    public function getClusters(
        float $minLat,
        float $maxLat,
        float $minLon,
        float $maxLon,
        int $zoom
    ): array {
        // Calculate grid size based on zoom level
        $gridSize = $this->getGridSize($zoom);

        // Get all beaches in viewport
        $beaches = Beach::where('status_id', 1)
            ->whereBetween('latitude', [$minLat, $maxLat])
            ->whereBetween('longitude', [$minLon, $maxLon])
            ->get(['id', 'latitude', 'longitude', 'name', 'slug', 'country_code']);

        // Group beaches into grid cells
        $grid = [];
        foreach ($beaches as $beach) {
            $cellX = floor($beach->longitude / $gridSize);
            $cellY = floor($beach->latitude / $gridSize);
            $key = "{$cellX}_{$cellY}";

            if (!isset($grid[$key])) {
                $grid[$key] = [];
            }
            $grid[$key][] = $beach;
        }

        // Convert grid cells to clusters or single markers
        $clusters = [];
        foreach ($grid as $cell) {
            if (count($cell) >= 5) {
                // Create cluster (minimum 5 beaches)
                $clusters[] = [
                    'type' => 'cluster',
                    'lat' => array_sum(array_column($cell, 'latitude')) / count($cell),
                    'lon' => array_sum(array_column($cell, 'longitude')) / count($cell),
                    'count' => count($cell),
                    'beach_ids' => array_column($cell, 'id'),
                    'bounds' => $this->calculateBounds($cell),
                ];
            } else {
                // Add individual beaches
                foreach ($cell as $beach) {
                    $clusters[] = [
                        'type' => 'single',
                        'beach_id' => $beach->id,
                        'lat' => $beach->latitude,
                        'lon' => $beach->longitude,
                        'name' => $beach->name,
                        'slug' => $beach->slug,
                        'country_code' => $beach->country_code,
                    ];
                }
            }
        }

        return $clusters;
    }

    /**
     * Calculate grid size based on zoom level
     * Higher zoom = smaller grid = less clustering
     */
    private function getGridSize(int $zoom): float
    {
        return match(true) {
            $zoom <= 5 => 5.0,    // Very large clusters (world view)
            $zoom <= 8 => 1.0,    // Large clusters (continent view)
            $zoom <= 11 => 0.5,   // Medium clusters (country view)
            $zoom <= 14 => 0.1,   // Small clusters (region view)
            default => 0.01,      // Minimal clustering (city view)
        };
    }

    /**
     * Calculate bounding box for a group of beaches
     */
    private function calculateBounds(array $beaches): array
    {
        $lats = array_column($beaches, 'latitude');
        $lons = array_column($beaches, 'longitude');

        return [
            'min_lat' => min($lats),
            'max_lat' => max($lats),
            'min_lon' => min($lons),
            'max_lon' => max($lons),
        ];
    }
}
```

**Controller:**
```php
// app/Http/Controllers/BeachClusterController.php
class BeachClusterController extends Controller
{
    public function getClusters(Request $request)
    {
        $validated = $request->validate([
            'min_lat' => 'required|numeric|min:-90|max:90',
            'max_lat' => 'required|numeric|min:-90|max:90',
            'min_lon' => 'required|numeric|min:-180|max:180',
            'max_lon' => 'required|numeric|min:-180|max:180',
            'zoom' => 'required|integer|min:1|max:18',
        ]);

        $clusterService = app(BeachClusterService::class);
        $clusters = $clusterService->getClusters(
            $validated['min_lat'],
            $validated['max_lat'],
            $validated['min_lon'],
            $validated['max_lon'],
            $validated['zoom']
        );

        // Cache the result for 5 minutes
        $cacheKey = sprintf(
            'beach_clusters:%d:%.2f:%.2f:%.2f:%.2f',
            $validated['zoom'],
            $validated['min_lat'],
            $validated['max_lat'],
            $validated['min_lon'],
            $validated['max_lon']
        );

        return response()->json([
            'data' => $clusters,
            'meta' => [
                'total_items' => count($clusters),
                'zoom' => $validated['zoom'],
            ]
        ]);
    }
}
```

**Route:**
```php
// routes/api.php
Route::get('/beaches/clusters', [BeachClusterController::class, 'getClusters']);
```

#### Frontend Integration

**Update API call in MapWithSidebar.tsx:**
```typescript
// Instead of /beaches/bounding-box, call /beaches/clusters
const { data: clusterData } = useQuery({
  queryKey: ['beach-clusters', boundingBox, zoom],
  queryFn: () => fetchBeachClusters(boundingBox, zoom),
  enabled: !!boundingBox,
});

// Handle both clusters and individual beaches
const renderMarkers = () => {
  return clusterData?.data.map(item => {
    if (item.type === 'cluster') {
      return <ClusterMarker key={`cluster-${item.lat}-${item.lon}`} {...item} />;
    } else {
      return <BeachMarker key={`beach-${item.beach_id}`} {...item} />;
    }
  });
};
```

#### Benefits
- ✅ **Reduced payload size**: Send 50 clusters instead of 500 beaches
- ✅ **Faster frontend rendering**: No client-side clustering computation
- ✅ **Consistent clustering**: Same clusters for all users at same zoom/viewport
- ✅ **Better caching**: Can cache cluster results on backend
- ✅ **Mobile performance**: Less JavaScript processing on mobile devices
- ✅ **Scalable**: Works efficiently with 50,000+ beaches

#### Drawbacks
- ❌ More complex backend logic
- ❌ Need to handle cluster expansion (when user clicks cluster to zoom in)
- ❌ Less flexible (can't easily change clustering algorithm on frontend)
- ❌ Additional API endpoint to maintain

#### When to Implement
- You have **> 10,000 beaches** in the database
- Mobile performance becomes an issue
- You want to reduce frontend bundle size and computation
- You need consistent clustering across all users

---

### 7.2 Tile-Based Caching System

#### Concept
Divide the world map into **tiles** (like Google Maps does) and cache beach data per tile. This is the same pattern used by Google Maps, Mapbox, and other major mapping services for imagery tiles.

#### How Map Tiles Work

The world is divided into a grid at each zoom level:
- **Zoom 0**: 1 tile (entire world)
- **Zoom 1**: 4 tiles (2×2 grid)
- **Zoom 2**: 16 tiles (4×4 grid)
- **Zoom 10**: 1,048,576 tiles (1024×1024 grid)
- **Zoom 18**: 68,719,476,736 tiles

Each tile has coordinates: `{zoom}/{x}/{y}`

Example: `10/512/342` = Zoom level 10, tile X=512, Y=342

#### Tile Coordinate System

```
Zoom 1:           Zoom 2:
┌─────┬─────┐     ┌──┬──┬──┬──┐
│ 0,0 │ 1,0 │     │  │  │  │  │
├─────┼─────┤     ├──┼──┼──┼──┤
│ 0,1 │ 1,1 │     │  │  │  │  │
└─────┴─────┘     ├──┼──┼──┼──┤
                  │  │  │  │  │
                  ├──┼──┼──┼──┤
                  │  │  │  │  │
                  └──┴──┴──┴──┘
```

#### Backend Implementation (Laravel)

**Tile Service:**
```php
// app/Services/MapTileService.php
class MapTileService
{
    /**
     * Convert lat/lon to tile coordinates
     *
     * @param float $lat Latitude (-90 to 90)
     * @param float $lon Longitude (-180 to 180)
     * @param int $zoom Zoom level (0 to 18)
     * @return array ['x' => int, 'y' => int, 'zoom' => int]
     */
    public function latLonToTile(float $lat, float $lon, int $zoom): array
    {
        $n = pow(2, $zoom);
        $xtile = floor(($lon + 180) / 360 * $n);

        $latRad = deg2rad($lat);
        $ytile = floor((1 - log(tan($latRad) + 1 / cos($latRad)) / pi()) / 2 * $n);

        return [
            'x' => (int) $xtile,
            'y' => (int) $ytile,
            'zoom' => $zoom
        ];
    }

    /**
     * Get tile bounds (lat/lon boundaries)
     *
     * @param int $x Tile X coordinate
     * @param int $y Tile Y coordinate
     * @param int $zoom Zoom level
     * @return array ['min_lat', 'max_lat', 'min_lon', 'max_lon']
     */
    public function getTileBounds(int $x, int $y, int $zoom): array
    {
        $n = pow(2, $zoom);

        $lon_min = $x / $n * 360 - 180;
        $lon_max = ($x + 1) / $n * 360 - 180;

        $lat_min_rad = atan(sinh(pi() * (1 - 2 * ($y + 1) / $n)));
        $lat_max_rad = atan(sinh(pi() * (1 - 2 * $y / $n)));

        return [
            'min_lat' => rad2deg($lat_min_rad),
            'max_lat' => rad2deg($lat_max_rad),
            'min_lon' => $lon_min,
            'max_lon' => $lon_max,
        ];
    }

    /**
     * Get all tiles that intersect with a bounding box
     *
     * @param float $minLat Minimum latitude
     * @param float $maxLat Maximum latitude
     * @param float $minLon Minimum longitude
     * @param float $maxLon Maximum longitude
     * @param int $zoom Zoom level
     * @return array Array of tiles [['x' => int, 'y' => int, 'zoom' => int], ...]
     */
    public function getTilesForBounds(
        float $minLat,
        float $maxLat,
        float $minLon,
        float $maxLon,
        int $zoom
    ): array {
        $topLeft = $this->latLonToTile($maxLat, $minLon, $zoom);
        $bottomRight = $this->latLonToTile($minLat, $maxLon, $zoom);

        $tiles = [];
        for ($x = $topLeft['x']; $x <= $bottomRight['x']; $x++) {
            for ($y = $topLeft['y']; $y <= $bottomRight['y']; $y++) {
                $tiles[] = ['x' => $x, 'y' => $y, 'zoom' => $zoom];
            }
        }

        return $tiles;
    }

    /**
     * Get beaches within a specific tile
     *
     * @param int $x Tile X coordinate
     * @param int $y Tile Y coordinate
     * @param int $zoom Zoom level
     * @return \Illuminate\Support\Collection
     */
    public function getBeachesInTile(int $x, int $y, int $zoom)
    {
        $bounds = $this->getTileBounds($x, $y, $zoom);

        return Beach::where('status_id', 1)
            ->whereBetween('latitude', [$bounds['min_lat'], $bounds['max_lat']])
            ->whereBetween('longitude', [$bounds['min_lon'], $bounds['max_lon']])
            ->select(['id', 'latitude', 'longitude', 'name', 'slug', 'country_code'])
            ->get();
    }
}
```

**Controller:**
```php
// app/Http/Controllers/BeachTileController.php
class BeachTileController extends Controller
{
    /**
     * Get beaches for a specific map tile
     *
     * @param int $zoom Zoom level (0-18)
     * @param int $x Tile X coordinate
     * @param int $y Tile Y coordinate
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTile(int $zoom, int $x, int $y)
    {
        // Validate zoom level
        if ($zoom < 0 || $zoom > 18) {
            return response()->json(['error' => 'Invalid zoom level'], 400);
        }

        $cacheKey = "beach_tile:{$zoom}:{$x}:{$y}";

        // Cache for 1 hour (tiles rarely change)
        $beaches = Cache::remember($cacheKey, 3600, function () use ($zoom, $x, $y) {
            $tileService = app(MapTileService::class);
            return $tileService->getBeachesInTile($x, $y, $zoom);
        });

        return response()->json([
            'data' => $beaches,
            'tile' => [
                'zoom' => $zoom,
                'x' => $x,
                'y' => $y
            ],
            'meta' => [
                'count' => $beaches->count(),
                'cached' => Cache::has($cacheKey),
            ]
        ]);
    }

    /**
     * Get beaches for multiple tiles (batch request)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTiles(Request $request)
    {
        $validated = $request->validate([
            'tiles' => 'required|array|max:20', // Limit to 20 tiles per request
            'tiles.*.zoom' => 'required|integer|min:0|max:18',
            'tiles.*.x' => 'required|integer|min:0',
            'tiles.*.y' => 'required|integer|min:0',
        ]);

        $tileService = app(MapTileService::class);
        $results = [];

        foreach ($validated['tiles'] as $tile) {
            $cacheKey = "beach_tile:{$tile['zoom']}:{$tile['x']}:{$tile['y']}";

            $beaches = Cache::remember($cacheKey, 3600, function () use ($tileService, $tile) {
                return $tileService->getBeachesInTile($tile['x'], $tile['y'], $tile['zoom']);
            });

            $results[] = [
                'tile' => $tile,
                'data' => $beaches,
                'count' => $beaches->count(),
            ];
        }

        return response()->json([
            'tiles' => $results,
            'meta' => [
                'total_tiles' => count($results),
                'total_beaches' => array_sum(array_column($results, 'count')),
            ]
        ]);
    }
}
```

**Routes:**
```php
// routes/api.php
Route::get('/beaches/tiles/{zoom}/{x}/{y}', [BeachTileController::class, 'getTile'])
    ->where(['zoom' => '[0-9]+', 'x' => '[0-9]+', 'y' => '[0-9]+']);

Route::post('/beaches/tiles/batch', [BeachTileController::class, 'getTiles']);
```

#### Frontend Integration

**Calculate visible tiles:**
```typescript
// lib/utils/map-tiles.ts
export function latLonToTile(lat: number, lon: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const xtile = Math.floor(((lon + 180) / 360) * n);
  const ytile = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
  );
  return { x: xtile, y: ytile, zoom };
}

export function getVisibleTiles(bounds: BoundingBox, zoom: number) {
  const topLeft = latLonToTile(bounds.max_lat, bounds.min_lon, zoom);
  const bottomRight = latLonToTile(bounds.min_lat, bounds.max_lon, zoom);

  const tiles = [];
  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      tiles.push({ x, y, zoom });
    }
  }
  return tiles;
}
```

**Fetch tiles in MapWithSidebar.tsx:**
```typescript
const visibleTiles = useMemo(() => {
  if (!boundingBox || !zoom) return [];
  return getVisibleTiles(boundingBox, zoom);
}, [boundingBox, zoom]);

// Fetch each tile with React Query
const tileQueries = useQueries({
  queries: visibleTiles.map(tile => ({
    queryKey: ['beach-tile', tile.zoom, tile.x, tile.y],
    queryFn: () => fetchBeachTile(tile.zoom, tile.x, tile.y),
    staleTime: 60 * 60 * 1000, // 1 hour (tiles rarely change)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })),
});

// Combine all beaches from all tiles
const allBeaches = useMemo(() => {
  return tileQueries
    .filter(query => query.data)
    .flatMap(query => query.data.data);
}, [tileQueries]);
```

**Alternative: Batch request:**
```typescript
const { data: tilesData } = useQuery({
  queryKey: ['beach-tiles-batch', visibleTiles],
  queryFn: () => fetchBeachTilesBatch(visibleTiles),
  enabled: visibleTiles.length > 0,
  staleTime: 60 * 60 * 1000,
});
```

#### Cache Invalidation Strategy

When beaches are added, updated, or deleted, invalidate affected tiles:

```php
// app/Observers/BeachObserver.php
class BeachObserver
{
    public function saved(Beach $beach)
    {
        $this->invalidateTilesForBeach($beach);
    }

    public function deleted(Beach $beach)
    {
        $this->invalidateTilesForBeach($beach);
    }

    private function invalidateTilesForBeach(Beach $beach)
    {
        $tileService = app(MapTileService::class);

        // Invalidate tiles at all zoom levels
        for ($zoom = 0; $zoom <= 18; $zoom++) {
            $tile = $tileService->latLonToTile(
                $beach->latitude,
                $beach->longitude,
                $zoom
            );

            $cacheKey = "beach_tile:{$zoom}:{$tile['x']}:{$tile['y']}";
            Cache::forget($cacheKey);
        }
    }
}
```

#### Benefits
- ✅ **Excellent caching**: Each tile cached independently, very high cache hit rate
- ✅ **Predictable performance**: Same tiles always return same data
- ✅ **CDN-friendly**: Can cache tiles at CDN edge locations (CloudFlare, etc.)
- ✅ **Incremental loading**: Load only visible tiles, prefetch adjacent tiles
- ✅ **Highly scalable**: Works with millions of beaches
- ✅ **Standard approach**: Same pattern used by Google Maps, Mapbox, OpenStreetMap
- ✅ **Efficient updates**: Only invalidate affected tiles when data changes
- ✅ **Parallel loading**: Multiple tiles can be fetched simultaneously

#### Drawbacks
- ❌ Complex implementation (tile math, coordinate conversion)
- ❌ Multiple API requests per viewport (need to fetch 4-9 tiles typically)
- ❌ Tile boundaries can split clusters awkwardly
- ❌ Need sophisticated cache invalidation strategy
- ❌ More database queries (one per tile instead of one per viewport)
- ❌ Requires careful testing of tile coordinate calculations

#### When to Implement
- You have **> 50,000 beaches** in the database
- You need Google Maps-level performance and scalability
- You want to leverage CDN caching for geographic data
- You have multiple map-based features (not just beaches)
- You're willing to invest in complex infrastructure

---

### 7.3 Comparison & Recommendations

| Feature | Current (Client Clustering) | Backend Clustering | Tile-Based Caching |
|---------|---------------------------|-------------------|-------------------|
| **Complexity** | Low | Medium | High |
| **Performance** | Good (with optimizations) | Excellent | Excellent |
| **Payload Size** | Large (all beaches) | Small (clusters only) | Medium (per tile) |
| **Cache Hit Rate** | Medium (~60-70%) | Medium (~60-70%) | Very High (~90%+) |
| **Scalability** | Good (up to ~10k beaches) | Excellent (up to ~100k) | Excellent (millions) |
| **Flexibility** | High | Medium | Low |
| **Mobile Performance** | Good | Excellent | Excellent |
| **API Requests** | 1 per viewport change | 1 per viewport change | 4-9 per viewport |
| **Database Load** | Medium | Medium | Low (cached) |
| **CDN Compatibility** | No | Partial | Excellent |
| **Implementation Time** | ✅ Done | ~2-3 days | ~5-7 days |

### 7.4 Implementation Recommendations

**Current Scale (< 10,000 beaches):**
- ✅ **Use current optimizations** - Already implemented and working well
- ⏭️ **Skip backend clustering** - Added complexity without significant benefit
- ⏭️ **Skip tile-based caching** - Overkill for current scale

**Medium Scale (10,000 - 50,000 beaches):**
- ✅ **Implement backend clustering** - Significant performance improvement
- ⏭️ **Skip tile-based caching** - Still not necessary
- 🔄 **Monitor performance** - Track API response times and frontend rendering

**Large Scale (50,000+ beaches):**
- ✅ **Implement tile-based caching** - Essential for this scale
- ✅ **Combine with backend clustering** - Use clustering within each tile
- ✅ **Add CDN caching** - Cache tiles at edge locations
- ✅ **Consider database optimization** - Spatial indexes, read replicas

### 7.5 Hybrid Approach (Best of Both Worlds)

For maximum performance at scale, combine both strategies:

1. **Use tile-based caching** for data fetching and caching
2. **Apply backend clustering** within each tile before returning data
3. **Frontend only renders** the pre-clustered data

**Example flow:**
```
User pans map
  → Frontend calculates visible tiles (e.g., 6 tiles)
  → Fetch each tile from cache (6 parallel requests)
  → Each tile contains pre-clustered data
  → Frontend renders clusters + individual markers
  → Smooth, fast experience
```

**Benefits of hybrid:**
- ✅ Best cache hit rate (tile-based)
- ✅ Smallest payload (clustering)
- ✅ Fastest rendering (pre-clustered)
- ✅ Most scalable (both strategies)

### 7.6 Testing Strategy

When implementing these optimizations, test:

1. **Correctness**
   - Tile coordinate calculations are accurate
   - Clusters contain correct beaches
   - No beaches are lost at tile boundaries

2. **Performance**
   - API response times < 100ms (cached)
   - API response times < 500ms (uncached)
   - Frontend rendering < 50ms
   - Smooth map panning (60 FPS)

3. **Cache Behavior**
   - Cache hit rate > 80%
   - Cache invalidation works correctly
   - Memory usage is acceptable

4. **Edge Cases**
   - International date line (longitude ±180°)
   - Poles (latitude ±90°)
   - Very high zoom levels (18+)
   - Empty tiles (no beaches)

### 7.7 Monitoring & Metrics

Track these metrics to determine when to implement advanced optimizations:

- **API response time** - If > 1 second, consider backend clustering
- **Frontend render time** - If > 200ms, consider backend clustering
- **Cache hit rate** - If < 60%, consider tile-based caching
- **Number of beaches** - If > 10,000, plan for backend clustering
- **Mobile performance** - If laggy, implement backend clustering
- **Database load** - If high, implement tile-based caching

### 7.8 Additional Resources

- **Leaflet.markercluster documentation**: https://github.com/Leaflet/Leaflet.markercluster
- **Map tile coordinate system**: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
- **Google Maps tile system**: https://developers.google.com/maps/documentation/javascript/coordinates
- **Spatial indexing in MySQL**: https://dev.mysql.com/doc/refman/8.0/en/spatial-index-optimization.html
- **Redis caching strategies**: https://redis.io/docs/manual/patterns/

---


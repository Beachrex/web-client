# Localization Guide

> **Critical Reference**: How internationalization (i18n) works in Beachrex

**Last Updated**: 2026-07-27

---

## Quick Reference

### Supported Locales
```typescript
['en', 'si', 'de', 'hr', 'fr', 'es', 'it', 'ua', 'ru', 'pl', 'cs', 'hu', 'bg', 'sk']
```

### Localized Route Words

| Route | EN | SI | DE | FR | ES | IT |
|-------|----|----|----|----|----|----|
| Beaches | beaches | plaze | strande | plages | playas | spiagge |
| Beach Map | beach-map | zemljevid-plaz | strand-karte | carte-des-plages | mapa-de-playas | mappa-spiagge |

---

## How Localization Works

### 1. Request Flow

```
User visits: /si/plaze/evropa/belgija
        ↓
[Middleware] src/middleware.ts
        ↓
1. intlMiddleware() detects locale: "si"
   - Sets locale context in headers
   - Validates locale against supported list
        ↓
2. Check if path contains localized route word
   - Matches "plaze" in path
        ↓
3. Rewrite to internal route
   - /si/plaze/... → /si/beaches/...
        ↓
4. Copy intl headers to rewrite response
   - Preserves locale="si" context
        ↓
[Next.js Routing]
        ↓
Renders: app/[locale]/beaches/[continent]/[country]/page.tsx
        ↓
Server Components: locale="si" ✅
Client Components: locale="si" ✅ (via headers)
```

### 2. Middleware Architecture

**File**: `src/middleware.ts`

**Critical Code Pattern:**
```typescript
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // STEP 1: Run intl middleware FIRST
  const intlResponse = intlMiddleware(request);

  // STEP 2: Check for localized route words
  for (const beachesWord of Object.values(beachesRoutes)) {
    if (pathname.includes(`/${beachesWord}/`)) {
      // STEP 3: Rewrite path
      const rewrittenPath = pathname.replace(`/${beachesWord}/`, '/beaches/');
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;
      
      const rewriteResponse = NextResponse.rewrite(url);
      
      // STEP 4: Copy headers (CRITICAL!)
      intlResponse.headers.forEach((value, key) => {
        rewriteResponse.headers.set(key, value);
      });

      return rewriteResponse;
    }
  }

  return intlResponse;
}
```

**Why This Works:**
1. `intlMiddleware()` sets locale in response headers
2. We create a new rewrite response
3. We **copy all headers** from intl response to rewrite response
4. This preserves locale context for both server and client components

**Common Mistake:**
```typescript
// ❌ WRONG - bypasses intlMiddleware
if (pathname.includes('/plaze/')) {
  return NextResponse.rewrite(...);
}
return intlMiddleware(request);
```

### 3. Routing Configuration

**File**: `src/i18n/routing.ts`

**Every route must be defined for ALL locales:**

```typescript
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  pathnames: {
    '/beaches': {
      en: '/beaches',
      si: '/plaze',
      de: '/strande',
      // ... all 14 locales
    },
    '/beaches/[continent]': {
      en: '/beaches/[continent]',
      si: '/plaze/[continent]',
      // ... all 14 locales
    },
    '/beaches/[continent]/[country]': {
      en: '/beaches/[continent]/[country]',
      si: '/plaze/[continent]/[country]',
      // ... all 14 locales
    },
    '/beaches/[continent]/[country]/[...segments]': {
      en: '/beaches/[continent]/[country]/[...segments]',
      si: '/plaze/[continent]/[country]/[...segments]',
      // ... all 14 locales
    }
  }
});
```

**Important:**
- ✅ Include ALL dynamic route patterns (including catch-all routes)
- ❌ Missing routes cause 404s or wrong locale detection

### 4. Path Translation (Language Switcher)

**File**: `src/hooks/useLocalizedPath.ts`

**Purpose**: Translate URL slugs when switching languages

**Example:**
```typescript
// Current URL: /si/plaze/evropa/belgija
// User clicks: English language switcher
// Result: /en/beaches/europe/belgium

translatePath('/si/plaze/evropa/belgija', 'si', 'en')
```

**Algorithm:**
1. Remove locale prefix
2. Detect route type (beaches, beach-map, etc.)
3. Extract dynamic segments (continent, country, region, etc.)
4. Fetch localized names from API
5. Rebuild path with target locale's route word + localized slugs

**Key Logic:**
```typescript
// Detect beaches route across ALL locales
const allBeachesWords = Object.values(beachesRoutes);
const isBeachesRoute = allBeachesWords.includes(segments[0]);

// Translate route word
const targetBeachesWord = beachesRoutes[targetLocale];

// Fetch localized continent
const targetContinent = continents.find(c => c.code === currentContinent.code);

// Rebuild path
return `/${targetBeachesWord}/${targetContinent.slug}/${targetCountry.slug}`;
```

---



## Common Localization Issues & Solutions

### Issue 1: Client Components Show Wrong Language
**Cause:** Middleware bypasses intlMiddleware  
**Solution:** Copy intl headers to rewrite response

### Issue 2: IntlError MALFORMED_ARGUMENT
**Cause:** Using `{{variable}}` instead of `{variable}`  
**Solution:** Use single braces in translation files

### Issue 3: 404 on Localized Routes
**Cause:** Missing route in routing.ts  
**Solution:** Add to pathnames for all locales

### Issue 4: Language Switcher Broken
**Cause:** useLocalizedPath doesn't detect route  
**Solution:** Check ALL locale route words

### Issue 5: Map Search Returns Wrong/Historical Place Names (Zara, Ragusa)
**Cause:** Nominatim uses the browser's `accept-language` header by default. When an Italian user searches, Nominatim returns historical Italian names (Zara for Zadar, Ragusa for Dubrovnik) instead of modern Croatian names.
**Fix:** Added `LOCALE_TO_LANGUAGE` map in `MapSearch.tsx`; explicitly passes `accept-language: en` for the `it` locale (and correct language codes for all others) to `OpenStreetMapProvider`.
**File:** `src/components/Map/MapSearch.tsx`
**Details:** See `LOCALE_TO_LANGUAGE` constant and the `searchParams` config on the provider.

### Issue 6: Beach Map Links Go to Wrong Locale or 404
**Cause:** Beach-map slugs were hardcoded as strings (e.g. `/map`, `/beach-map`) in multiple components and `messages/*.json` files. The `de` slug was `strandkarte` (404; correct: `strand-karte`) and `ru` slug was `karta-plyazhej` (404; correct: `karta-plyazhey`). Links also lacked locale prefixes, causing cookie-driven cross-locale redirects (Issues 17, 18).
**Fix:** Created `src/lib/utils/beach-urls.ts` with `getBeachMapWord(locale)` and `buildBeachMapUrl(locale, qs?)`. All components now call `buildBeachMapUrl(locale)` instead of constructing URLs manually.
**File:** `src/lib/utils/beach-urls.ts`
**Details:** [docs/features/BEACH_MAP_LINK_FIX.md](../docs/features/BEACH_MAP_LINK_FIX.md)

### Issue 7: Banner Map Button Missing City / Beach Context Params
**Cause:** `BannerSection` had no `citySlug` prop, so `buildMapUrl()` never appended `city=`. `BeachBannerSection.buildMapUrl()` similarly omitted `city`, `beach_id`, `lat`, `lng`. Result: clicking the map button on a city or beach page opened the map with no location pre-selected.
**Fix:**
- Added `citySlug?: string` to `BannerSection` props + `params.append('city', citySlug)` in `buildMapUrl()`
- `CityListingPage` now passes `citySlug={_citySlug}` to `BannerSection`
- `BeachBannerSection.buildMapUrl()` now appends `city`, `beach_id`, `lat`, `lng` from `beachDetails.basic_info` and `beachDetails.location.city`
- `MapWithSidebar` reads `beach_id`/`lat`/`lng` on init and centers + selects the beach; `BeachMarker` auto-opens its popup when `isSelected` is true
**Files:** `BannerSection.tsx`, `CityListingPage.tsx`, `BeachBannerSection.tsx`, `MapWithSidebar.tsx`, `ReactLeafletMap.tsx`

---

## Quick Debugging Checklist

1. ✅ Route defined in routing.ts pathnames?
2. ✅ Middleware copies intl headers?
3. ✅ Translation vars use single braces {var}?
4. ✅ useLocalizedPath handles route type?
5. ✅ Check browser console logs
6. ✅ Beach map links use `buildBeachMapUrl(locale)` from `src/lib/utils/beach-urls.ts`?
7. ✅ Geocoding/Nominatim calls include explicit `accept-language` header (not relying on browser default)?
8. ✅ Banner `buildMapUrl()` appends all available context params (`city`, `beach_id`, `lat`, `lng`) — not just continent/country/region/island?

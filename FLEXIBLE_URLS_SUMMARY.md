# Flexible Geographic Hierarchy URLs - Summary

## Problem

Your beaches have varying geographic hierarchies:
- ✅ Some have regions, some don't
- ✅ Some are on islands, some aren't  
- ✅ Some have cities, some don't
- ✅ Islands should appear after regions (if region exists) or after country (if no region)

## Solution

I've created a **flexible URL system** that automatically builds correct URLs based on available geographic data.

## What I Created

### 1. **URL Builder** (`src/lib/url-builder.ts`)

Automatically builds URLs with the correct hierarchy:

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';

// Automatically handles missing levels
const url = buildBeachUrlFromDetails(beachDetails);
```

**Examples:**

| Beach Data | Generated URL |
|------------|---------------|
| Croatia, Dalmatia region, Hvar island, Hvar city | `/beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach` |
| Croatia, Hvar island (no region) | `/beaches/europe/croatia/hvar/paradise-beach` |
| Croatia, Dalmatia region (no island, no city) | `/beaches/europe/croatia/dalmatia/beach-name` |
| Monaco (no region, island, or city) | `/beaches/europe/monaco/larvotto-beach` |

### 2. **URL Parser** (`src/lib/url-parser.ts`)

Parses URLs to understand the hierarchy:

```typescript
import { parseUrlWithData } from '@/lib/url-parser';

const parsed = parseUrlWithData(pathname, {
  hasRegion: !!beachDetails.location?.region,
  hasIsland: !!beachDetails.location?.island,
  hasCity: !!beachDetails.location?.city,
  regionSlug: beachDetails.location?.region?.slug,
  islandSlug: beachDetails.location?.island?.slug,
  citySlug: beachDetails.location?.city?.slug,
  beachSlug: beachDetails.basic_info?.slug,
});
```

### 3. **Segment Resolver** (`src/lib/segment-resolver.ts`)

Determines what each URL segment represents by querying the API:

```typescript
import { resolveSegmentType } from '@/lib/segment-resolver';

// Is 'hvar' a region or an island?
const info = await resolveSegmentType('hvar', {
  countryCode: 'HR',
  locale: 'en',
});

console.log(info.type); // 'island'
```

### 4. **Documentation**

- **`GEOGRAPHIC_HIERARCHY_URLS.md`** - Complete technical documentation
- **`IMPLEMENTATION_GUIDE.md`** - Step-by-step implementation guide
- **`FLEXIBLE_URLS_SUMMARY.md`** - This file (quick reference)

## How It Works

### The Hierarchy Rules

```
continent → country → [region] → [island] → [city] → beach
```

Where `[brackets]` = optional

**Key Rules:**
1. Continent and country are always required
2. Region is optional
3. Island comes after region (if region exists) or after country (if no region)
4. City comes after island (if island exists) or after region (if no island)
5. Beach is always last

### URL Building Logic

```typescript
function buildBeachUrl(location) {
  segments = ['beaches'];
  
  if (continent) segments.push(continent);
  if (country) segments.push(country);
  if (region) segments.push(region);      // Optional
  if (island) segments.push(island);      // Optional, after region
  if (city) segments.push(city);          // Optional, after island
  if (beach) segments.push(beach);
  
  return segments.join('/');
}
```

## File Structure Options

### Option A: Keep Current Structure (Easier)

Keep your existing nested folders and add smart detection:

```
src/app/[locale]/beaches/
├── [continent]/
│   └── [country]/
│       └── [region]/          # Could be region, island, or beach
│           └── [city]/        # Could be city, island, or beach
│               └── [slug]/    # Beach detail
```

Each route checks what it's actually displaying using `resolveSegmentType()`.

### Option B: Catch-All Route (Cleaner)

Single route handles all variations:

```
src/app/[locale]/beaches/
├── [continent]/
│   └── [country]/
│       └── [...segments]/     # Handles all: region/island/city/beach
```

See `page.example.tsx` for implementation.

## Quick Start

### 1. Start Using URL Builder

Replace all manual URL construction:

```typescript
// ❌ Old
const url = `/beaches/${continent}/${country}/${region}/${city}/${beach}`;

// ✅ New
import { buildBeachUrlFromDetails } from '@/lib/url-builder';
const url = buildBeachUrlFromDetails(beachDetails);
```

### 2. Update Navigation

```typescript
import { buildBeachUrl } from '@/lib/url-builder';

const nextBeachUrl = buildBeachUrl({
  continent: { code: 'EU', slug: 'europe' },
  country: { code: 'HR', slug: 'croatia' },
  island: { id: 5, slug: 'hvar' },  // No region
  beach: { id: 123, slug: 'paradise-beach' },
});
// Result: /beaches/europe/croatia/hvar/paradise-beach
```

### 3. Add Smart Detection to Routes

```typescript
import { resolveSegmentType } from '@/lib/segment-resolver';

export default async function Page({ params }) {
  const { region } = await params;
  
  // Determine what 'region' actually is
  const info = await resolveSegmentType(region, {
    countryCode: params.country,
    locale: params.locale,
  });
  
  if (info.type === 'island') {
    return <IslandPage island={info.data} />;
  }
  
  if (info.type === 'region') {
    return <RegionPage region={info.data} />;
  }
  
  // etc...
}
```

## Real-World Examples

### Example 1: Croatian Island (Hvar)

**Database:**
```json
{
  "continent_code": "EU",
  "country_code": "HR",
  "region_id": 1,        // Dalmatia
  "island_id": 5,        // Hvar
  "city_id": 10          // Hvar City
}
```

**Generated URL:**
```
/beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach
```

### Example 2: Maldives Island (No Regions)

**Database:**
```json
{
  "continent_code": "AS",
  "country_code": "MV",
  "region_id": null,     // Maldives has no regions
  "island_id": 42,       // Male Atoll
  "city_id": 15          // Male
}
```

**Generated URL:**
```
/beaches/asia/maldives/male-atoll/male/beach-name
```

### Example 3: Monaco (No Subdivisions)

**Database:**
```json
{
  "continent_code": "EU",
  "country_code": "MC",
  "region_id": null,
  "island_id": null,
  "city_id": null
}
```

**Generated URL:**
```
/beaches/europe/monaco/larvotto-beach
```

## API Requirements

You'll need these API endpoints (or add to existing ones):

```
GET /api/v1/regions?country_code={code}&slug={slug}
GET /api/v1/islands?slug={slug}
GET /api/v1/cities?country_code={code}&slug={slug}
GET /api/v1/beach-details/{slug}
```

These are used by `segment-resolver.ts` to determine segment types.

## Migration Checklist

- [x] URL builder utilities created
- [x] URL parser created
- [x] Segment resolver created
- [x] Documentation written
- [ ] Update all URL generation to use `buildBeachUrl()`
- [ ] Add segment detection to existing routes
- [ ] Update breadcrumb component
- [ ] Update navigation (prev/next beach)
- [ ] Test all URL variations
- [ ] Update sitemap generation
- [ ] Add redirects for old URLs (if needed)

## Testing Scenarios

Test these URL patterns:

1. ✅ Full hierarchy: `/beaches/europe/croatia/dalmatia/hvar/hvar-city/beach`
2. ✅ Island without region: `/beaches/asia/maldives/male-atoll/beach`
3. ✅ Region without island: `/beaches/europe/italy/sicily/beach`
4. ✅ Only country: `/beaches/europe/monaco/beach`
5. ✅ Region + city (no island): `/beaches/europe/croatia/dalmatia/split/beach`
6. ✅ Island + city (no region): `/beaches/asia/maldives/male-atoll/male/beach`

## Next Steps

1. **Immediate**: Start using `buildBeachUrl()` in new code
2. **This week**: Add segment detection to existing routes
3. **This month**: Migrate all URL generation to use utilities
4. **Future**: Consider catch-all route structure for cleaner code

## Questions?

- See `GEOGRAPHIC_HIERARCHY_URLS.md` for technical details
- See `IMPLEMENTATION_GUIDE.md` for step-by-step instructions
- See `page.example.tsx` for catch-all route example


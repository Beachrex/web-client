# Geographic Hierarchy URL Structure

## Overview

This document describes the flexible URL structure for handling varying geographic hierarchies in the BeachRex application.

## The Challenge

Beaches can have different geographic hierarchies:
- Some beaches have regions, some don't
- Some beaches are on islands, some aren't
- Some beaches have cities, some don't
- Islands should appear after regions (if region exists) or after country (if no region)

## URL Hierarchy Rules

The geographic hierarchy follows this order:

```
continent → country → [region] → [island] → [city] → beach
```

Where `[brackets]` indicate optional levels.

### Examples

1. **Full hierarchy** (Croatia - Hvar island in Dalmatia region):
   ```
   /beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach
   ```

2. **Island without region** (Maldives - no regions):
   ```
   /beaches/asia/maldives/male-atoll/male/beach-name
   ```

3. **No island, has region and city** (USA - California):
   ```
   /beaches/north-america/usa/california/los-angeles/venice-beach
   ```

4. **Only country level** (Small country):
   ```
   /beaches/europe/monaco/larvotto-beach
   ```

5. **Region but no city** (Large region):
   ```
   /beaches/europe/italy/sicily/beach-name
   ```

6. **Island but no city** (Small island):
   ```
   /beaches/europe/greece/santorini/red-beach
   ```

## File Structure

Instead of creating all possible combinations, we use **catch-all routes**:

```
src/app/[locale]/beaches/
├── page.tsx                                    # World beaches
├── [continent]/
│   ├── page.tsx                               # Continent beaches
│   ├── [country]/
│   │   ├── page.tsx                          # Country beaches
│   │   └── [...segments]/
│   │       └── page.tsx                      # All other levels (region/island/city/beach)
```

The `[...segments]` catch-all route handles all variations:
- `[region]` only
- `[region]/[city]`
- `[region]/[island]`
- `[region]/[island]/[city]`
- `[island]` only
- `[island]/[city]`
- `[city]` only
- Any of the above + `/[beach]`

## Implementation

### 1. Building URLs

Use the `buildBeachUrl()` function from `src/lib/url-builder.ts`:

```typescript
import { buildBeachUrl, buildBeachUrlFromDetails } from '@/lib/url-builder';

// From beach details API response
const url = buildBeachUrlFromDetails(beachDetails);

// Or manually
const url = buildBeachUrl({
  continent: { code: 'EU', slug: 'europe' },
  country: { code: 'HR', slug: 'croatia' },
  region: { id: 1, slug: 'dalmatia' },
  island: { id: 5, slug: 'hvar' },
  city: { id: 10, slug: 'hvar-city' },
  beach: { id: 123, slug: 'paradise-beach' },
});
// Result: /beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach
```

### 2. Parsing URLs

Use the `parseUrlWithData()` function from `src/lib/url-parser.ts`:

```typescript
import { parseUrlWithData } from '@/lib/url-parser';

// In your page component, after fetching beach data
const parsed = parseUrlWithData(pathname, {
  hasRegion: !!beachDetails.location?.region,
  hasIsland: !!beachDetails.location?.island,
  hasCity: !!beachDetails.location?.city,
  regionSlug: beachDetails.location?.region?.slug,
  islandSlug: beachDetails.location?.island?.slug,
  citySlug: beachDetails.location?.city?.slug,
  beachSlug: beachDetails.basic_info?.slug,
});

// Access parsed data
console.log(parsed.continent); // 'europe'
console.log(parsed.island);    // 'hvar'
```

### 3. Catch-All Route Implementation

In `src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx`:

```typescript
interface PageProps {
  params: Promise<{
    locale: string;
    continent: string;
    country: string;
    segments: string[];
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale, continent, country, segments } = await params;
  
  // Segments could be:
  // [] - country level page
  // ['region-slug'] - region page
  // ['island-slug'] - island page
  // ['region-slug', 'island-slug'] - island within region page
  // ['region-slug', 'city-slug'] - city within region page
  // ['region-slug', 'island-slug', 'city-slug'] - city on island in region
  // Any of above + beach slug at the end
  
  // Determine what we're showing based on segments
  const lastSegment = segments[segments.length - 1];
  
  // Fetch data to determine segment types
  // Then render appropriate component
}
```

## Database Structure

The `beach` table has these geographic fields:

```sql
continent_code  VARCHAR(2)   NOT NULL  -- Always required
country_code    VARCHAR(2)   NOT NULL  -- Always required
region_id       BIGINT       NULL      -- Optional
island_id       BIGINT       NULL      -- Optional
city_id         BIGINT       NULL      -- Optional
```

All three (region, island, city) are independent and optional.

## API Response Structure

The beach details API returns location data:

```json
{
  "location": {
    "continent": { "code": "EU", "name": "Europe", "slug": "europe" },
    "country": { "code": "HR", "name": "Croatia", "slug": "croatia" },
    "region": { "id": 1, "name": "Dalmatia", "slug": "dalmatia" },
    "island": { "id": 5, "name": "Hvar", "slug": "hvar" },
    "city": { "id": 10, "name": "Hvar", "slug": "hvar-city" }
  }
}
```

## Navigation Logic

When navigating between beaches, escalate through hierarchy:

1. **Same city**: Navigate within city
2. **No more beaches in city**: Escalate to island level (if exists)
3. **No more beaches on island**: Escalate to region level (if exists)
4. **No more beaches in region**: Escalate to country level
5. **No more beaches in country**: Escalate to continent level

Example implementation:

```typescript
function getNextBeachUrl(currentBeach, allBeaches) {
  // Try to find next beach in same city
  if (currentBeach.city_id) {
    const nextInCity = findNextInCity(allBeaches, currentBeach.city_id);
    if (nextInCity) return buildBeachUrl(nextInCity);
  }
  
  // Try island level
  if (currentBeach.island_id) {
    const nextOnIsland = findNextOnIsland(allBeaches, currentBeach.island_id);
    if (nextOnIsland) return buildBeachUrl(nextOnIsland);
  }
  
  // Try region level
  if (currentBeach.region_id) {
    const nextInRegion = findNextInRegion(allBeaches, currentBeach.region_id);
    if (nextInRegion) return buildBeachUrl(nextInRegion);
  }
  
  // Country level
  const nextInCountry = findNextInCountry(allBeaches, currentBeach.country_code);
  return buildBeachUrl(nextInCountry);
}
```

## Breadcrumbs

Breadcrumbs should reflect the actual hierarchy:

```typescript
// For: /beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach

[
  { name: 'Home', url: '/' },
  { name: 'Beaches', url: '/beaches' },
  { name: 'Europe', url: '/beaches/europe' },
  { name: 'Croatia', url: '/beaches/europe/croatia' },
  { name: 'Dalmatia', url: '/beaches/europe/croatia/dalmatia' },
  { name: 'Hvar', url: '/beaches/europe/croatia/dalmatia/hvar' },
  { name: 'Hvar City', url: '/beaches/europe/croatia/dalmatia/hvar/hvar-city' },
  { name: 'Paradise Beach', url: '/beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach' }
]
```

## SEO Considerations

- Each level should have its own metadata
- URLs should be clean and readable
- Canonical URLs should point to the shortest valid path
- Handle redirects for old URL structures

## Migration Strategy

1. **Phase 1**: Implement new URL utilities (✅ Done)
2. **Phase 2**: Create catch-all route structure
3. **Phase 3**: Update all URL generation to use `buildBeachUrl()`
4. **Phase 4**: Update breadcrumbs and navigation
5. **Phase 5**: Add redirects from old structure
6. **Phase 6**: Update sitemap generation


# Implementation Guide: Flexible Geographic Hierarchy

## Quick Start

You have two options for implementing flexible geographic URLs:

### Option 1: Catch-All Route (Recommended for new implementation)

**Pros:**
- Single route handles all variations
- Easier to maintain
- More flexible for future changes

**Cons:**
- Requires refactoring existing structure
- More complex initial setup

### Option 2: Keep Current Structure + Smart URL Building (Easier migration)

**Pros:**
- Minimal changes to existing code
- Works with current file structure
- Gradual migration possible

**Cons:**
- More files to maintain
- Some URL patterns may need multiple route files

## Recommended Approach: Option 2 (Incremental)

Since you already have the nested folder structure, here's how to make it work with flexible hierarchies:

### Step 1: Use URL Builder Everywhere

Replace all manual URL construction with the `buildBeachUrl()` function:

```typescript
// ❌ Old way
const url = `/beaches/${continent}/${country}/${region}/${city}/${beach}`;

// ✅ New way
import { buildBeachUrlFromDetails } from '@/lib/url-builder';
const url = buildBeachUrlFromDetails(beachDetails);
```

This automatically handles missing levels (region, island, city).

### Step 2: Update Your Current Routes

Keep your existing file structure but make routes handle optional segments:

```
src/app/[locale]/beaches/
├── page.tsx                                           # All beaches
├── [continent]/
│   ├── page.tsx                                      # Continent beaches
│   └── [country]/
│       ├── page.tsx                                  # Country beaches (handles islands without regions)
│       └── [region]/
│           ├── page.tsx                              # Region beaches (handles islands in regions)
│           └── [city]/
│               ├── page.tsx                          # City beaches
│               └── [slug]/
│                   └── page.tsx                      # Beach detail
```

### Step 3: Make Each Route Smart

Each route should check what it's actually displaying:

#### Example: Country Page

```typescript
// src/app/[locale]/beaches/[continent]/[country]/page.tsx

export default async function CountryPage({ params }: PageProps) {
  const { locale, continent, country } = await params;
  
  // This could be:
  // 1. A country listing page: /beaches/europe/croatia
  // 2. An island page: /beaches/europe/croatia/hvar (if 'hvar' is an island, not a region)
  
  // Try to fetch as island first
  const islandData = await fetchIsland(country, locale);
  if (islandData) {
    return <IslandPage island={islandData} />;
  }
  
  // Otherwise, show country listing
  return <CountryListingPage country={country} />;
}
```

#### Example: Region Page

```typescript
// src/app/[locale]/beaches/[continent]/[country]/[region]/page.tsx

export default async function RegionPage({ params }: PageProps) {
  const { locale, continent, country, region } = await params;
  
  // This could be:
  // 1. A region listing: /beaches/europe/croatia/dalmatia
  // 2. An island in region: /beaches/europe/croatia/dalmatia/hvar
  // 3. A city without island: /beaches/europe/croatia/dalmatia/split
  
  // Determine what 'region' parameter actually represents
  const type = await determineSegmentType(region, country, locale);
  
  switch (type) {
    case 'region':
      return <RegionListingPage />;
    case 'island':
      return <IslandListingPage />;
    case 'city':
      return <CityListingPage />;
    default:
      notFound();
  }
}
```

### Step 4: Create Helper to Determine Segment Type

```typescript
// src/lib/segment-resolver.ts

export async function determineSegmentType(
  slug: string,
  countryCode: string,
  locale: string
): Promise<'region' | 'island' | 'city' | 'beach' | null> {
  
  // Try region
  const region = await fetchRegion(slug, countryCode, locale);
  if (region) return 'region';
  
  // Try island
  const island = await fetchIsland(slug, locale);
  if (island) return 'island';
  
  // Try city
  const city = await fetchCity(slug, countryCode, locale);
  if (city) return 'city';
  
  // Try beach
  const beach = await fetchBeach(slug, locale);
  if (beach) return 'beach';
  
  return null;
}
```

### Step 5: Update Navigation

Use the URL builder for all navigation:

```typescript
import { buildBeachUrl } from '@/lib/url-builder';

// In your navigation component
const nextBeachUrl = buildBeachUrl({
  continent: { code: 'EU', slug: 'europe' },
  country: { code: 'HR', slug: 'croatia' },
  island: { id: 5, slug: 'hvar' }, // Region omitted - URL will skip it
  beach: { id: 123, slug: 'paradise-beach' },
});
// Result: /beaches/europe/croatia/hvar/paradise-beach
```

## Practical Examples

### Example 1: Beach with Island but No Region

**Database:**
```
continent_code: 'EU'
country_code: 'HR'
region_id: NULL
island_id: 5
city_id: NULL
```

**Generated URL:**
```
/beaches/europe/croatia/hvar/paradise-beach
```

**Route that handles it:**
```
src/app/[locale]/beaches/[continent]/[country]/[region]/[slug]/page.tsx
```

**In the component:**
```typescript
// The 'region' param is actually 'hvar' (island slug)
// The 'slug' param is 'paradise-beach' (beach slug)

const type = await determineSegmentType(region, country, locale);
if (type === 'island') {
  // This is an island, not a region
  // Fetch beach using island filter
}
```

### Example 2: Beach with Region and Island

**Database:**
```
continent_code: 'EU'
country_code: 'HR'
region_id: 1
island_id: 5
city_id: 10
```

**Generated URL:**
```
/beaches/europe/croatia/dalmatia/hvar/hvar-city/paradise-beach
```

**Route that handles it:**
```
src/app/[locale]/beaches/[continent]/[country]/[region]/[city]/[slug]/page.tsx
```

### Example 3: Beach with Only Country

**Database:**
```
continent_code: 'EU'
country_code: 'MC'
region_id: NULL
island_id: NULL
city_id: NULL
```

**Generated URL:**
```
/beaches/europe/monaco/larvotto-beach
```

**Route that handles it:**
```
src/app/[locale]/beaches/[continent]/[country]/[region]/page.tsx
```

**In the component:**
```typescript
// The 'region' param is actually 'larvotto-beach' (beach slug)
const type = await determineSegmentType(region, country, locale);
if (type === 'beach') {
  // This is a beach, not a region
  return <BeachDetailPage slug={region} />;
}
```

## Migration Checklist

- [ ] Install URL builder utilities (✅ Already created)
- [ ] Update all URL generation to use `buildBeachUrl()`
- [ ] Update breadcrumb component to use URL builder
- [ ] Add segment type detection to existing routes
- [ ] Update navigation (prev/next beach) to use URL builder
- [ ] Update sitemap generation
- [ ] Add redirects for old URLs (if needed)
- [ ] Test all URL variations
- [ ] Update SEO metadata generation

## Testing

Test these scenarios:

1. ✅ Beach with full hierarchy (continent/country/region/island/city/beach)
2. ✅ Beach with island but no region (continent/country/island/beach)
3. ✅ Beach with region but no island (continent/country/region/beach)
4. ✅ Beach with only country (continent/country/beach)
5. ✅ Beach with region and city but no island
6. ✅ Beach with island and city but no region
7. ✅ Listing pages at each level
8. ✅ Navigation between beaches with different hierarchies
9. ✅ Breadcrumbs showing correct hierarchy
10. ✅ SEO metadata for each level

## Next Steps

1. **Immediate**: Start using `buildBeachUrl()` for all new URL generation
2. **Short-term**: Add segment type detection to existing routes
3. **Long-term**: Consider migrating to catch-all route structure for cleaner code


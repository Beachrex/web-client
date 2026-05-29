# Routing Architecture Guide

> **Reference**: How Next.js App Router and dynamic routing work in Beachrex

**Last Updated**: 2026-05-29

---

## Route Hierarchy

Beachrex uses a **geographic hierarchy** for beach discovery:

```
World (Homepage)
  ↓
Continent (e.g., Europe, Asia)
  ↓
Country (e.g., Belgium, Croatia)
  ↓
Region/Island (e.g., Flanders, Crete)
  ↓
City/Town (e.g., Bruges, Chania)
  ↓
Beach (e.g., Zeebrugge Beach)
```

---

## File Structure

```
src/app/[locale]/beaches/
├── page.tsx                                    # All continents listing
├── [continent]/
│   ├── page.tsx                                # Continent page (e.g., Europe)
│   ├── loading.tsx                             # Loading state
│   ├── not-found.tsx                           # 404 page
│   └── [country]/
│       ├── page.tsx                            # Country page (e.g., Belgium)
│       └── [...segments]/
│           └── page.tsx                        # Region/Island/City/Beach (catch-all)
```

---

## Route Patterns

### 1. Continents Listing
**Path**: `/[locale]/beaches`  
**File**: `app/[locale]/beaches/page.tsx`  
**Example**: `/en/beaches`, `/si/plaze`

**Params**: `{ locale: string }`

### 2. Continent Page
**Path**: `/[locale]/beaches/[continent]`  
**File**: `app/[locale]/beaches/[continent]/page.tsx`  
**Example**: `/en/beaches/europe`, `/si/plaze/evropa`

**Params**: `{ locale: string, continent: string }`

### 3. Country Page
**Path**: `/[locale]/beaches/[continent]/[country]`  
**File**: `app/[locale]/beaches/[continent]/[country]/page.tsx`  
**Example**: `/en/beaches/europe/belgium`, `/si/plaze/evropa/belgija`

**Params**: `{ locale: string, continent: string, country: string }`

### 4. Region/Island/City/Beach (Catch-All)
**Path**: `/[locale]/beaches/[continent]/[country]/[...segments]`  
**File**: `app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx`  
**Examples**:
- Region: `/en/beaches/europe/belgium/flanders`
- Island: `/en/beaches/europe/greece/crete`
- City: `/en/beaches/europe/belgium/flanders/bruges`
- Beach: `/en/beaches/europe/belgium/flanders/bruges/zeebrugge-beach`

**Params**: `{ locale: string, continent: string, country: string, segments: string[] }`

**Segment Detection Logic:**
```typescript
const segments = params.segments; // ['flanders', 'bruges', 'zeebrugge-beach']

if (segments.length === 1) {
  // Could be Region, Island, or City
  // Check API to determine type
} else if (segments.length === 2) {
  // [region/island, city] or [city, beach]
} else if (segments.length === 3) {
  // [region, city, beach]
}
```

---

## URL Generation

### Beach URLs

**File**: `src/lib/utils/beach-urls.ts`

**Function**: `buildBeachUrlFromSchema(beach, locale)`

**Logic:**
1. Start with locale and route word: `/si/plaze`
2. Add continent slug: `/si/plaze/evropa`
3. Add country slug: `/si/plaze/evropa/belgija`
4. Add region/island if exists: `/si/plaze/evropa/belgija/flandrija`
5. Add city if exists: `/si/plaze/evropa/belgija/flandrija/brugge`
6. Add beach slug: `/si/plaze/evropa/belgija/flandrija/brugge/zeebrugge-beach`

**Example:**
```typescript
buildBeachUrlFromSchema({
  continent_slug: 'evropa',
  country_slug: 'belgija',
  region_slug: 'flandrija',
  city_slug: 'brugge',
  slug: 'zeebrugge-beach'
}, 'si')

// Returns: /si/plaze/evropa/belgija/flandrija/brugge/zeebrugge-beach
```

### Country URLs

**Function**: `buildCountryUrlFromNavigation(continent, country, locale)`

**Example:**
```typescript
buildCountryUrlFromNavigation(
  { slug: 'evropa' },
  { slug: 'belgija' },
  'si'
)
// Returns: /si/plaze/evropa/belgija
```

---

## Localized Routing

All routes are localized via `src/i18n/routing.ts`:

```typescript
pathnames: {
  '/beaches': {
    en: '/beaches',
    si: '/plaze',
    de: '/strande',
    // ... 14 locales
  },
  '/beaches/[continent]/[country]/[...segments]': {
    en: '/beaches/[continent]/[country]/[...segments]',
    si: '/plaze/[continent]/[country]/[...segments]',
    // ... 14 locales
  }
}
```

**Critical**: Every dynamic route pattern MUST be defined for ALL locales.

---

## Server-Side Data Fetching

### Pattern

**All page components are Server Components:**

```typescript
export default async function Page({ params }: PageProps) {
  const { locale, continent, country } = params;
  
  // Fetch data server-side
  const countryDetails = await fetchCountryDetails(country, locale);
  const beaches = await fetchBeaches(country, locale);
  
  // Pass to client components as props
  return (
    <>
      <ServerComponent data={countryDetails} />
      <ClientComponent data={beaches} />
    </>
  );
}
```

**Benefits:**
- SEO optimization (content in HTML)
- Faster initial load (no client-side API calls)
- Automatic loading states via `loading.tsx`

---

## Navigation Components

### Breadcrumbs

**Component**: `DynamicBreadcrumbs`  
**Type**: Client component  
**Purpose**: Show user's location in hierarchy

**Example:**
```
Home > Beaches > Europe > Belgium > Flanders > Bruges
```

### TopBar

**Component**: `DynamicTopBar`  
**Type**: Client component  
**Features**:
- Language switcher
- Search
- User menu
- Mobile responsive

---

## Adding a New Route Type

### Example: Adding "County" level

1. **Update file structure:**
   ```
   app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx
   ```
   (Already supports this via catch-all)

2. **Add detection logic in catch-all page:**
   ```typescript
   if (segments.length === 1) {
     // Check if it's a county
     const county = await fetchCounty(segments[0]);
     if (county) return <CountyPage />;
   }
   ```

3. **Update URL builders:**
   ```typescript
   // beach-urls.ts
   if (beach.county_slug) {
     url += `/${beach.county_slug}`;
   }
   ```

4. **Update `useLocalizedPath`:**
   ```typescript
   // Handle county translation
   if (segments.length >= 4) {
     const county = await fetchCounty(segments[3]);
     translatedSegments.push(county.slug);
   }
   ```

5. **No routing config changes needed** (catch-all already handles it)

---


# Dynamic Continent System

## Overview

The continent data is now **dynamically fetched from the API** instead of being hardcoded. This means:

✅ **Single source of truth** - API controls continent slugs and data  
✅ **Admin changes reflect immediately** - No frontend code changes needed  
✅ **Only shows continents with beaches** - API filters automatically  
✅ **Accurate beach counts** - Real-time data from database  
✅ **Fully localized** - Slugs change based on language  

## How It Works

### 1. API Endpoint

```bash
curl 'https://dev-api.beachrex.com/api/v1/continents' \
  -H 'accept-language: en'
```

**Response (English):**
```json
{
  "success": true,
  "data": [
    {
      "code": "EU",
      "name": "Europe",
      "slug": "europe",
      "beaches_count": 3774
    }
  ]
}
```

**Response (Slovenian):**
```json
{
  "success": true,
  "data": [
    {
      "code": "EU",
      "name": "Evropa",
      "slug": "evropa",
      "beaches_count": 3774
    }
  ]
}
```

### 2. React Hook

Use the `useContinents()` hook to fetch continent data:

```tsx
import { useContinents } from '@/hooks/useContinents';

function MyComponent() {
  const { continents, loading, error } = useContinents();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {continents.map(continent => (
        <div key={continent.code}>
          <h3>{continent.name}</h3>
          <p>Slug: {continent.slug}</p>
          <p>Beaches: {continent.beaches_count}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Finding Continent by Slug

Use `useContinentBySlug()` for continent detail pages:

```tsx
import { useContinentBySlug } from '@/hooks/useContinents';

function ContinentPage({ params }: { params: { continent: string } }) {
  const { continent, loading, error } = useContinentBySlug(params.continent);

  if (loading) return <div>Loading...</div>;
  if (!continent) return <div>Continent not found</div>;

  return (
    <div>
      <h1>{continent.name}</h1>
      <p>{continent.beaches_count} beaches</p>
    </div>
  );
}
```

### 4. Creating Links

Use the dynamic slug from the API:

```tsx
import { Link } from '@/i18n/routing';
import { useContinents } from '@/hooks/useContinents';

function ContinentLinks() {
  const { continents } = useContinents();

  return (
    <nav>
      {continents.map(continent => (
        <Link 
          key={continent.code}
          href={`/beaches/${continent.slug}` as any}
        >
          {continent.name}
        </Link>
      ))}
    </nav>
  );
}
```

## URL Examples

The same continent will have different URLs in different languages:

| Language | URL | Continent Name |
|----------|-----|----------------|
| English | `/en/beaches/europe` | Europe |
| Slovenian | `/si/plaze/evropa` | Evropa |
| German | `/de/strande/europa` | Europa |
| French | `/fr/plages/europe` | Europe |

## Caching Strategy

The continent data is cached using React Query:

- **Stale Time**: 5 minutes
- **Cache Time**: 10 minutes
- **Refetch on Window Focus**: Disabled
- **Refetch on Mount**: Disabled

This means:
- Data is fetched once and reused across components
- Automatic background updates every 5 minutes
- No unnecessary API calls

## Fallback Behavior

If the API fails, the hook returns fallback data with default continent information:

```typescript
const fallbackContinents = [
  { key: 'europe', code: 'EU', name: 'Europe', slug: 'europe', ... },
  { key: 'africa', code: 'AF', name: 'Africa', slug: 'africa', ... },
  // ... etc
];
```

## Language Switching

When the user changes language:

1. The `ApiClientProvider` updates the `Accept-Language` header
2. React Query cache is invalidated
3. New continent data is fetched with localized slugs
4. All components automatically re-render with new data

## Benefits Over Hardcoded Approach

### Before (Hardcoded)
```typescript
// ❌ Had to manually maintain translations
const continentTranslations = {
  'europe': {
    en: 'europe',
    si: 'evropa',
    de: 'europa',
    // ... 14 languages
  },
  // ... 7 continents
};
```

**Problems:**
- 98 hardcoded translations (7 continents × 14 languages)
- Out of sync if admin changes slug
- No way to know which continents have beaches
- Beach counts always outdated

### After (Dynamic)
```typescript
// ✅ Single API call gets everything
const { continents } = useContinents();
```

**Benefits:**
- Always up-to-date
- Admin controls everything
- Automatic localization
- Real-time beach counts
- Only shows continents with beaches

## Migration Guide

### Old Way (Don't Use)
```typescript
import { continentTranslations } from '@/app/config/continents';

const slug = continentTranslations['europe'][locale];
```

### New Way (Use This)
```typescript
import { useContinents } from '@/hooks/useContinents';

const { continents } = useContinents();
const europeContinent = continents.find(c => c.code === 'EU');
const slug = europeContinent?.slug; // Automatically localized!
```

## Files

- **Hook**: `src/hooks/useContinents.ts`
- **Types**: `src/types/domain.ts`
- **API Client**: `src/lib/api-client/@tanstack/react-query.gen.ts`
- **Provider**: `src/components/ApiClientProvider.tsx`

## Testing

To test different languages:

1. Change language in the UI
2. Check the continent slugs in the URL
3. Verify they match the API response for that language

```bash
# Test English
curl 'https://dev-api.beachrex.com/api/v1/continents' -H 'accept-language: en'

# Test Slovenian
curl 'https://dev-api.beachrex.com/api/v1/continents' -H 'accept-language: si'

# Test German
curl 'https://dev-api.beachrex.com/api/v1/continents' -H 'accept-language: de'
```

## Current Status

✅ **API returns `slug` field** - Confirmed working in production
✅ **OpenAPI spec updated** - `slug` field now in `Continent` schema component
✅ **API client regenerated** - TypeScript types include slug properly
✅ **Hardcoded data removed** - All continent data now comes from API
✅ **Components updated** - Using dynamic API data instead of hardcoded mappings

### Implementation Complete

The `Continent` schema now properly includes the `slug` field:

```typescript
export type Continent = {
  code?: string;
  name?: string;
  slug?: string;  // ✅ Now included in schema!
  beaches_count?: number;
};
```

All components now use dynamic API data with proper TypeScript types.

## Important Notes

1. ✅ **The `slug` field is fully supported** - API returns it, OpenAPI documents it, TypeScript types include it
2. **Always use the slug from the API** - Don't hardcode continent slugs anywhere
3. **The API filters continents** - Only continents with beaches are returned
4. **Beach counts are real-time** - They reflect the actual database state
5. **Slugs are localized** - Different languages get different slugs (europe/evropa/europa)

## Completed Tasks

### Backend ✅
1. ✅ **Added `slug` field to `Continent` schema** in `components.schemas.Continent`
2. ✅ **OpenAPI docs regenerated** with slug field included

### Frontend ✅
1. ✅ **API client regenerated** - TypeScript types now include slug
2. ✅ **Removed hardcoded files**:
   - `src/app/config/continents.ts` (deleted)
   - `src/lib/constants/continentMapping.ts` (deleted)
3. ✅ **Updated components** to use dynamic API data:
   - `src/app/[locale]/beaches/[continent]/page.tsx` - Now uses API slugs
   - `src/hooks/useContinents.ts` - Clean implementation without workarounds
4. ✅ **Dynamic continent system fully operational**

## What Changed

### Before (Hardcoded)
```typescript
// ❌ Hardcoded in src/app/config/continents.ts
export const continentTranslations = {
  'europe': { en: 'europe', si: 'evropa', de: 'europa', ... },
  // ... 98 hardcoded translations
};
```

### After (Dynamic)
```typescript
// ✅ Fetched from API
const { continents } = useContinents();
// continents[0].slug is automatically localized!
```


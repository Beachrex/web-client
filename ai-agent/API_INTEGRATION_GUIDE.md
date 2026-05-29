# API Integration Guide

> **Reference**: How backend API integration works in Beachrex

**Last Updated**: 2026-05-29

---

## Overview

Beachrex frontend communicates with a **REST API** backend via an **auto-generated TypeScript client**.

### Technology Stack
- **OpenAPI Specification**: API contract definition
- **@hey-api/openapi-ts**: TypeScript client generator
- **TanStack Query**: Data fetching, caching, state management

---

## API Client Generation

### Process

1. **Backend** exposes OpenAPI spec at `/api/openapi.json`
2. **Frontend** downloads spec: `openapi-spec.json`
3. **Generator** creates TypeScript client from spec
4. **Import** and use in components/hooks

### Commands

```bash
# Generate API client from spec
yarn generate:api

# Manual download of spec (if needed)
curl https://dev-api.beachrex.com/api/openapi.json > openapi-spec.json
```

### Generated Files

```
src/lib/api-client/
├── client.gen.ts       # API client factory
├── sdk.gen.ts          # Type-safe API methods
├── types.gen.ts        # TypeScript types/interfaces
└── index.ts            # Exports
```

---

## Configuration

### API Base URL

**File**: `src/env.ts`

```typescript
export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }
});
```

**Environment Files:**
```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=https://dev-api.beachrex.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_API_URL=https://api.beachrex.com
NEXT_PUBLIC_BASE_URL=https://beachrex.com
```

### Client Initialization

**File**: `src/components/ApiClientProvider.tsx`

```typescript
export function ApiClientProvider({ locale, children }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  });

  // Initialize API client with locale
  client.setConfig({
    baseUrl: env.NEXT_PUBLIC_API_URL,
    headers: {
      'Accept-Language': locale,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## Using the API

### Pattern 1: Custom Hooks (Recommended)

**Example**: `src/hooks/useCountryDetails.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCountryDetails } from '@/lib/api-client';

export function useCountryDetails(countrySlug: string, locale: string) {
  return useQuery({
    queryKey: ['countryDetails', countrySlug, locale],
    queryFn: () => getCountryDetails({ 
      path: { slug: countrySlug },
      query: { locale }
    }),
    enabled: !!countrySlug,
  });
}
```

**Usage in Component:**
```typescript
function CountryPage({ params }) {
  const { data, isLoading, error } = useCountryDetails(params.country, params.locale);
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <div>{data.name}</div>;
}
```

### Pattern 2: Server-Side Fetching

**Example**: `src/app/[locale]/beaches/[continent]/[country]/page.tsx`

```typescript
import { getCountryDetails } from '@/lib/api-client';

export default async function Page({ params }) {
  const { locale, country } = params;
  
  // Direct API call (not using TanStack Query on server)
  const countryDetails = await getCountryDetails({
    path: { slug: country },
    query: { locale }
  });
  
  return <CountryView data={countryDetails} />;
}
```

---

## Common API Endpoints

### Geography

```typescript
// Continents
getContinents({ query: { locale } })

// Countries
getCountries({ query: { locale } })
getCountryDetails({ path: { slug }, query: { locale } })

// Regions
getRegions({ query: { country_slug, locale } })
getRegionDetails({ path: { slug }, query: { locale } })

// Cities
getCities({ query: { country_slug, locale } })
getCityDetails({ path: { slug }, query: { locale } })

// Islands
getIslands({ query: { country_slug, locale } })
getIslandDetails({ path: { slug }, query: { locale } })
```

### Beaches

```typescript
// List beaches
getBeaches({ 
  query: { 
    locale,
    country_slug?,
    region_slug?,
    city_slug?,
    page: 1,
    page_size: 20
  } 
})

// Beach details
getBeachDetails({ 
  path: { slug },
  query: { locale }
})

// Most visited
getMostVisitedBeaches({ 
  query: { locale, limit: 10 }
})
```

---

## Query Key Patterns

**File**: `src/lib/query-keys.ts`

```typescript
export const queryKeys = {
  continents: (locale: string) => ['continents', locale],
  countryDetails: (slug: string, locale: string) => ['countryDetails', slug, locale],
  beaches: (filters: BeachFilters) => ['beaches', filters],
  beachDetails: (slug: string, locale: string) => ['beachDetails', slug, locale],
};
```

**Benefits:**
- Consistent key naming
- Easy cache invalidation
- Type-safe query keys

---

## Caching Strategy

### Default Options

```typescript
{
  staleTime: 1000 * 60 * 5,  // 5 minutes (data considered fresh)
  cacheTime: 1000 * 60 * 30,  // 30 minutes (cache kept in memory)
  retry: 1,                    // Retry failed requests once
}
```

### Prefetching

**Example**: Prefetch country data on continent page

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { getCountryDetails } from '@/lib/api-client';

function ContinentPage() {
  const queryClient = useQueryClient();
  
  const handleCountryHover = (countrySlug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['countryDetails', countrySlug, locale],
      queryFn: () => getCountryDetails({ 
        path: { slug: countrySlug },
        query: { locale }
      }),
    });
  };
  
  return <CountryCard onMouseEnter={() => handleCountryHover('belgium')} />;
}
```

---

## Error Handling

### Pattern

```typescript
const { data, error, isLoading } = useCountryDetails(slug, locale);

if (error) {
  // Error has type: Error
  console.error('Failed to fetch country:', error.message);
  
  // Check error type
  if (error.message.includes('404')) {
    return <NotFound />;
  }
  
  return <ErrorState message={error.message} />;
}
```

---

## Type Safety

### Generated Types

```typescript
// types.gen.ts
export interface CountryDetails {
  id: number;
  code: string;
  name: string;
  slug: string;
  continent_code: string;
  beaches_count: number;
  main_image?: string;
}

export interface Beach {
  id: number;
  slug: string;
  name: string;
  country_slug: string;
  // ... 50+ fields
}
```

### Usage

```typescript
import type { CountryDetails, Beach } from '@/lib/api-client';

function processCountry(country: CountryDetails) {
  // Full type safety
  console.log(country.name, country.beaches_count);
}
```

---


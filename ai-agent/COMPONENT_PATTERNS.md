# Component Architecture Patterns

> **Reference**: Best practices for React components in Beachrex

**Last Updated**: 2026-05-29

---

## Component Types

### Server Components (Default)

**Location**: `src/app/[locale]/**/page.tsx`

**Characteristics:**
- Render on server
- Can use async/await
- Direct database/API access
- No browser APIs
- No useState, useEffect, event handlers

**Example:**
```typescript
// app/[locale]/beaches/[continent]/page.tsx
export default async function ContinentPage({ params }) {
  // Fetch data server-side
  const continentData = await getContinentDetails(params.continent, params.locale);
  const beaches = await getBeaches({ continent: params.continent });
  
  return (
    <>
      <ContinentHero data={continentData} />
      <BeachGrid beaches={beaches} />
    </>
  );
}
```

### Client Components

**Indicator**: `'use client';` at top of file

**When to Use:**
- Interactive features (clicks, hovers)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect, useTranslations)
- Third-party libraries (Leaflet, carousels)

**Example:**
```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PropertySection({ properties }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('PropertySection');
  
  return (
    <button onClick={() => setExpanded(!expanded)}>
      {expanded ? t('showLess') : t('showMore')}
    </button>
  );
}
```

---

## Component Organization

### Folder Structure

```
components/
├── Beach/                    # Beach-specific components
│   ├── BeachCard.tsx
│   ├── BeachGrid.tsx
│   └── BeachFilters.tsx
├── Continent/                # Continent page components
├── PropertySection.tsx       # Reusable components (top-level)
├── DynamicTopBar.tsx
└── ui/                       # Generic UI components
    ├── Button.tsx
    ├── Card.tsx
    └── Dropdown.tsx
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page components | `Page` suffix | `ContinentPage`, `CountryPage` |
| Feature components | Descriptive name | `PropertySection`, `BeachFilters` |
| UI components | Generic name | `Button`, `Card`, `Dropdown` |
| Dynamic imports | `Dynamic` prefix | `DynamicTopBar`, `DynamicBreadcrumbs` |

---

## Common Patterns

### 1. Data Fetching Pattern

**Server Component (Page):**
```typescript
export default async function CountryPage({ params }) {
  // Fetch on server
  const data = await getCountryDetails(params.country, params.locale);
  
  // Pass to client component
  return <InteractiveSection data={data} locale={params.locale} />;
}
```

**Client Component (Interactive):**
```typescript
'use client';

export default function InteractiveSection({ data, locale }) {
  // Use TanStack Query for client-side updates
  const { data: liveData } = useQuery({
    queryKey: ['beaches', data.id],
    queryFn: () => getBeaches({ country_id: data.id }),
    initialData: data.beaches, // Use server data initially
  });
  
  return <BeachGrid beaches={liveData} />;
}
```

### 2. Translation Pattern

**Server Component:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page({ params }) {
  const t = await getTranslations({ 
    locale: params.locale, 
    namespace: 'countryPage' 
  });
  
  return <h1>{t('title', { country: 'Belgium' })}</h1>;
}
```

**Client Component:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('Common');
  
  return <button>{t('showMore')}</button>;
}
```

### 3. Dynamic Import Pattern

**When**: Large components, map libraries, carousels

**Example:**
```typescript
import dynamic from 'next/dynamic';

const PropertyCarousel = dynamic(
  () => import('./PropertyCarousel'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false, // Disable SSR if needed
  }
);

export default function PropertySection() {
  return <PropertyCarousel items={items} />;
}
```

**Benefits:**
- Smaller initial bundle
- Faster page load
- Code splitting

---

## Reusable Component Examples

### PropertySection

**Purpose**: Display list of beaches/properties with expand/collapse

**Props:**
```typescript
interface PropertySectionProps {
  title: string;              // Section title
  totalCount: number;         // Total items
  properties: Property[];     // Items to display
  headerRight?: ReactNode;    // Optional header action
  controlsBelowHeader?: ReactNode; // Optional controls
}
```

**Usage:**
```typescript
<PropertySection
  title={t('popularBeachesTitle', { country: 'Belgium' })}
  totalCount={120}
  properties={beachProperties}
  headerRight={<Link href="/all">View All</Link>}
/>
```

### DynamicBreadcrumbs

**Purpose**: Show navigation hierarchy

**Props:**
```typescript
interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
    current?: boolean;
  }[];
}
```

**Usage:**
```typescript
<DynamicBreadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Beaches', href: '/beaches' },
    { label: 'Europe', href: '/beaches/europe' },
    { label: 'Belgium', href: '/beaches/europe/belgium', current: true },
  ]}
/>
```

### DynamicTopBar

**Purpose**: Main navigation bar

**Features:**
- Language switcher
- Search
- User menu
- Mobile responsive

**Props:**
```typescript
interface TopBarProps {
  continentName?: string;
  countryName?: string;
  regionName?: string;
  cityName?: string;
  islandName?: string;
  beachName?: string;
}
```

---

## Performance Optimization

### 1. Memoization

**When**: Expensive computations, large lists

```typescript
import { useMemo } from 'react';

function BeachGrid({ beaches, filters }) {
  const filteredBeaches = useMemo(() => {
    return beaches.filter(beach => 
      beach.type === filters.type &&
      beach.rating >= filters.minRating
    );
  }, [beaches, filters]);
  
  return <Grid items={filteredBeaches} />;
}
```

### 2. Virtualization

**When**: Long lists (>100 items)

```typescript
import { FixedSizeList } from 'react-window';

function VirtualizedBeachList({ beaches }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={beaches.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <BeachCard beach={beaches[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 3. Image Optimization

```typescript
import Image from 'next/image';
import { buildCdnUrl } from '@/lib/utils/beach-images';

function BeachCard({ beach }) {
  const imageUrl = buildCdnUrl(beach.main_image, { width: 400, quality: 80 });
  
  return (
    <Image
      src={imageUrl}
      alt={beach.name}
      width={400}
      height={300}
      loading="lazy"
      placeholder="blur"
      blurDataURL="/placeholder.jpg"
    />
  );
}
```

---

## Common Anti-Patterns

### ❌ Don't: Use `'use client'` Unnecessarily

```typescript
// ❌ BAD: Making entire page a client component
'use client';

export default function Page() {
  return <StaticContent />;
}
```

```typescript
// ✅ GOOD: Keep page as server component
export default function Page() {
  return (
    <>
      <StaticContent />
      <InteractiveSection /> {/* Only this is 'use client' */}
    </>
  );
}
```

### ❌ Don't: Fetch Data in Client Components Without Initial Data

```typescript
// ❌ BAD: No loading state, no SSR content
'use client';

function BeachList() {
  const { data } = useQuery({ queryKey: ['beaches'], queryFn: getBeaches });
  return <div>{data?.map(...)}</div>;
}
```

```typescript
// ✅ GOOD: Pass server data as initial
export default async function Page() {
  const initialBeaches = await getBeaches();
  return <BeachList initialData={initialBeaches} />;
}
```

---


# Usage Examples - Flexible Geographic URLs

## Example 1: Building URLs in Components

### Beach Card Component

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';
import { Link } from '@/i18n/routing';

interface BeachCardProps {
  beach: BeachDetailsSchema;
}

export function BeachCard({ beach }: BeachCardProps) {
  // Automatically builds correct URL regardless of hierarchy
  const beachUrl = buildBeachUrlFromDetails(beach);
  
  return (
    <Link href={beachUrl}>
      <div className="beach-card">
        <h3>{beach.basic_info?.name}</h3>
        <p>{beach.location?.country?.name}</p>
      </div>
    </Link>
  );
}
```

### Navigation Component

```typescript
import { useBeachNavigation } from '@/hooks/useGeographicUrl';

interface BeachNavigationProps {
  currentBeach: BeachDetailsSchema;
  nextBeach?: { slug: string; name: string };
  prevBeach?: { slug: string; name: string };
}

export function BeachNavigation({ currentBeach, nextBeach, prevBeach }: BeachNavigationProps) {
  const { buildSameLevelUrl, buildCityUrl, buildIslandUrl } = useBeachNavigation(currentBeach);
  
  return (
    <div className="navigation">
      {prevBeach && (
        <Link href={buildSameLevelUrl(prevBeach.slug) || '#'}>
          ← {prevBeach.name}
        </Link>
      )}
      
      {currentBeach.location?.city && (
        <Link href={buildCityUrl() || '#'}>
          All beaches in {currentBeach.location.city.name}
        </Link>
      )}
      
      {currentBeach.location?.island && (
        <Link href={buildIslandUrl() || '#'}>
          All beaches on {currentBeach.location.island.name}
        </Link>
      )}
      
      {nextBeach && (
        <Link href={buildSameLevelUrl(nextBeach.slug) || '#'}>
          {nextBeach.name} →
        </Link>
      )}
    </div>
  );
}
```

## Example 2: Breadcrumbs

```typescript
import { useBreadcrumbs } from '@/hooks/useGeographicUrl';
import { Link } from '@/i18n/routing';

interface BreadcrumbsProps {
  beachDetails?: BeachDetailsSchema;
}

export function Breadcrumbs({ beachDetails }: BreadcrumbsProps) {
  const breadcrumbs = useBreadcrumbs(beachDetails);
  
  return (
    <nav className="breadcrumbs">
      {breadcrumbs.map((item, index) => (
        <span key={item.url}>
          {index > 0 && <span className="separator">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="current">{item.name}</span>
          ) : (
            <Link href={item.url}>{item.name}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
```

**Output examples:**

```
Home / Beaches / Europe / Croatia / Dalmatia / Hvar / Hvar City / Paradise Beach
Home / Beaches / Asia / Maldives / Male Atoll / Beach Name
Home / Beaches / Europe / Monaco / Larvotto Beach
```

## Example 3: Smart Route Detection

### Flexible Page Component

```typescript
// src/app/[locale]/beaches/[continent]/[country]/[region]/page.tsx

import { resolveSegmentType } from '@/lib/segment-resolver';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
    continent: string;
    country: string;
    region: string;
  }>;
}

export default async function FlexiblePage({ params }: PageProps) {
  const { locale, continent, country, region } = await params;
  
  // Determine what 'region' actually represents
  const segmentInfo = await resolveSegmentType(region, {
    countryCode: country.toUpperCase(),
    locale,
  });
  
  if (!segmentInfo.type) {
    notFound();
  }
  
  // Render appropriate component based on type
  switch (segmentInfo.type) {
    case 'region':
      return <RegionPage region={segmentInfo.data} />;
      
    case 'island':
      return <IslandPage island={segmentInfo.data} />;
      
    case 'city':
      return <CityPage city={segmentInfo.data} />;
      
    case 'beach':
      return <BeachDetailPage beach={segmentInfo.data} />;
      
    default:
      notFound();
  }
}
```

## Example 4: Listing Pages with Filters

```typescript
import { buildListingUrl } from '@/lib/url-builder';
import { useRouter } from '@/i18n/routing';

interface FilteredBeachListProps {
  location: {
    continent: { code: string; slug: string };
    country: { code: string; slug: string };
    region?: { id: number; slug: string };
    island?: { id: number; slug: string };
  };
}

export function FilteredBeachList({ location }: FilteredBeachListProps) {
  const router = useRouter();
  
  const handleIslandFilter = (island: { id: number; slug: string }) => {
    // Build URL with island added to hierarchy
    const url = buildListingUrl({
      ...location,
      island,
    });
    
    router.push(url);
  };
  
  const handleCityFilter = (city: { id: number; slug: string }) => {
    // Build URL with city added to hierarchy
    const url = buildListingUrl({
      ...location,
      city,
    });
    
    router.push(url);
  };
  
  return (
    <div>
      <h2>Filter by Island</h2>
      <button onClick={() => handleIslandFilter({ id: 5, slug: 'hvar' })}>
        Hvar
      </button>
      
      <h2>Filter by City</h2>
      <button onClick={() => handleCityFilter({ id: 10, slug: 'split' })}>
        Split
      </button>
    </div>
  );
}
```

## Example 5: SEO Metadata Generation

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Fetch beach details
  const beach = await fetchBeachDetails(slug, locale);
  
  if (!beach) {
    return {
      title: 'Beach Not Found',
    };
  }
  
  // Build canonical URL
  const canonicalUrl = buildBeachUrlFromDetails(beach);
  
  // Build breadcrumb schema
  const breadcrumbList = buildBreadcrumbSchema(beach);
  
  return {
    title: `${beach.basic_info?.name} - ${beach.location?.country?.name}`,
    description: beach.basic_info?.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: beach.basic_info?.name,
      description: beach.basic_info?.description,
      url: canonicalUrl,
      type: 'website',
    },
    other: {
      'breadcrumb-schema': JSON.stringify(breadcrumbList),
    },
  };
}

function buildBreadcrumbSchema(beach: BeachDetailsSchema) {
  const items = [];
  let position = 1;
  
  items.push({
    '@type': 'ListItem',
    position: position++,
    name: 'Home',
    item: 'https://beachrex.com',
  });
  
  if (beach.location?.continent) {
    items.push({
      '@type': 'ListItem',
      position: position++,
      name: beach.location.continent.name,
      item: `https://beachrex.com/beaches/${beach.location.continent.slug}`,
    });
  }
  
  if (beach.location?.country) {
    items.push({
      '@type': 'ListItem',
      position: position++,
      name: beach.location.country.name,
      item: buildListingUrl({
        continent: beach.location.continent,
        country: beach.location.country,
      }),
    });
  }
  
  // Add region, island, city if they exist...
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
```

## Example 6: Sitemap Generation

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';
import type { MetadataRoute } from 'next';

export async function generateSitemapForBeaches(): Promise<MetadataRoute.Sitemap> {
  // Fetch all beaches
  const beaches = await fetchAllBeaches();
  
  return beaches.map(beach => ({
    url: `https://beachrex.com${buildBeachUrlFromDetails(beach)}`,
    lastModified: beach.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

## Example 7: Search Results

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';

interface SearchResultsProps {
  results: BeachDetailsSchema[];
}

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="search-results">
      {results.map(beach => {
        const url = buildBeachUrlFromDetails(beach);
        const locationParts = [];
        
        if (beach.location?.city) locationParts.push(beach.location.city.name);
        if (beach.location?.island) locationParts.push(beach.location.island.name);
        if (beach.location?.region) locationParts.push(beach.location.region.name);
        if (beach.location?.country) locationParts.push(beach.location.country.name);
        
        return (
          <Link key={beach.basic_info?.id} href={url}>
            <div className="result">
              <h3>{beach.basic_info?.name}</h3>
              <p className="location">{locationParts.join(', ')}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

## Example 8: Related Beaches

```typescript
import { buildBeachUrl } from '@/lib/url-builder';

interface RelatedBeachesProps {
  currentBeach: BeachDetailsSchema;
  relatedBeaches: Array<{
    id: number;
    slug: string;
    name: string;
    location: BeachDetailsSchema['location'];
  }>;
}

export function RelatedBeaches({ currentBeach, relatedBeaches }: RelatedBeachesProps) {
  return (
    <div className="related-beaches">
      <h2>Nearby Beaches</h2>
      
      {relatedBeaches.map(beach => {
        const url = buildBeachUrl({
          continent: beach.location?.continent,
          country: beach.location?.country,
          region: beach.location?.region,
          island: beach.location?.island,
          city: beach.location?.city,
          beach: { id: beach.id, slug: beach.slug },
        });
        
        return (
          <Link key={beach.id} href={url}>
            <div className="related-beach">
              <h3>{beach.name}</h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

## Example 9: Mobile App Deep Links

```typescript
import { buildBeachUrlFromDetails } from '@/lib/url-builder';

export function generateDeepLink(beach: BeachDetailsSchema): string {
  const webUrl = buildBeachUrlFromDetails(beach);
  
  // Convert web URL to deep link
  // beachrex://beaches/europe/croatia/hvar/paradise-beach
  return `beachrex:/${webUrl}`;
}

export function generateUniversalLink(beach: BeachDetailsSchema): string {
  const webUrl = buildBeachUrlFromDetails(beach);
  
  // Universal link that works on both web and mobile
  return `https://beachrex.com${webUrl}`;
}
```

## Example 10: Analytics Tracking

```typescript
import { useGeographicUrl } from '@/hooks/useGeographicUrl';
import { useEffect } from 'react';

export function usePageTracking() {
  const { currentLevel, parsed } = useGeographicUrl();
  
  useEffect(() => {
    // Track page view with geographic context
    analytics.track('page_view', {
      page_type: currentLevel,
      continent: parsed.continent,
      country: parsed.country,
      region: parsed.region,
      island: parsed.island,
      city: parsed.city,
      beach: parsed.beach,
    });
  }, [currentLevel, parsed]);
}
```


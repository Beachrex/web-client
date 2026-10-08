/**
 * Flexible Geography Page - Server Component (SSR)
 *
 * This page handles multiple entity types: beach, region, island, city
 * For Task 0.2, we're converting ONLY the beach detail part to SSR.
 * Other entity types (region, island, city) will be converted in later tasks.
 *
 * Task 0.2: Convert Beach Detail Page to SSR
 * Task 0.6: Add generateStaticParams for Top Beaches
 */

import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import React from 'react';

import { getBeachDetails, resolveSlug, getCountries, getMostVisitedBeaches } from '@/lib/api-client';
import type { AcceptLanguage, BeachDetailsSchema, Country } from '@/lib/api-client/types.gen';
import { buildBeachUrl, getBeachesWord } from '@/lib/utils/beach-urls';
import {
  buildCompleteMetadata,
  buildSelfAlternate,
  buildCanonicalUrl,
} from '@/lib/utils/metadata-helpers';
import {
  truncateTitle,
  truncateDescription,
  sanitizeMetaText,
} from '@/lib/utils/seo-helpers';
import { getBeachShareImage } from '@/lib/utils/beach-images';
import { buildBeachSchema, buildBreadcrumbSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';

// Import page components
import BeachDetailPage from '@/components/Pages/BeachDetailPage';

interface PageProps {
  params: {
    locale: string;
    continent: string;
    country: string;
    segments: string[];
  };
}

/**
 * Generate static params for top beaches (Task 0.6)
 *
 * Pre-generates static pages for the top 100 most visited beaches at build time.
 * This improves performance and SEO by generating pages at build time instead of on-demand.
 *
 * Note: We only generate for English locale to keep build times reasonable.
 * Other locales will be generated on-demand (ISR).
 */
export async function generateStaticParams() {
  try {
    // Fetch top 20 most visited beaches (English only for build time)
    // Reduced from 100 to 20 to prevent API overload during build
    // Other beaches will be generated on-demand (ISR)
    const response = await getMostVisitedBeaches({
      query: {
        limit: 20,
      },
      headers: {
        'Accept-Language': 'en',
      },
    });

    const beaches = response.data?.data ?? [];

    // Generate params for each beach
    const params = beaches
      .filter((beach) => {
        // Only include beaches with all required slugs
        return (
          beach.slug &&
          beach.continent_slug &&
          beach.country_slug &&
          beach.city_slug
        );
      })
      .map((beach) => {
        // Build segments array based on beach location structure
        const segments: string[] = [];

        // Add region if present
        if (beach.region_slug) {
          segments.push(beach.region_slug);
        }

        // Add island if present
        if (beach.island_slug) {
          segments.push(beach.island_slug);
        }

        // Add city (required)
        if (beach.city_slug) {
          segments.push(beach.city_slug);
        }

        // Add beach slug (required)
        segments.push(beach.slug!);

        return {
          locale: 'en',
          continent: beach.continent_slug!,
          country: beach.country_slug!,
          segments,
        };
      });

    console.log(`[generateStaticParams] Generated ${params.length} beach pages for static generation`);

    return params;
  } catch (error) {
    console.error('[generateStaticParams] Error fetching top beaches:', error);
    // Return empty array on error - pages will be generated on-demand
    return [];
  }
}

/**
 * Generate metadata for SEO
 * This runs on the server and generates all SEO tags
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, continent, country, segments } = params;
  const t = await getTranslations({ locale, namespace: 'SEO' });

  // Get the last segment
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return {
      title: 'Page Not Found',
    };
  }

  try {
    // Step 1: Get country code
    let countryCode: string | undefined;
    try {
      const countriesResponse = await getCountries({
        headers: { 'Accept-Language': locale as AcceptLanguage },
      });

      const countryData = countriesResponse.data?.data?.find(
        (c: Country) => c.slug?.toLowerCase() === country.toLowerCase()
      ) ?? null;

      countryCode = countryData?.code;
    } catch {
      // Ignore error - countryCode will remain undefined
    }

    // Step 2: Resolve slug to determine entity type
    const queryParams: {
      country_code?: string;
      segment_count?: number;
      parent_slug?: string;
    } = {};

    if (countryCode) {
      queryParams.country_code = countryCode;
    }

    queryParams.segment_count = segments.length;

    if (segments.length >= 2) {
      queryParams.parent_slug = segments[segments.length - 2];
    }

    const resolveResponse = await resolveSlug({
      path: { slug: lastSegment },
      query: queryParams,
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const entityType = resolveResponse.data?.data?.type;

    // Step 3: Only generate metadata for beach pages
    // Other entity types (region, island, city) will be handled in later tasks
    if (entityType !== 'beach') {
      return {
        title: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
      };
    }

    // Fetch beach details
    const beachResponse = await getBeachDetails({
      path: { identifier: lastSegment },
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const beach = beachResponse.data?.data;

    if (!beach) {
      return {
        title: 'Beach Not Found',
      };
    }

    // Extract beach information
    const beachName = beach.basic_info?.name ?? lastSegment;
    const cityName = beach.location?.city?.name ?? null;
    const countryName = beach.location?.country?.name ?? country;
    const regionName = beach.location?.region?.name ?? null;
    const islandName = beach.location?.island?.name ?? null;

    // Build description from beach description or generate one
    let description = beach.basic_info?.description ?? '';
    if (!description) {
      // Generate description from beach characteristics
      const characteristics: string[] = [];

      // Extract beach type (surface type: sand, stones, rock, etc.)
      const beachType = beach.characteristics?.beach_type;
      if (beachType?.name) {
        characteristics.push(beachType.name);
      }

      // Extract water body type (sea, ocean, lake, etc.)
      const waterBodyType = beach.characteristics?.water_body_type;
      if (waterBodyType?.name) {
        characteristics.push(waterBodyType.name);
      }

      description = t('beachDescriptionFallback', {
        beachName,
        cityName: cityName ?? countryName,
        countryName,
        characteristics: characteristics.join(', '),
      });
    }

    // Sanitize and truncate
    const cleanDescription = sanitizeMetaText(description);
    const truncatedDescription = truncateDescription(cleanDescription);

    // Build title
    const titleParts = [beachName];
    if (cityName) titleParts.push(cityName);
    titleParts.push(countryName);
    titleParts.push('BeachRex');

    const title = truncateTitle(titleParts.join(' - '));

    // Share image: the beach's main photo as a 1200×630 JPEG (link previews on X, Facebook, WhatsApp)
    const mainImage = getBeachShareImage(
      beach.media?.gallery,
      beach.basic_info?.folder_name,
      beach.basic_info?.mobile_upload ?? false,
    );

    // Build canonical URL path with localized "beaches" word
    const beachesWord = getBeachesWord(locale);
    const pathSegments = [];
    if (regionName && beach.location?.region?.slug) {
      pathSegments.push(beach.location.region.slug);
    }
    if (islandName && beach.location?.island?.slug) {
      pathSegments.push(beach.location.island.slug);
    }
    if (cityName && beach.location?.city?.slug) {
      pathSegments.push(beach.location.city.slug);
    }
    if (beach.basic_info?.slug) {
      pathSegments.push(beach.basic_info.slug);
    }

    const canonicalPath = `/${beachesWord}/${continent}/${country}/${pathSegments.join('/')}`;

    // Slugs are localized; other locales' slugs are unknown here, so no cross-locale hreflang
    // (the old helper paired this locale's slugs with every other locale's URL).
    const alternateLanguages = buildSelfAlternate(locale, canonicalPath);

    // Build complete metadata
    return buildCompleteMetadata({
      title,
      description: truncatedDescription,
      locale,
      path: canonicalPath,
      images: mainImage ? [mainImage] : undefined,
      type: 'website',
      alternateLanguages,
    });

  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Beach Details',
    };
  }
}

/**
 * Server Component - Fetches data and determines page type
 */
export default async function FlexibleGeographyPage({ params }: PageProps) {
  const { locale, country, segments } = params;

  // Get the last segment
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    notFound();
  }

  try {
    // Step 1: Get country code
    let countryCode: string | undefined;
    try {
      const countriesResponse = await getCountries({
        headers: { 'Accept-Language': locale as AcceptLanguage },
      });

      const countryData = countriesResponse.data?.data?.find(
        (c: Country) => c.slug?.toLowerCase() === country.toLowerCase()
      ) ?? null;

      countryCode = countryData?.code;
    } catch {
      // Ignore error - countryCode will remain undefined
    }

    // Step 2: Resolve slug to determine entity type
    const queryParams: {
      country_code?: string;
      segment_count?: number;
      parent_slug?: string;
    } = {};

    if (countryCode) {
      queryParams.country_code = countryCode;
    }

    queryParams.segment_count = segments.length;

    if (segments.length >= 2) {
      queryParams.parent_slug = segments[segments.length - 2];
    }

    const resolveResponse = await resolveSlug({
      path: { slug: lastSegment },
      query: queryParams,
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const entityType = resolveResponse.data?.data?.type;

    // Step 3: Handle beach pages (SSR)
    if (entityType === 'beach') {
      const beachResponse = await getBeachDetails({
        path: { identifier: lastSegment },
        headers: { 'Accept-Language': locale as AcceptLanguage },
      });

      const beach = beachResponse.data?.data;

      if (!beach) {
        notFound();
      }

      // Verify URL matches beach location hierarchy
      if (!urlMatchesBeachLocation(segments, beach)) {
        // Log the mismatch for debugging
        const canonicalUrl = buildBeachUrl(beach, locale);
        const requestedPath = `/${params.continent}/${params.country}/${segments.join('/')}`;
        console.warn(`[beaches] URL mismatch detected for beach: ${beach.basic_info?.slug}`);
        console.warn(`  Requested path: ${requestedPath}`);
        console.warn('  API location data:', {
          region: beach.location?.region?.slug,
          island: beach.location?.island?.slug,
          city: beach.location?.city?.slug,
        });
        console.warn(`  Expected canonical URL: ${canonicalUrl}`);
        console.warn('  This indicates incorrect region/city data in the database!');

        // Redirect to canonical URL based on API data
        redirect(canonicalUrl);
      }

      // Build JSON-LD structured data
      const beachesWord = getBeachesWord(locale);
      const pathSegments: string[] = [];
      if (beach.location?.region?.slug) pathSegments.push(beach.location.region.slug);
      if (beach.location?.island?.slug) pathSegments.push(beach.location.island.slug);
      if (beach.location?.city?.slug) pathSegments.push(beach.location.city.slug);
      if (beach.basic_info?.slug) pathSegments.push(beach.basic_info.slug);

      const canonicalPath = `/${beachesWord}/${params.continent}/${params.country}/${pathSegments.join('/')}`;
      const canonicalUrl = buildCanonicalUrl(locale, canonicalPath);

      // Get translations for JSON-LD
      const tSchema = await getTranslations({ locale, namespace: 'SEO' });
      const homeLabel = tSchema('breadcrumbHome');

      // Build breadcrumb schema
      const breadcrumbs = [
        { name: homeLabel, url: buildCanonicalUrl(locale, '/') },
        {
          name: beach.location?.continent?.name ?? params.continent,
          url: buildCanonicalUrl(locale, `/${beachesWord}/${params.continent}`),
        },
        {
          name: beach.location?.country?.name ?? params.country,
          url: buildCanonicalUrl(locale, `/${beachesWord}/${params.continent}/${params.country}`),
        },
        { name: beach.basic_info?.name ?? 'Beach', url: canonicalUrl },
      ];

      const beachSchema = buildBeachSchema(beach, locale, canonicalUrl);
      const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

      // Render beach detail page (SSR) with JSON-LD
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: renderJsonLd(beachSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
          />
          <BeachDetailPage beachDetails={beach} />
        </>
      );
    }

    // Step 4: Handle other entity types (region, island, city) - Client-side for now
    // These will be converted to SSR in later tasks
    if (entityType === 'region') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      const RegionListingPage = require('@/components/Pages/RegionListingPage').default as React.ComponentType<{ regionSlug: string }>;
      return <RegionListingPage regionSlug={lastSegment} />;
    }

    if (entityType === 'island') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      const IslandListingPage = require('@/components/Pages/IslandListingPage').default as React.ComponentType<{ islandSlug: string }>;
      return <IslandListingPage islandSlug={lastSegment} />;
    }

    if (entityType === 'city') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      const CityListingPage = require('@/components/Pages/CityListingPage').default as React.ComponentType<{ citySlug: string }>;
      return <CityListingPage citySlug={lastSegment} />;
    }

    // Unknown entity type
    notFound();

  } catch (error) {
    // Re-throw NEXT_REDIRECT errors - these are expected redirects, not actual errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error('Error fetching page data:', error);
    notFound();
  }
}

/**
 * Helper function to verify URL matches beach location
 */
function urlMatchesBeachLocation(segments: string[], beach: BeachDetailsSchema): boolean {
  const expectedSegments: string[] = [];

  if (beach.location?.region?.slug) {
    expectedSegments.push(beach.location.region.slug);
  }

  if (beach.location?.island?.slug) {
    expectedSegments.push(beach.location.island.slug);
  }

  if (beach.location?.city?.slug) {
    expectedSegments.push(beach.location.city.slug);
  }

  if (beach.basic_info?.slug) {
    expectedSegments.push(beach.basic_info.slug);
  }

  // Check if segments match expected hierarchy
  if (segments.length !== expectedSegments.length) {
    return false;
  }

  // Check each segment
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== expectedSegments[i]) {
      return false;
    }
  }

  return true;
}

// Enable ISR - Revalidate every hour (3600 seconds)
export const revalidate = 3600;


/**
 * Flexible Geography Page - Server Component (SSR)
 *
 * This page handles multiple entity types: beach, region, island, city.
 * All four render on the server: the data is fetched here and passed to the page components,
 * so the HTML has the name (h1), the beach cards and the metadata (TASK-004 SEO).
 *
 * Task 0.2: Convert Beach Detail Page to SSR
 * Task 0.6: Add generateStaticParams for Top Beaches
 */

import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
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
import { buildCdnUrl, getBeachShareImage } from '@/lib/utils/beach-images';
import { NOT_A_VIEW_HEADERS } from '@/lib/utils/beach-views';
import {
  buildBeachSchema,
  buildBreadcrumbSchema,
  buildDestinationSchema,
  renderJsonLd,
} from '@/lib/utils/json-ld-helpers';
import {
  buildDestinationPath,
  buildDestinationSeoText,
  type DestinationKind,
} from '@/lib/utils/destination-seo';
import {
  fetchCityDetails,
  fetchCityPageData,
  fetchIslandDetails,
  fetchIslandPageData,
  fetchRegionDetails,
  fetchRegionPageData,
  type CityDetails,
  type IslandDetails,
  type RegionDetails,
} from '@/lib/server/destination-page-data';

// Import page components
import BeachDetailPage from '@/components/Pages/BeachDetailPage';
import { buildBeachFaqSchema, readBeachFaq, readMetaDescription } from '@/lib/utils/beach-faq';
import RegionListingPage from '@/components/Pages/RegionListingPage';
import IslandListingPage from '@/components/Pages/IslandListingPage';
import CityListingPage from '@/components/Pages/CityListingPage';

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
  setRequestLocale(locale);
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

    // Step 3: Region, island and city pages
    if (entityType === 'region' || entityType === 'island' || entityType === 'city') {
      return await buildDestinationMetadata(entityType, params, t);
    }

    if (entityType !== 'beach') {
      return {
        title: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
      };
    }

    // Fetch beach details
    const beachResponse = await getBeachDetails({
      path: { identifier: lastSegment },
      headers: { 'Accept-Language': locale as AcceptLanguage, ...NOT_A_VIEW_HEADERS },
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

    // TASK-007: the search snippet written for this language wins; else the description or a generated line
    let description = readMetaDescription(beach) ?? beach.basic_info?.description ?? '';
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
  setRequestLocale(locale);

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
        headers: { 'Accept-Language': locale as AcceptLanguage, ...NOT_A_VIEW_HEADERS },
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
      const faqSchema = buildBeachFaqSchema(readBeachFaq(beach), canonicalUrl);

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
          {faqSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: renderJsonLd(faqSchema) }}
            />
          )}
          <BeachDetailPage beachDetails={beach} />
        </>
      );
    }

    // Step 4: Region, island and city pages (SSR: data fetched here, passed as props)
    if (entityType === 'region' || entityType === 'island' || entityType === 'city') {
      return await renderDestinationPage(entityType, params, lastSegment);
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

type Translate = Awaited<ReturnType<typeof getTranslations>>;

const DETAILS_FETCHERS = {
  region: fetchRegionDetails,
  island: fetchIslandDetails,
  city: fetchCityDetails,
} as const;

/**
 * Metadata for a region, island or city page: localized title and description, canonical,
 * self hreflang (slugs are localized, other locales' URLs are unknown) and the banner image.
 */
async function buildDestinationMetadata(
  kind: DestinationKind,
  params: PageProps['params'],
  t: Translate,
): Promise<Metadata> {
  const { locale, continent, country, segments } = params;
  setRequestLocale(locale);
  const slug = segments[segments.length - 1]!;
  const details = await DETAILS_FETCHERS[kind](slug, locale);

  if (!details) {
    return { title: slug.charAt(0).toUpperCase() + slug.slice(1) };
  }

  const name = details.name ?? slug;
  const countryName = details.country?.name ?? country;
  const { title, description } = buildDestinationSeoText(kind, name, countryName, (key, values) =>
    t(key, values),
  );
  const path = buildDestinationPath(locale, continent, country, segments);
  const image = buildCdnUrl(details.main_image, 'banner');

  return buildCompleteMetadata({
    title,
    description,
    locale,
    path,
    images: image ? [image] : undefined,
    type: 'website',
    alternateLanguages: buildSelfAlternate(locale, path),
  });
}

/**
 * Region, island and city pages, rendered on the server with Place + breadcrumb JSON-LD.
 */
async function renderDestinationPage(
  kind: DestinationKind,
  params: PageProps['params'],
  slug: string,
) {
  const { locale, continent, country, segments } = params;
  setRequestLocale(locale);

  let details: RegionDetails | IslandDetails | CityDetails;
  let content: React.ReactNode;

  if (kind === 'region') {
    const data = await fetchRegionPageData(slug, locale);
    if (!data) notFound();
    details = data.details;
    content = <RegionListingPage regionSlug={slug} initialData={data} />;
  } else if (kind === 'island') {
    const data = await fetchIslandPageData(slug, locale);
    if (!data) notFound();
    details = data.details;
    content = <IslandListingPage islandSlug={slug} initialData={data} />;
  } else {
    const data = await fetchCityPageData(slug, locale);
    if (!data) notFound();
    details = data.details;
    content = <CityListingPage citySlug={slug} initialData={data} />;
  }

  const name = details.name ?? slug;
  const countryName = details.country?.name ?? country;
  const beachesWord = getBeachesWord(locale);
  const url = buildCanonicalUrl(locale, buildDestinationPath(locale, continent, country, segments));

  const tSeo = await getTranslations({ locale, namespace: 'SEO' });
  const { description } = buildDestinationSeoText(kind, name, countryName, (key, values) =>
    tSeo(key, values),
  );

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: tSeo('breadcrumbHome'), url: buildCanonicalUrl(locale, '/') },
    {
      name: details.country?.continent?.name ?? continent,
      url: buildCanonicalUrl(locale, `/${beachesWord}/${continent}`),
    },
    { name: countryName, url: buildCanonicalUrl(locale, `/${beachesWord}/${continent}/${country}`) },
    { name, url },
  ]);
  const placeSchema = buildDestinationSchema({
    name,
    url,
    description,
    mainImage: details.main_image,
    latitude: details.latitude,
    longitude: details.longitude,
    countryName: details.country?.name,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
      />
      {content}
    </>
  );
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


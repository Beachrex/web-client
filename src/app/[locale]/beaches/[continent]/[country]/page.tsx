/**
 * Country Page - Server Component (SSR)
 *
 * Task 0.4: Convert Country Pages to SSR
 * - Removed 'use client' directive
 * - Added generateMetadata() for SEO
 * - Fetch data on server
 * - Pass data to existing components
 * - Enable ISR with revalidate
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildCountryUrlFromNavigation } from '@/lib/utils/beach-urls';

import {
  getCities,
  getCountry,
  getIslands,
  getMostVisitedBeaches,
  getRegions,
} from '@/lib/api-client';
import type {
  AcceptLanguage,
  BeachSchema,
  City,
  Island,
  Region,
} from '@/lib/api-client/types.gen';
import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { getBeachesWord } from '@/lib/utils/beach-urls';
import { buildBreadcrumbSchema, buildCountrySchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';
import { buildCanonicalUrl, buildCompleteMetadata, buildSelfAlternate } from '@/lib/utils/metadata-helpers';
import { truncateDescription } from '@/lib/utils/seo-helpers';
import type { CountryDetails } from '@/types/CountryDetails';
import DestinationsSection from '@/components/DestinationsSection';
import { FEATURES } from '@/lib/constants/features';
import AllBeachesLink from '@/components/AllBeachesLink';
import { fetchFirstBeachPage } from '@/lib/server/destination-page-data';
import type { BeachListResponseSchema } from '@/lib/api-client/types.gen';

interface PageProps {
  params: {
    locale: string;
    continent: string;
    country: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * Generate metadata for SEO
 * This runs on the server and generates all SEO tags
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, country: countrySlug } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'SEO' });

  try {
    // Fetch country details
    const countryResponse = await getCountry({
      path: { codeOrSlug: countrySlug },
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const countryDetails = countryResponse.data?.data;

    if (!countryDetails) {
      return {
        title: 'Country Not Found',
      };
    }

    const countryName = countryDetails.name ?? countryDetails.full_name ?? countrySlug;
    const beachCount = countryDetails.beaches_count ?? 0;

    const continentSlug = params.continent;


    // Build title and description
    const title = t('countryTitle', {
      countryName,
      beachCount: beachCount.toString(),
    });
    const description = truncateDescription(
      t('countryDescription', {
        countryName,
        beachCount: beachCount.toString(),
      })
    );

    // Build canonical path with localized "beaches" word
    const beachesWord = getBeachesWord(locale);
    const canonicalPath = `/${beachesWord}/${continentSlug}/${countrySlug}`;

    // Build image URL
    const imageUrl = countryDetails.main_image
      ? buildCdnUrl(countryDetails.main_image, 'banner')
      : null;

    return buildCompleteMetadata({
      title,
      description,
      locale,
      // Localized slugs: other locales' URLs are unknown here, so no cross-locale hreflang
      alternateLanguages: buildSelfAlternate(locale, canonicalPath),
      path: canonicalPath,
      images: imageUrl ? [imageUrl] : undefined,
      type: 'website',
    });
  } catch (error) {
    console.error('Error generating country metadata:', error);
    return {
      title: 'Country Beaches',
    };
  }
}

/**
 * Server Component - Fetches data on server
 */
export default async function Page({ params }: PageProps) {
  const { locale, country: countryParam } = params;
  setRequestLocale(locale);

  const tCountry = await getTranslations({ locale, namespace: 'countryPage' });
  const tProperty = await getTranslations({ locale, namespace: 'PropertySection' });

  // Fetch all data on server
  let countryDetails: CountryDetails | null = null;
  let regions: Region[] = [];
  let cities: City[] = [];
  let islands: Island[] = [];
  let mostVisited: BeachSchema[] = [];
  let firstBeachPage: BeachListResponseSchema | null = null;
  let countryStatus: number | undefined;

  try {
    // Fetch country details
    const countryResponse = await getCountry({
      path: { codeOrSlug: countryParam },
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });
    countryDetails = countryResponse.data?.data ?? null;
    countryStatus = countryResponse.response?.status;

    const countryCode = countryDetails?.code;

    if (countryCode) {
      // Fetch all related data in parallel
      const [regionsResponse, citiesResponse, islandsResponse, mostVisitedResponse, firstPageResponse] =
        await Promise.all([
          getRegions({
            query: { country_code: countryCode },
            headers: { 'Accept-Language': locale as AcceptLanguage },
          }),
          getCities({
            query: { country_code: countryCode },
            headers: { 'Accept-Language': locale as AcceptLanguage },
          }),
          getIslands({
            query: { country_code: countryCode },
            headers: { 'Accept-Language': locale as AcceptLanguage },
          }),
          getMostVisitedBeaches({
            query: { country_code: countryCode, limit: 20 },
            headers: { 'Accept-Language': locale as AcceptLanguage },
          }),
          fetchFirstBeachPage({ country: countryCode }, locale),
        ]);

      regions = regionsResponse.data?.data ?? [];
      cities = citiesResponse.data?.data ?? [];
      islands = islandsResponse.data?.data ?? [];
      mostVisited = mostVisitedResponse.data?.data ?? [];
      firstBeachPage = firstPageResponse;
    }
  } catch (error) {
    console.error('Error fetching country page data:', error);
    // Continue with empty data - components will handle gracefully
  }

  // Unknown country: a real 404 (before, `countryDetails.code` crashed with a 500). An unreachable API stays an
  // error, so ISR keeps serving the last good page instead of caching a 404 for a real country.
  if (!countryDetails?.code) {
    if (countryStatus === 404) notFound();
    throw new Error(`Country page data unavailable (${countryParam}, API status ${countryStatus ?? 'none'})`);
  }

  const countryName =
    countryDetails?.name ??
    countryDetails?.full_name ??
    countryParam.toUpperCase();

  const countryBeachesCount = countryDetails?.beaches_count ?? 0;
  const countryAccommodationsCount = 0;

  // Process most visited beaches
  const mostVisitedSet = new Set(
    mostVisited
      .map((b) => b.id)
      .filter((id): id is number => typeof id === 'number'),
  );

const beachProperties: Property[] =
  mostVisited.map((beach) => {
    const p = mapBeachToProperty(
      beach,
      { mostVisitedSet, locationFallback: countryName, locale },
    );

    if (!p) return null;

    return {
      ...p,
      beachUrl:
        buildBeachUrlFromSchema(beach, locale) ?? undefined,
    };
  }).filter(Boolean) as Property[];


  // Build canonical path for DynamicTopBar
  const beachesWord = getBeachesWord(locale);
  const continentSlug = countryDetails?.continent?.slug ?? params.continent;
  const pathname = `/${beachesWord}/${continentSlug}/${countryParam}`;

  /* Regions / Cities / Islands */
  const regionItems =
  regions?.map((r) => ({
    ...r,
    image: buildCdnUrl(r.main_image, 'list'),
    location: {
      continent_slug: continentSlug,
      country_slug: countryDetails?.slug ?? params.country,
      region_slug: r.slug,
    },
  })) ?? [];

  const cityItems =
    cities?.map((c) => ({
      ...c,
      image: buildCdnUrl(c.main_image, 'list'),
    })) ?? [];

  const islandItems =
    islands?.map((i) => ({
      ...i,
      image: buildCdnUrl(i.main_image, 'list'),
    })) ?? [];

  const bannerImage = buildCdnUrl(countryDetails?.main_image, 'banner');

  const bottomBadges =
    countryDetails?.badges
      ?.filter((b) => b.name)
      ?.map((b) => ({
        label: b.name!,
        icon: b.icon ? buildCdnUrl(b.icon, 'icon') : null,
      })) ?? [];

  const topBarCountry = countryDetails
    ? {
        code: countryDetails.code,
        name: countryDetails.name,
      }
    : undefined;

  const infoCards = mapArticlesToInfoCards(
    countryDetails?.articles,
    locale,
  );


  // Pre-compute navigation URLs on the server (can't pass functions to client components)
  const navigationWithUrls = countryDetails?.navigation ? {
    previous: countryDetails.navigation.previous ? {
      ...countryDetails.navigation.previous,
      url: buildCountryUrlFromNavigation(
        {
          slug: countryDetails.navigation.previous.slug ?? undefined,
          location: countryDetails.navigation.previous.location ?? undefined,
        },
        locale
      ),
    } : null,
    next: countryDetails.navigation.next ? {
      ...countryDetails.navigation.next,
      url: buildCountryUrlFromNavigation(
        {
          slug: countryDetails.navigation.next.slug ?? undefined,
          location: countryDetails.navigation.next.location ?? undefined,
        },
        locale
      ),
    } : null,
  } : undefined;

  /* ---------------------------------------------
     BUILD JSON-LD STRUCTURED DATA
  ---------------------------------------------- */
  const canonicalPath = `/${beachesWord}/${params.continent}/${params.country}`;
  const canonicalUrl = buildCanonicalUrl(locale, canonicalPath);

  // Build breadcrumb schema
  // Get translations for JSON-LD
  const tSchema = await getTranslations({ locale, namespace: 'SEO' });
  const homeLabel = tSchema('breadcrumbHome');
  const schemaDescription = countryDetails
    ? tSchema('countrySchemaDescription', {
        beachCount: countryBeachesCount.toString(),
        countryName: countryDetails.name ?? params.country,
      })
    : undefined;

  const breadcrumbs = [
    { name: homeLabel, url: buildCanonicalUrl(locale, '/') },
    {
      name: countryDetails?.continent?.name ?? params.continent,
      url: buildCanonicalUrl(locale, `/${beachesWord}/${params.continent}`),
    },
    { name: countryName, url: canonicalUrl },
  ];

  const countrySchema = countryDetails
    ? buildCountrySchema(countryDetails, locale, canonicalUrl, schemaDescription)
    : null;
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  /* ---------------------------------------------
     RENDER PAGE
  ---------------------------------------------- */
  return (
    <>
      {countrySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(countrySchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
      />

      <DynamicTopBar
  pathname={pathname}
  navigation={navigationWithUrls}
  variant="country"
      />


      <BannerSection
        image={bannerImage}
        title={countryName}
        topBarVariant="country"
        country={topBarCountry}
        continent={countryDetails?.continent}
        accommodationCount={countryAccommodationsCount}
        beachCount={countryBeachesCount}
        badges={bottomBadges.length ? bottomBadges : undefined}
        infoCards={infoCards.length ? infoCards : undefined}
        continentCode={countryDetails?.continent?.code}
        countryCode={countryDetails?.code}
      />

      {/* --------------------------
          POPULAR BEACHES SECTION
      --------------------------- */}
      <PropertySection
        title={tCountry('popularBeachesTitle', { country: countryName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <AllBeachesLink label={tProperty('allBeachesLink', { count: countryBeachesCount })} />
        }
      />

      {/* Hidden for launch: no accommodation source yet (fake cards) */}
      {FEATURES.accommodation && (
        <AccommodationSection
          title={tCountry('featuredAccommodationTitle', { country: countryName })}
          totalCount={countryAccommodationsCount}
          showDropdown={false}
        />
      )}

     <DestinationsSection
  context="country"
  contextName={countryName}
  sections={[
    {
      type: 'region',
      items: regionItems,
      titleKey: 'regionsTitle',
      countKey: 'allRegionsCount',
      badgeKey: 'regionBadge',
      cardVariant: 'region',
    },
    {
      type: 'city',
      items: cityItems,
      titleKey: 'citiesTitle',
      countKey: 'allCitiesCount',
      badgeKey: 'cityBadge',
      cardVariant: 'city',
    },
    {
      type: 'island',
      items: islandItems,
      titleKey: 'islandsTitle',
      countKey: 'allIslandsCount',
      badgeKey: 'islandBadge',
      cardVariant: 'island',
    },
  ]}
     />


    <DynamicSearchBeaches
  translationNamespace="countryPage"
  titleKey="browseBeachesTitle"
  titleParams={{ country: countryName }}
  filterButtonColor="#DD0000"
  hiddenFilterKeys={['country']}
  baseFilters={{
    country: countryDetails.code,
  }}
  initialPage={firstBeachPage}
  optionScopeFilters={{
    country: countryDetails.code, // filter-options endpoint
  }}


    />


    </>
  );
}

// Enable ISR - Revalidate every hour (3600 seconds)
export const revalidate = 3600;

/**
 * No paths are rendered at build time (the build must not depend on the API); every page is rendered on its first
 * visit and then served from the cache (ISR, see `revalidate`). Without this, Next 14 renders every request.
 */
export function generateStaticParams() {
  return [];
}

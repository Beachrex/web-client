/**
 * Continent Page - Server Component (SSR)
 *
 * Task 0.5: Convert Continent Page to SSR with comprehensive SEO metadata
 */

import BannerSection from '@/components/BannerSection/BannerSection';
import ContinentCountriesSection from '@/components/Continent/ContinentCountriesSection';
import SearchContinent from '@/components/Continent/SearchContinent';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';
import { PropertySection } from '@/components/PropertySection';

import {
  getContinent,
  getContinents,
  getMostVisitedBeaches,
} from '@/lib/api-client/sdk.gen';

import type { AcceptLanguage } from '@/lib/api-client/types.gen';
import { beachesToProperties } from '@/lib/utils/beach-properties';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { getBeachesWord } from '@/lib/utils/beach-urls';
import { buildBreadcrumbSchema, buildContinentSchema, renderJsonLd } from '@/lib/utils/json-ld-helpers';
import { buildCanonicalUrl, buildCompleteMetadata, buildPlaceAlternates } from '@/lib/utils/metadata-helpers';
import { truncateDescription } from '@/lib/utils/seo-helpers';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { breadcrumbLabels } from '@/lib/utils/breadcrumb-labels';
import { mapPlacePills } from '@/lib/mappers/mapPlacePills';


interface PageProps {
  params: Promise<{
    locale: string;
    continent: string;
  }>;
}

// ---------------- VALIDATION -----------------

const validateAndGetContinentCode = async (
  continentSlug: string,
  locale: string,
): Promise<string | null> => {
  try {
    const { data: continentsResponse } = await getContinents({
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const continent = continentsResponse?.data?.find(
      (c) => c.slug?.toLowerCase() === continentSlug.toLowerCase(),
    );

    return continent?.code ?? null;
  } catch {
    return null;
  }
};

// ---------------- METADATA -----------------

/**
 * Generate metadata for SEO
 * This runs on the server and generates all SEO tags
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  setRequestLocale(resolvedParams.locale);
  const { locale, continent: continentSlug } = resolvedParams;
  const t = await getTranslations({ locale, namespace: 'SEO' });

  try {
    // Validate and get continent code
    const continentCode = await validateAndGetContinentCode(continentSlug, locale);

    if (!continentCode) {
      return {
        title: 'Continent Not Found',
      };
    }

    // Fetch continent details
    const { data } = await getContinent({
      path: { code: continentCode },
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const continent = data?.data;

    if (!continent) {
      return {
        title: 'Continent Not Found',
      };
    }

    const continentName = continent.name ?? continentSlug;
    const beachCount = continent.beaches_count ?? 0;

    // Build title and description
    const title = t('continentTitle', {
      continentName,
      beachCount: beachCount.toString(),
    });
    const description = truncateDescription(
      t('continentDescription', {
        continentName,
        beachCount: beachCount.toString(),
        countryCount: '0', // TODO: Add countries_count to API response
      })
    );

    // Build canonical path with localized "beaches" word
    const beachesWord = getBeachesWord(locale);
    const canonicalPath = `/${beachesWord}/${continentSlug}`;

    // Build image URL
    const imageUrl = continent.main_image
      ? buildCdnUrl(continent.main_image, 'banner')
      : null;

    return buildCompleteMetadata({
      title,
      description,
      locale,
      // hreflang for all 19 languages (pre-launch 2026-10-23)
      alternateLanguages: await buildPlaceAlternates(locale, canonicalPath, { continent: continent.code ?? null }),
      path: canonicalPath,
      images: imageUrl ? [imageUrl] : undefined,
      type: 'website',
    });
  } catch (error) {
    console.error('Error generating continent metadata:', error);
    return {
      title: 'Continent Beaches',
    };
  }
}

// ---------------- PAGE -----------------

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  setRequestLocale(resolvedParams.locale);
  const beachesWord = getBeachesWord(resolvedParams.locale);
  const pathname = `/${beachesWord}/${resolvedParams.continent}`;

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });

  try {
    // 1) Validate + get full continent code
    const continentCode = await validateAndGetContinentCode(
      resolvedParams.continent,
      resolvedParams.locale,
    );

    if (!continentCode) notFound();

    // 2) Fetch continent details
    const { data: continentResponse } = await getContinent({
      path: { code: continentCode },
      headers: { 'Accept-Language': resolvedParams.locale as AcceptLanguage },
    });

    const continent = continentResponse?.data;
    if (!continent) notFound();

    // 3) Fetch most visited beaches (now includes gallery!)
    const { data: mostVisitedResponse } = await getMostVisitedBeaches({
      query: {
        continent_code: continentCode,
        limit: 20,
      },
      headers: {
        'Accept-Language': resolvedParams.locale as AcceptLanguage,
      },
    });

    const mostVisited = mostVisitedResponse?.data ?? [];

    // 4) Cards with the same media rules as the beach page
    const transformedProperties = beachesToProperties(mostVisited, resolvedParams.locale);

    const bannerImage = continent.main_image
      ? buildCdnUrl(continent.main_image, 'banner')
      : null;

    // ---------------- BUILD JSON-LD STRUCTURED DATA -----------------
    const beachesWord = getBeachesWord(resolvedParams.locale);
    const canonicalPath = `/${beachesWord}/${resolvedParams.continent}`;
    const canonicalUrl = buildCanonicalUrl(resolvedParams.locale, canonicalPath);

    // Get translations for JSON-LD
    const tSchema = await getTranslations({ locale: resolvedParams.locale, namespace: 'SEO' });
    const homeLabel = tSchema('breadcrumbHome');
    const schemaDescription = tSchema('continentSchemaDescription', {
      beachCount: (continent.beaches_count ?? 0).toString(),
      continentName: continent.name ?? resolvedParams.continent,
    });

    // Build breadcrumb schema
    const breadcrumbs = [
      { name: homeLabel, url: buildCanonicalUrl(resolvedParams.locale, '/') },
      { name: continent.name ?? resolvedParams.continent, url: canonicalUrl },
    ];

    const continentSchema = buildContinentSchema(
      continent,
      resolvedParams.locale,
      canonicalUrl,
      schemaDescription
    );
    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

    // ---------------- RENDER -----------------

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(continentSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
        />

        {/* Breadcrumbs */}
    <DynamicTopBar
  pathname={pathname}
        breadcrumbLabels={breadcrumbLabels(continent)}
  variant="continent"
    />

        {/* Banner */}
        <BannerSection
          image={bannerImage}
          title={continent.name ?? ''}
          continent={continent}
          accommodationCount={continent.accommodation_count ?? 0}
          beachCount={continent.beaches_count ?? 0}
          topBarVariant="continent"
          continentCode={continent.code}
          {...mapPlacePills(resolvedParams.locale, { continent })}
        />

        {/* Most visited */}
        <PropertySection
          title={t('popularDestinations', { continent: continent.name })}
          totalCount={transformedProperties.length}
          properties={transformedProperties}
        />

        {/* Search continent */}
        <SearchContinent
          continent={continent}
          continentSlug={resolvedParams.continent}
        />

        {/* Countries of this continent */}
        <ContinentCountriesSection
          title={t('countriesContinent', { continent: continent.name ?? '' })}
          continentCode={continentCode}
        />

        {/* Search beaches */}
        <DynamicSearchBeaches
  translationNamespace="SearchBeach"
  titleKey="title"
  titleParams={{ continent: continent.name ?? '' }}
  filterButtonColor="#5E1CA5"
  baseFilters={{
    continent_code: continentCode,
  }}
  hiddenFilterKeys={['continent_code']}
        />


      </>
    );
  } catch (error) {
    console.error('Error loading continent:', error);
    notFound();
  }
};

export default Page;

/**
 * ISR Configuration
 * Revalidate continent pages every hour (3600 seconds)
 */
export const revalidate = 3600;

/**
 * No paths are rendered at build time (the build must not depend on the API); every page is rendered on its first
 * visit and then served from the cache (ISR, see `revalidate`). Without this, Next 14 renders every request.
 */
export function generateStaticParams() {
  return [];
}

/**
 * Homepage - Server Component (SSR)
 *
 * Task 0.3: Convert Homepage to SSR
 * - Removed 'use client' directive
 * - Added generateMetadata() for SEO
 * - Fetch data on server
 * - Pass data to existing components (they remain client components)
 * - Enable ISR with revalidate
 */

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

import BeachCategorySearch from '@/components/Home/BeachCategorySearch';
import HeroSection from '@/components/Home/HeroSection';
import HomeAccommodationSection from '@/components/Home/HomeAccommodationSection';
import TopDestinationsSection from '@/components/Home/TopDestinationSection';
import WorldMapSection from '@/components/Home/WorldMapSection';
import BeachMediaSection from '../../components/Home/BeachMediaSection';
import ExploreSection from '../../components/Home/ExploreSection';
import { getCountries, getFirstPageContent } from '@/lib/api-client';
import type { AcceptLanguage, FirstPageContent, Country } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildCompleteMetadata } from '@/lib/utils/metadata-helpers';

interface PageProps {
  params: {
    locale: string;
  };
}

/**
 * Generate metadata for SEO
 * This runs on the server and generates all SEO tags
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'SEO' });

  const title = t('homeTitle');
  const description = t('homeDescription');

  // Build complete metadata with localized alternate languages
  return buildCompleteMetadata({
    title,
    description,
    locale,
    path: '/',
    type: 'website',
  });
}

/**
 * Server Component - Fetches data on server
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const tFeature = await getTranslations({ locale, namespace: 'FeatureCards' });
  const tRoutes = await getTranslations({ locale, namespace: 'routes' });

  // Fetch all data on server
  let countries: Country[] = [];
  let sections: Record<string, FirstPageContent> = {};

  try {
    // Fetch countries
    const countriesResponse = await getCountries({
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });
    countries = countriesResponse.data?.data ?? [];

    // Fetch first page content
    const contentResponse = await getFirstPageContent({
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    // Convert array to object keyed by code for easy access
    const contentData = contentResponse.data?.data ?? [];
    sections = contentData.reduce((acc, section) => {
      if (section.code) {
        acc[section.code] = section;
      }
      return acc;
    }, {} as Record<string, FirstPageContent>);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Continue with empty data - components will handle gracefully
  }

  // Extract sections
  const coastalDestinations = sections.coastal_destinations;
  const browseMap = sections.browse_map;
  const findBeach = sections.find_beach;
  const beachViews = sections.beach_views;
  const accommodation = sections.accommodation;
  const featuredSections = sections.featured_sections;
  const footerText = sections.footer_text;

  // Process browse map data
  let mapImageUrl = '';
  if (browseMap?.media && browseMap.media.length > 0) {
    const image = browseMap.media.find(m => m.is_primary) ?? browseMap.media[0];
    mapImageUrl = buildCdnUrl(image?.url, 'carousel') ?? '';
  }

  // Process beach views data
  const beachViewsItems = beachViews?.items?.map((item, index) => {
    const icon = item.media?.find(m => m.type === 'icon');
    const backgroundImage = item.media?.find(m => m.type === 'image');
    return {
      id: item.id ?? index,
      title: item.title ?? '',
      iconUrl: buildCdnUrl(icon?.url, 'icon') ?? '',
      backgroundUrl: buildCdnUrl(backgroundImage?.url, 'carousel') ?? '',
    };
  }) ?? [];

  // Process accommodation images
  const accommodationImages = accommodation?.media?.map(m => buildCdnUrl(m.url, 'carousel')).filter((url): url is string => url !== null) ?? [];

  // Process featured sections data
  // Button configurations (hardcoded for now - can be moved to API config later)
  const buttonConfigs = [
    { label: tFeature('beachMapButton'), icon: '/images/map.png', bgColor: '#1A3C68', textColor: '#FFFFFF', url: tRoutes('beachMap') },
    { label: tFeature('browseBlogButton'), icon: '/images/blog.png', bgColor: '#F5F5F5', textColor: '#4D4D4D', url: tRoutes('blog') },
    { label: tFeature('browseAccommodationsButton'), icon: '/images/accomodation.png', bgColor: '#006b4f', textColor: '#FFFFFF', url: tRoutes('accommodations') },
    { label: tFeature('beachMapButton'), icon: '/images/map.png', bgColor: '#1A3C68', textColor: '#FFFFFF', url: tRoutes('beachMap') },
  ];

  const featuredItems = featuredSections?.items?.map((item, index) => {
    const backgroundImage = item.media?.find(m => m.type === 'image');
    const config = buttonConfigs[index] ?? buttonConfigs[0] ?? {
      label: '',
      icon: '',
      bgColor: '#1A3C68',
      textColor: '#FFFFFF',
      url: '',
    };

    return {
      id: item.id ?? index,
      title: item.title ?? '',
      backgroundImageUrl: buildCdnUrl(backgroundImage?.url, 'carousel') ?? '',
      buttonLabel: config.label,
      buttonIconUrl: config.icon,
      buttonBgColor: config.bgColor,
      buttonTextColor: config.textColor,
      buttonUrl: config.url,
    };
  }) ?? [];

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* World Map Section */}
      {browseMap && (
        <WorldMapSection
          title={browseMap.title ?? ''}
          description={browseMap.description ?? ''}
          mapImageUrl={mapImageUrl}
          buttonLabel={tFeature('beachMapButton')}
          buttonUrl={tRoutes('beachMap')}
        />
      )}

      {/* Beach Category Search Section */}
      {findBeach && (
        <BeachCategorySearch
          title={findBeach.title ?? ''}
          description={findBeach.description ?? ''}
          seaBeachesLabel={t('seaBeaches')}
          lakeBeachesLabel={t('lakeBeaches')}
          riverBeachesLabel={t('riverBeaches')}
          outdoorPoolsLabel={t('outdoorPools')}
          indoorPoolsSpasLabel={t('indoorPoolsSpas')}
        />
      )}

      {/* Beach Media Section */}
      {beachViews && beachViewsItems.length > 0 && (
        <BeachMediaSection
          title={beachViews.title ?? ''}
          items={beachViewsItems}
        />
      )}

      {/* Accommodation Section */}
      {accommodation && (
        <HomeAccommodationSection
          title={accommodation.title ?? ''}
          description={accommodation.description ?? ''}
          images={accommodationImages}
          buttonLabel={t('browseAccommodationsButton')}
          moreLabel={t('moreAccommodations')}
        />
      )}

      {/* Top Destinations Section */}
      {coastalDestinations && (
        <TopDestinationsSection
          title={coastalDestinations.title ?? ''}
          items={countries}
          countLabel={t('allCountriesCount', { count: countries.length })}
          badgeLabel={t('seaExperiences')}
        />
      )}

      {/* Explore Section */}
      {featuredSections && footerText && featuredItems.length > 0 && (
        <ExploreSection
          items={featuredItems}
          tagline={footerText.title ?? ''}
        />
      )}
    </>
  );
}

// Enable ISR - Revalidate every hour (3600 seconds)
export const revalidate = 3600;

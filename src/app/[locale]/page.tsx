'use client';
import BeachCategorySearch from '@/components/Home/BeachCategorySearch';
import HeroSection from '@/components/Home/HeroSection';
import HomeAccommodationSection from '@/components/Home/HomeAccommodationSection';
import TopDestinationsSection from '@/components/Home/TopDestinationSection';
import WorldMapSection from '@/components/Home/WorldMapSection';
import BeachMediaSection from '../../components/Home/BeachMediaSection';
import ExploreSection from '../../components/Home/ExploreSection';
import { useCountries } from '@/hooks/useCountries';
import {
  useCoastalDestinations,
  useBrowseMap,
  useFindBeach,
  useBeachViews,
  useAccommodation,
  useFeaturedSections,
  useFooterText,
} from '@/hooks/useFirstPageContent';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const tFeature = useTranslations('FeatureCards');
  const { countries, loading: countriesLoading } = useCountries();
  const { content: coastalDestinations, loading: coastalLoading } = useCoastalDestinations();
  const { content: browseMap, loading: browseMapLoading } = useBrowseMap();
  const { content: findBeach, loading: findBeachLoading } = useFindBeach();
  const { content: beachViews, loading: beachViewsLoading } = useBeachViews();
  const { content: accommodation, loading: accommodationLoading } = useAccommodation();
  const { content: featuredSections, loading: featuredLoading } = useFeaturedSections();
  const { content: footerText, loading: footerLoading } = useFooterText();

  // Process browse map data
  const mapImageUrl = useMemo(() => {
    if (browseMap?.media && browseMap.media.length > 0) {
      const image = browseMap.media.find(m => m.is_primary) ?? browseMap.media[0];
      return image?.url ?? '';
    }
    return '';
  }, [browseMap]);

  // Process beach views data
  const beachViewsItems = useMemo(() => {
    if (!beachViews?.items) return [];
    return beachViews.items.map((item, index) => {
      const icon = item.media?.find(m => m.type === 'icon');
      const backgroundImage = item.media?.find(m => m.type === 'image');
      return {
        id: item.id ?? index,
        title: item.title ?? '',
        iconUrl: icon?.url ?? '',
        backgroundUrl: backgroundImage?.url ?? '',
      };
    });
  }, [beachViews]);

  // Process accommodation images
  const accommodationImages = useMemo(() => {
    if (!accommodation?.media) return [];
    return accommodation.media.map(m => m.url ?? '').filter(url => url !== '');
  }, [accommodation]);

  // Process featured sections data
  const featuredItems = useMemo(() => {
    if (!featuredSections?.items) return [];

    // Button configurations (hardcoded for now - can be moved to API config later)
    const buttonConfigs = [
      { label: tFeature('beachMapButton'), icon: '/images/map.png', bgColor: '#1A3C68', textColor: '#FFFFFF' },
      { label: tFeature('browseBlogButton'), icon: '/images/blog.png', bgColor: '#F5F5F5', textColor: '#4D4D4D' },
      { label: tFeature('browseAccommodationsButton'), icon: '/images/accomodation.png', bgColor: '#006b4f', textColor: '#FFFFFF' },
      { label: tFeature('beachMapButton'), icon: '/images/map.png', bgColor: '#1A3C68', textColor: '#FFFFFF' },
    ];

    return featuredSections.items.map((item, index) => {
      const backgroundImage = item.media?.find(m => m.type === 'image');
      const config = buttonConfigs[index] ?? buttonConfigs[0] ?? {
        label: '',
        icon: '',
        bgColor: '#1A3C68',
        textColor: '#FFFFFF',
      };

      return {
        id: item.id ?? index,
        title: item.title ?? '',
        backgroundImageUrl: backgroundImage?.url ?? '',
        buttonLabel: config.label,
        buttonIconUrl: config.icon,
        buttonBgColor: config.bgColor,
        buttonTextColor: config.textColor,
      };
    });
  }, [featuredSections, tFeature]);

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* World Map Section */}
      {!browseMapLoading && browseMap && (
        <WorldMapSection
          title={browseMap.title ?? ''}
          description={browseMap.description ?? ''}
          mapImageUrl={mapImageUrl}
          buttonLabel="View Beach Map"
        />
      )}

      {/* Beach Category Search Section */}
      {!findBeachLoading && findBeach && (
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
      {!beachViewsLoading && beachViews && beachViewsItems.length > 0 && (
        <BeachMediaSection
          title={beachViews.title ?? ''}
          items={beachViewsItems}
        />
      )}

      {/* Accommodation Section */}
      {!accommodationLoading && accommodation && (
        <HomeAccommodationSection
          title={accommodation.title ?? ''}
          description={accommodation.description ?? ''}
          images={accommodationImages}
          buttonLabel={t('browseAccommodationsButton')}
          moreLabel={t('moreAccommodations')}
        />
      )}

      {/* Top Destinations Section */}
      {!countriesLoading && !coastalLoading && coastalDestinations && (
        <TopDestinationsSection
          title={coastalDestinations.title ?? ''}
          items={countries}
          countLabel={t('allCountriesCount', { count: countries.length })}
          badgeLabel={t('seaExperiences')}
        />
      )}

      {/* Explore Section */}
      {!featuredLoading && !footerLoading && featuredSections && footerText && featuredItems.length > 0 && (
        <ExploreSection
          items={featuredItems}
          tagline={footerText.title ?? ''}
        />
      )}
    </>
  );
}

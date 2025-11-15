'use client';
import BeachCategorySearch from '@/components/Home/BeachCategorySearch';
import HeroSection from '@/components/Home/HeroSection';
import HomeAccommodationSection from '@/components/Home/HomeAccommodationSection';
import TopDestinationsSection from '@/components/Home/TopDestinationSection';
import WorldMapSection from '@/components/Home/WorldMapSection';
import BeachMediaSection from '../../components/Home/BeachMediaSection';
import ExploreSection from '../../components/Home/ExploreSection';
import { useCountries } from '@/hooks/useCountries';
import { useCoastalDestinations } from '@/hooks/useFirstPageContent';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const { countries, loading: countriesLoading } = useCountries();
  const { content: coastalDestinations, loading: contentLoading } = useCoastalDestinations();

  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      {/* World Map Section */}
      <WorldMapSection />

      {/* Beach Category Search Section */}
      <BeachCategorySearch />
      <BeachMediaSection />

      <HomeAccommodationSection />

      {/* Top Destinations Section */}
      {!countriesLoading && !contentLoading && coastalDestinations && (
        <TopDestinationsSection
          title={coastalDestinations.title ?? ''}
          items={countries}
          countLabel={t('allCountriesCount', { count: countries.length })}
          badgeLabel={t('seaExperiences')}
        />
      )}

      <ExploreSection />
    </>
  );
}

'use client';
import { useCountries } from '@/hooks/useCountries';
import { useTranslations } from 'next-intl';
import DestinationsCarousel from '../DestinationsCarousel';

export default function ContinentCountriesSection() {
  // Different namespaces for different label sources
  const tContinent = useTranslations('ContinentPage');
  const tHome = useTranslations('HomePage');

  const { countries, loading } = useCountries();

  if (loading) return null; // or skeleton

  return (
    <DestinationsCarousel
      items={countries}
      title={tContinent('countriesContinent', { continent: 'Europe' })}
      countLabel={tHome('allCountriesCount', { count: countries.length })}
      badgeLabel={tHome('seaExperiences')}
    />
  );
}

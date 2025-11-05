'use client';
import { useCountries } from '@/hooks/useCountries';
import { useTranslations } from 'next-intl';
import DestinationsCarousel from '../DestinationsCarousel';

export default function TopDestinationsSection() {
  const t = useTranslations('HomePage');
  const { countries, loading } = useCountries();

  if (loading) return null; // or skeleton

  return (
    <DestinationsCarousel
      items={countries}
      title={t('topDestinationsTitle')}
      countLabel={t('allCountriesCount', { count: countries.length })}
      badgeLabel={t('seaExperiences')}
    />
  );
}

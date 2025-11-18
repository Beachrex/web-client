'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';

interface CountryDestinationsSectionProps {
  countryName: string;
  regionItems: Country[];
  cityItems: Country[];
  islandItems: Country[];
}

export default function CountryDestinationsSection({
  countryName,
  regionItems,
  cityItems,
  islandItems,
}: CountryDestinationsSectionProps) {
  const tCountry = useTranslations('countryPage');

  return (
    <>

      {/* Regions carousel */}
      <DestinationsCarousel
        items={regionItems}
        title={tCountry('regionsTitle', { country: countryName })}
        countLabel={tCountry('allRegionsCount', {
          count: regionItems.length,
        })}
        badgeLabel={tCountry('regionBadge')}
        cardVariant="region"
      />

      {/* Cities carousel */}
      <DestinationsCarousel
        items={cityItems}
        title={tCountry('citiesTitle', { country: countryName })}
        countLabel={tCountry('allCitiesCount', {
          count: cityItems.length,
        })}
        badgeLabel={tCountry('cityBadge')}
        cardVariant="city"
      />

      {/* Islands carousel */}
      <DestinationsCarousel
        items={islandItems}
        title={tCountry('islandsTitle', { country: countryName })}
        countLabel={tCountry('allIslandsCount', {
          count: islandItems.length,
        })}
        badgeLabel={tCountry('islandBadge')}
        cardVariant="island"
      />

    </>
  );
}

// RegionDestinationsSection.tsx (primer)
'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import DestinationsCarousel from '@/components/DestinationsCarousel';

interface RegionDestinationsSectionProps {
  regionName: string;
  islandItems: Country[];
  cityItems: Country[];
  // optional third group later (e.g. mainland)
}

export default function RegionDestinationsSection({
  regionName,
  islandItems,
  cityItems,
}: RegionDestinationsSectionProps) {
  const tRegion = useTranslations('RegionPage');

  return (
    <>
      <DestinationsCarousel
        items={islandItems}
        title={tRegion('islandsTitle', { region: regionName })}
        countLabel={tRegion('allIslandsCount', {
          count: islandItems.length,
        })}
        badgeLabel={tRegion('islandBadge')}
        cardVariant="island"
      />

      <DestinationsCarousel
        items={cityItems}
        title={tRegion('citiesTitle', { region: regionName })}
        countLabel={tRegion('allCitiesCount', {
          count: cityItems.length,
        })}
        badgeLabel={tRegion('cityBadge')}
        cardVariant="city"
      />
    </>
  );
}

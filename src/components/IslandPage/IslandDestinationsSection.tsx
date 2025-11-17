'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';

interface IslandDestinationsSectionProps {
  islandName: string;
  cityItems: Country[];
}

export default function IslandDestinationsSection({
  islandName,
  cityItems,
}: IslandDestinationsSectionProps) {
  const tIsland = useTranslations('IslandPage');

  return (
    <>
      <DestinationsCarousel
        items={cityItems}
        title={tIsland('citiesTitle', { island: islandName })}
        countLabel={tIsland('allCitiesCount', {
          count: cityItems.length,
        })}
        badgeLabel={tIsland('cityBadge')}
        cardVariant="city"
      />
    </>
  );
}

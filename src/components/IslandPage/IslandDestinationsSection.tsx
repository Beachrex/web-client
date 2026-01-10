'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations, useLocale } from 'next-intl';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

interface IslandDestinationsSectionProps {
  islandName: string;
  cityItems: Country[];
}

interface DestinationLocation {
  continent_slug: string;
  country_slug: string;
  region_slug?: string;
  island_slug?: string;
}

type RoutableCity = Country & {
  slug: string;
  location: DestinationLocation;
};

export default function IslandDestinationsSection({
  islandName,
  cityItems,
}: IslandDestinationsSectionProps) {
  const tIsland = useTranslations('IslandPage');
  const locale = useLocale();

  const citiesWithUrl = cityItems
    .filter(
      (c): c is RoutableCity =>
        typeof c.slug === 'string' && 'location' in c,
    )
    .map((c) => ({
      ...c,
      url: buildDestinationUrl({
        locale,
        type: 'city',
        slug: c.slug,
        location: c.location,
      }),
    }));

  if (citiesWithUrl.length === 0) {
    return null;
  }

  return (
    <DestinationsCarousel
      items={citiesWithUrl}
      title={tIsland('citiesTitle', { island: islandName })}
      countLabel={tIsland('allCitiesCount', {
        count: citiesWithUrl.length,
      })}
      badgeLabel={tIsland('cityBadge')}
      cardVariant="city"
    />
  );
}

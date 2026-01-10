'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations, useLocale } from 'next-intl';
import DestinationsCarousel from '@/components/DestinationsCarousel';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

interface RegionDestinationsSectionProps {
  regionName: string;
  islandItems: Country[];
  cityItems: Country[];
}

interface DestinationLocation {
  continent_slug: string;
  country_slug: string;
  region_slug: string;
  island_slug?: string;
}

type RoutableItem = Country & {
  slug: string;
  location: DestinationLocation;
};

export default function RegionDestinationsSection({
  regionName,
  islandItems,
  cityItems,
}: RegionDestinationsSectionProps) {
  const tRegion = useTranslations('RegionPage');
  const locale = useLocale();

  const islandsWithUrl = islandItems
    .filter(
      (i): i is RoutableItem =>
        typeof i.slug === 'string' && 'location' in i,
    )
    .map((i) => ({
      ...i,
      url: buildDestinationUrl({
        locale,
        type: 'island',
        slug: i.slug,
        location: i.location,
      }),
    }));

  const citiesWithUrl = cityItems
    .filter(
      (c): c is RoutableItem =>
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

  return (
    <>
      {islandsWithUrl.length > 0 && (
        <DestinationsCarousel
          items={islandsWithUrl}
          title={tRegion('islandsTitle', { region: regionName })}
          countLabel={tRegion('allIslandsCount', {
            count: islandsWithUrl.length,
          })}
          badgeLabel={tRegion('islandBadge')}
          cardVariant="island"
        />
      )}

      {citiesWithUrl.length > 0 && (
        <DestinationsCarousel
          items={citiesWithUrl}
          title={tRegion('citiesTitle', { region: regionName })}
          countLabel={tRegion('allCitiesCount', {
            count: citiesWithUrl.length,
          })}
          badgeLabel={tRegion('cityBadge')}
          cardVariant="city"
        />
      )}
    </>
  );
}

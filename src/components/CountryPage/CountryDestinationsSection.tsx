'use client';

import DestinationsCarousel from '@/components/DestinationsCarousel';
import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations, useLocale } from 'next-intl';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

interface CountryDestinationsSectionProps {
  countryName: string;
  regionItems: Country[];
  cityItems: Country[];
  islandItems?: Country[];
}

interface DestinationLocation {
  continent_slug: string;
  country_slug: string;
  region_slug?: string;
  island_slug?: string;
}

type RoutableItem = Country & {
  slug: string;
  location: DestinationLocation;
};

export default function CountryDestinationsSection({
  countryName,
  regionItems,
  cityItems,
  islandItems,
}: CountryDestinationsSectionProps) {
  const tCountry = useTranslations('countryPage');
  const locale = useLocale();

  const buildUrl = (
    type: 'region' | 'city' | 'island',
    item: RoutableItem,
  ) =>
    buildDestinationUrl({
      locale,
      type,
      slug: item.slug,
      location: item.location,
    });

  const regionsWithUrl = regionItems
    .filter(
      (r): r is RoutableItem =>
        typeof r.slug === 'string' && 'location' in r,
    )
    .map((r) => ({
      ...r,
      url: buildUrl('region', r),
    }));

  const citiesWithUrl = cityItems
    .filter(
      (c): c is RoutableItem =>
        typeof c.slug === 'string' && 'location' in c,
    )
    .map((c) => ({
      ...c,
      url: buildUrl('city', c),
    }));

  const islandsWithUrl = islandItems
    ?.filter(
      (i): i is RoutableItem =>
        typeof i.slug === 'string' && 'location' in i,
    )
    .map((i) => ({
      ...i,
      url: buildUrl('island', i),
    }));

  return (
    <>
      {regionsWithUrl.length > 0 && (
        <DestinationsCarousel
          items={regionsWithUrl}
          title={tCountry('regionsTitle', { country: countryName })}
          countLabel={tCountry('allRegionsCount', {
            count: regionsWithUrl.length,
          })}
          badgeLabel={tCountry('regionBadge')}
          cardVariant="region"
        />
      )}

      {citiesWithUrl.length > 0 && (
        <DestinationsCarousel
          items={citiesWithUrl}
          title={tCountry('citiesTitle', { country: countryName })}
          countLabel={tCountry('allCitiesCount', {
            count: citiesWithUrl.length,
          })}
          badgeLabel={tCountry('cityBadge')}
          cardVariant="city"
        />
      )}

      {islandsWithUrl && islandsWithUrl.length > 0 && (
        <DestinationsCarousel
          items={islandsWithUrl}
          title={tCountry('islandsTitle', { country: countryName })}
          countLabel={tCountry('allIslandsCount', {
            count: islandsWithUrl.length,
          })}
          badgeLabel={tCountry('islandBadge')}
          cardVariant="island"
        />
      )}
    </>
  );
}

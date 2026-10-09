'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import { useCityWeather } from '@/hooks/useWeather';
import AccommodationSection from '../AccommodationCard/AccommodationsSection';
import BannerSection from '../BannerSection/BannerSection';
import CityCategories from '../CityPage/CityCategories';


import type { CityPageData } from '@/lib/server/destination-page-data';
import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildCityUrlFromNavigation } from '@/lib/utils/beach-urls';
import { formatRegionPillLabel } from '../BannerSection/topbar-utils';
import DynamicSearchBeaches from '../DynamicSearchBeaches';
import { FEATURES } from '@/lib/constants/features';
import AllBeachesLink from '@/components/AllBeachesLink';

interface CityListingPageProps {
  citySlug: string;
  /** Fetched on the server by the page route (SSR); only the weather loads in the browser. */
  initialData: CityPageData;
}

export default function CityListingPage({
  citySlug: _citySlug,
  initialData,
}: CityListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tTown = useTranslations('TownPage');
  const tProperty = useTranslations('PropertySection');

  const { details: cityDetails, mostVisited: mostVisitedBeaches } = initialData;

const countryCode =
  cityDetails?.country?.code ??
  cityDetails?.country_code ??
  '';


  useEffect(() => {
    if (!pathname) return;
    // Optional: analytics / scroll logic here later
  }, [pathname]);

  const cityName = cityDetails.name ?? _citySlug;

    const bannerImage = buildCdnUrl(cityDetails?.main_image, 'banner');

  const cityBeachesCount = cityDetails?.beaches_count ?? 0;
  const cityAccommodationsCount = 0; // TODO: wire to real API when available


  const { data: cityWeatherResponse, isLoading: isCityWeatherLoading } =
    useCityWeather({
      slug: _citySlug,
      countryCode,
      locale,
      enabled: !!countryCode,
    });

const mostVisitedSet = new Set(
  (mostVisitedBeaches ?? [])
    .map(b => b.id)
    .filter((id): id is number => typeof id === 'number'),
);

const beachProperties: Property[] =
  mostVisitedBeaches
    .map((beach) => {
      const p = mapBeachToProperty(
        beach,
        {
          mostVisitedSet,
          locationFallback: cityName,
          locale,
        },
      );

      if (!p) return null;

      const url = buildBeachUrlFromSchema(beach, locale);

      return {
        ...p,
        ...(url ? { beachUrl: url } : {}),
      };
    })
    .filter((p): p is Property => p !== null);

{/*
  // Temporary mock cities data (replace with real API later)
  const baseCity: Country = {
    code: 'BASKA',
    name: 'Baška',
    beaches_count: 112,
  } as Country;

  const cityItems: Country[] = Array.from({ length: 6 }, (_, i) => ({
    ...baseCity,
    code: `CITY-${i + 1}`,
    name: `City ${i + 1}`,
  })) as Country[];
*/}
  const cityWeather = cityWeatherResponse?.data?.weather ?? null;

  const cityWeatherLocationName = cityWeather?.location_name ?? cityName;


const bottomBadges =
  cityDetails?.badges
    ?.filter((b) => b.name)
    ?.map((b) => ({
      label: b.name!,
      icon: b.icon ? buildCdnUrl(b.icon, 'icon') : null,
    })) ?? [];

const infoCards = mapArticlesToInfoCards(
  cityDetails?.articles,
  locale,
);


const regionPillLabel = cityDetails?.region?.name
  ? formatRegionPillLabel(cityDetails.region.name)
  : null;

const islandPillLabel = cityDetails?.island?.name
  ? formatRegionPillLabel(cityDetails.island.name)
  : null;


  return (
    <>
      {/* Shared top bar: breadcrumbs + city prev/next navigation */}
      <DynamicTopBar
        pathname={pathname ?? ''}
        variant="city"
        navigation={cityDetails?.navigation}
        buildUrl={(item) =>
          buildCityUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale,
          )
        }
      />

     <BannerSection
  image={bannerImage}
  title={cityName}
  topBarVariant="city"

  continent={cityDetails?.country?.continent}
  country={cityDetails?.country}
  regionPillLabel={regionPillLabel}
  islandPillLabel={islandPillLabel}

  accommodationCount={cityAccommodationsCount}
  beachCount={cityBeachesCount}
  weather={cityWeather}
  weatherLocationName={cityWeatherLocationName}
  isWeatherLoading={isCityWeatherLoading}
  badges={bottomBadges.length > 0 ? bottomBadges : undefined}
  infoCards={infoCards.length > 0 ? infoCards : undefined}
  continentCode={cityDetails?.country?.continent?.code}
  countryCode={cityDetails?.country?.code}
  regionSlug={cityDetails?.region?.slug}
  islandSlug={cityDetails?.island?.slug}
  citySlug={_citySlug}
     />


      {/* Most visited beaches in town */}
      <PropertySection
        title={tTown('popularBeachesTitle', { town: cityName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <AllBeachesLink label={tProperty('allBeachesLink', { count: cityBeachesCount })} />
        }
      />

      {/* Featured accommodations in town */}
      {/* Hidden for launch: no accommodation source yet (fake cards) */}
      {FEATURES.accommodation && (
        <AccommodationSection
          title={tTown('featuredAccommodationsTitle', { town: cityName })}
          totalCount={cityAccommodationsCount}
          showDropdown
          selectedDistance={{ value: 1, label: '1 km' }}
        />
      )}

      {/* Hidden for launch: the tiles had no click action (owner 2026-10-09) */}
      {FEATURES.cityCategoryTiles && <CityCategories />}

     <DynamicSearchBeaches
  translationNamespace="TownPage"
  titleKey="browseBeachesTitle"
  titleParams={{ town: cityName }}
  filterButtonColor="#FF8000"
  baseFilters={{
    city: _citySlug,
  }}
  hiddenFilterKeys={['country', 'region', 'island', 'city']}
     />


      {/* Cities carousel
      <DestinationsCarousel
  items={cityItems}
  title={tTown('categories.citiesTitle')}
  countLabel={tRegion('allCitiesCount', {
    count: cityItems.length,
  })}
  badgeLabel={tRegion('cityBadge')}
  cardVariant="city"
      />
*/}
    </>
  );
}

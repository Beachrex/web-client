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
import DestinationsCarousel from '../DestinationsCarousel';

import { type Country } from '@/lib/api-client/types.gen';
import { ChevronRight } from 'lucide-react';

import { useCityDetails } from '@/hooks/useCityDetails';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildCityUrlFromNavigation } from '@/lib/utils/beach-urls';
import { formatRegionPillLabel } from '../BannerSection/topbar-utils';
import DynamicSearchBeaches from '../DynamicSearchBeaches';

interface CityListingPageProps {
  citySlug?: string;
  cityDataProp?: unknown;
  // If you later want, you can extend with:
  // countryCode?: string;
  // regionCode?: string;
  // islandCode?: string;
}

export default function CityListingPage({
  citySlug: _citySlug,
  cityDataProp: _cityDataProp,
}: CityListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tTown = useTranslations('TownPage');
  const tProperty = useTranslations('PropertySection');
  const tRegion = useTranslations('RegionPage');

 const { cityDetails, loading: _loading, error: _error } = useCityDetails(
  _citySlug ?? '',
  undefined,
  undefined,
  undefined,
  Boolean(_citySlug),
);

const countryCode =
  cityDetails?.country?.code ??
  cityDetails?.country_code ??
  '';


  useEffect(() => {
    if (!pathname) return;
    // Optional: analytics / scroll logic here later
  }, [pathname]);

  // Prefer API name, then slug, then fallback test name
  const cityName =
    cityDetails?.name ??
    _citySlug ??
    'Malinska';

    const bannerImage = buildCdnUrl(cityDetails?.main_image, 'banner');

  const cityBeachesCount = cityDetails?.beaches_count ?? 0;
  const cityAccommodationsCount = 0; // TODO: wire to real API when available


  const { data: cityWeatherResponse, isLoading: isCityWeatherLoading } =
    useCityWeather({
      slug: _citySlug ?? '',
      countryCode,
      locale,
      enabled: !!_citySlug && !!countryCode,
    });

const { data: mostVisitedBeaches } = useMostVisitedBeaches({
  city_code: _citySlug,
  limit: 20,
});


const mostVisitedSet = new Set(
  (mostVisitedBeaches ?? [])
    .map(b => b.id)
    .filter((id): id is number => typeof id === 'number'),
);

const beachProperties: Property[] =
  mostVisitedBeaches
    ?.map((beach) => {
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
    .filter((p): p is Property => p !== null) ?? [];


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
     />


      {/* Most visited beaches in town */}
      <PropertySection
        title={tTown('popularBeachesTitle', { town: cityName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <a
            href="#"
            className="flex items-center font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
          >
            {tProperty('allBeachesLink', { count: beachProperties.length })}
            <ChevronRight className="h-4 w-4" />
          </a>
        }
      />

      {/* Featured accommodations in town */}
      <AccommodationSection
        title={tTown('featuredAccommodationsTitle', { town: cityName })}
        totalCount={cityAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      <CityCategories />

     <DynamicSearchBeaches
  translationNamespace="TownPage"
  titleKey="browseBeachesTitle"
  titleParams={{ town: cityName }}
  filterButtonColor="#FF8000"
  filters={{
    city: _citySlug,
    limit: 20,
  }}
     />


      {/* Cities carousel */}
      <DestinationsCarousel
        items={cityItems}
        title={tTown('categories.citiesTitle')}
        countLabel={tRegion('allCitiesCount', {
          count: cityItems.length,
        })}
        badgeLabel={tRegion('cityBadge')}
        cardVariant="city"
      />
    </>
  );
}

'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

import PropertySection, { type Property } from '@/components/PropertySection';

import { useCities } from '@/hooks/useCities';
import { useIslands } from '@/hooks/useIslands';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { useRegionDetails } from '@/hooks/useRegionDetails';
import { useRegionWeather } from '@/hooks/useWeather';

import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildRegionUrlFromNavigation } from '@/lib/utils/beach-urls';


import AccommodationSection from '../AccommodationCard/AccommodationsSection';
import BannerSection from '../BannerSection/BannerSection';
import DestinationsCarousel from '../DestinationsCarousel';
import DynamicSearchBeaches from '../DynamicSearchBeaches';
import DynamicTopBar from '../DynamicTopBar';

import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { ChevronRight } from 'lucide-react';

interface RegionListingPageProps {
  regionSlug?: string;
}

export default function RegionListingPage({ regionSlug }: RegionListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tRegion = useTranslations('RegionPage');
  const tProperty = useTranslations('PropertySection');

  // ----------------------------
  // FETCH REGION DETAILS
  // ----------------------------
  const { regionDetails, loading, error } = useRegionDetails(
    regionSlug ?? '',
    undefined,
    Boolean(regionSlug)
  );

  const regionCountryCode = regionDetails?.country?.code ?? '';

  // ----------------------------
  // FETCH CITIES / ISLANDS FOR REGION
  // ----------------------------
  const { cities } = useCities(undefined, regionSlug);
  const { islands } = useIslands(undefined, regionSlug);

  // ----------------------------
  // BASIC REGION INFO
  // ----------------------------
  const regionName = regionDetails?.name ?? regionSlug ?? 'Region';
  const bannerImage = buildCdnUrl(regionDetails?.main_image, 'banner');

  const regionBeachesCount = regionDetails?.beaches_count ?? 0;
  const regionAccommodationsCount = 0;

  // ----------------------------
  // WEATHER
  // ----------------------------
  const { data: regionWeatherResponse, isLoading: isWeatherLoading } =
    useRegionWeather({
      slug: regionSlug ?? '',
      countryCode: regionCountryCode,
      locale,
      enabled: !!regionSlug && !!regionCountryCode,
    });

  const regionWeather = regionWeatherResponse?.data?.weather ?? null;
  const regionWeatherLocationName =
    regionWeather?.location_name ?? regionName;

  // ----------------------------
  // MOST VISITED BEACHES (REAL)
  // ----------------------------
  const { data: mostVisitedBeaches } = useMostVisitedBeaches({
    region_code: regionSlug,
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
          locationFallback: regionName,
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


  // ----------------------------
  // DESTINATIONS
  // ----------------------------
 const islandItems =
  islands?.map((i) => {
    const image = buildCdnUrl(i.main_image, 'list');
    if (!image) throw new Error(`Island ${i.slug} missing main_image`);

    return {
      ...i,
      main_image: image,
    };
  }) ?? [];


  const cityItems =
  cities?.map((c) => {
    const image = buildCdnUrl(c.main_image, 'list');
    if (!image) throw new Error(`City ${c.slug} missing main_image`);

    return {
      ...c,
      main_image: image,
    };
  }) ?? [];

  // ----------------------------
  // BADGES + INFOCARDS
  // ----------------------------
  const regionBadges =
    regionDetails?.badges
      ?.filter((b) => b.name && b.icon)
      ?.map((b) => ({
        label: b.name!,
        icon: buildCdnUrl(b.icon, 'icon')!,
      })) ?? [];

 const regionInfoCards = mapArticlesToInfoCards(
  regionDetails?.articles,
  locale,
);

  // ----------------------------
  // RENDER
  // ----------------------------
  if (loading && !regionDetails) {
    return <div className="container mx-auto py-8">Loading region…</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-red-600">
        Failed to load region: {error}
      </div>
    );
  }

  return (
    <>
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={regionDetails?.navigation}
        buildUrl={(item) =>
          buildRegionUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale
          )
        }
      />

      <BannerSection
  image={bannerImage}
  title={regionName}
  topBarVariant="region"
  country={regionDetails?.country}

  accommodationCount={regionAccommodationsCount}
  beachCount={regionBeachesCount}
  weather={regionWeather}
  weatherLocationName={regionWeatherLocationName}
  isWeatherLoading={isWeatherLoading}
  badges={regionBadges.length ? regionBadges : undefined}
  infoCards={regionInfoCards.length ? regionInfoCards : undefined}
      />


      <PropertySection
        title={tRegion('popularBeachesTitle', { region: regionName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <a
            href="#"
            className="flex items-center font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px]"
          >
            {tProperty('allBeachesLink', { count: beachProperties.length })}
            <ChevronRight className="h-4 w-4" />
          </a>
        }
      />

      <AccommodationSection
        title={tRegion('featuredAccommodationsTitle', { region: regionName })}
        totalCount={regionAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      {islandItems.length > 0 && (
  <DestinationsCarousel
    items={islandItems}
    title={tRegion('islandsTitle', { region: regionName })}
    countLabel={tRegion('allIslandsCount', { count: islandItems.length })}
    badgeLabel={tRegion('islandBadge')}
    cardVariant="island"
  />
)}


      {cityItems.length > 0 && (
  <DestinationsCarousel
    items={cityItems}
    title={tRegion('citiesTitle', { region: regionName })}
    countLabel={tRegion('allCitiesCount', { count: cityItems.length })}
    badgeLabel={tRegion('cityBadge')}
    cardVariant="city"
  />
)}


      <DynamicSearchBeaches
  translationNamespace="RegionPage"
  titleKey="browseBeachesTitle"
  titleParams={{ region: regionName }}
  filterButtonColor="#FF2877"
  filters={{
    region: regionSlug,
    limit: 20,
  }}
      />

    </>
  );
}

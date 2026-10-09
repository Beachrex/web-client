'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

import PropertySection, { type Property } from '@/components/PropertySection';
import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';

import { useRegionWeather } from '@/hooks/useWeather';
import type { RegionPageData } from '@/lib/server/destination-page-data';

import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';

import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import DestinationsSection from '../DestinationsSection';
import { FEATURES } from '@/lib/constants/features';
import AllBeachesLink from '@/components/AllBeachesLink';

interface RegionListingPageProps {
  regionSlug: string;
  /** Fetched on the server by the page route (SSR); only the weather loads in the browser. */
  initialData: RegionPageData;
}

export default function RegionListingPage({ regionSlug, initialData }: RegionListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tRegion = useTranslations('RegionPage');
  const tProperty = useTranslations('PropertySection');

  const { details: regionDetails, cities, islands, mostVisited: mostVisitedBeaches } = initialData;

  const regionCountryCode = regionDetails.country?.code ?? '';

  const regionName = regionDetails.name ?? regionSlug;
  const bannerImage = buildCdnUrl(regionDetails?.main_image, 'banner');

  const regionBeachesCount = regionDetails?.beaches_count ?? 0;
  const regionAccommodationsCount = 0;

  const { data: regionWeatherResponse, isLoading: isWeatherLoading } =
    useRegionWeather({
      slug: regionSlug,
      countryCode: regionCountryCode,
      locale,
      enabled: !!regionCountryCode,
    });

  const regionWeather = regionWeatherResponse?.data?.weather ?? null;
  const regionWeatherLocationName =
    regionWeather?.location_name ?? regionName;

  const mostVisitedSet = new Set(
    (mostVisitedBeaches ?? [])
      .map((b) => b.id)
      .filter((id): id is number => typeof id === 'number'),
  );

  const beachProperties: Property[] =
    mostVisitedBeaches
      .map((beach) => {
        const p = mapBeachToProperty(beach, {
          mostVisitedSet,
          locationFallback: regionName,
          locale,
        });

        if (!p) return null;

        const url = buildBeachUrlFromSchema(beach, locale);

        return {
          ...p,
          ...(url ? { beachUrl: url } : {}),
        };
      })
      .filter((p): p is Property => p !== null);

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

  return (
    <>
      <DynamicTopBar
        pathname={pathname ?? ''}
        variant="region"
        navigation={regionDetails?.navigation}
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
        continentCode={regionDetails?.country?.continent?.code}
        countryCode={regionDetails?.country?.code}
        regionSlug={regionSlug}
      />

      <PropertySection
        title={tRegion('popularBeachesTitle', { region: regionName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <AllBeachesLink label={tProperty('allBeachesLink', { count: regionBeachesCount })} />
        }
      />

      {/* Hidden for launch: no accommodation source yet (fake cards) */}
      {FEATURES.accommodation && (
        <AccommodationSection
          title={tRegion('featuredAccommodationsTitle', { region: regionName })}
          totalCount={regionAccommodationsCount}
          showDropdown
        />
      )}

<DestinationsSection
  context="region"
  contextName={regionName}
  sections={[
    {
      type: 'island',
      items: islands,
      titleKey: 'islandsTitle',
      countKey: 'allIslandsCount',
      badgeKey: 'islandBadge',
      cardVariant: 'island',
    },
    {
      type: 'city',
      items: cities,
      titleKey: 'citiesTitle',
      countKey: 'allCitiesCount',
      badgeKey: 'cityBadge',
      cardVariant: 'city',
    },
  ]}
/>


      <DynamicSearchBeaches
  translationNamespace="RegionPage"
  titleKey="browseBeachesTitle"
  titleParams={{ region: regionName }}
  filterButtonColor="#FF2877"
  baseFilters={initialData.listFilters}
  initialPage={initialData.firstPage}
  hiddenFilterKeys={['country', 'region']}
      />

    </>
  );
}

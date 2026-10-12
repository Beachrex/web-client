'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import { useIslandWeather } from '@/hooks/useWeather';
import type { IslandPageData } from '@/lib/server/destination-page-data';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { formatRegionPillLabel } from '../BannerSection/topbar-utils';
import DynamicSearchBeaches from '../DynamicSearchBeaches';
import DestinationsSection from '../DestinationsSection';
import { FEATURES } from '@/lib/constants/features';
import AllBeachesLink from '@/components/AllBeachesLink';
import { breadcrumbLabels } from '@/lib/utils/breadcrumb-labels';

interface IslandListingPageProps {
  islandSlug: string;
  /** Fetched on the server by the page route (SSR); only the weather loads in the browser. */
  initialData: IslandPageData;
}

export default function IslandListingPage({
  islandSlug: _islandSlug,
  initialData,
}: IslandListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tIsland = useTranslations('IslandPage');
  const tProperty = useTranslations('PropertySection');

  const { details: islandDetails, cities, mostVisited: mostVisitedBeachesData } = initialData;

  const islandName = islandDetails.name ?? _islandSlug;

  const bannerImage = buildCdnUrl(islandDetails?.main_image, 'banner');

  const islandBeachesCount = islandDetails?.beaches_count ?? 0;
  const islandAccommodationsCount = 0;

  const { data: islandWeatherResponse, isLoading: isIslandWeatherLoading } =
    useIslandWeather({
      slug: _islandSlug,
      locale,
      enabled: true,
    });

  const islandWeather = islandWeatherResponse?.data?.weather ?? null;
  const islandWeatherLocationName =
    islandWeather?.location_name ?? islandName;

  const mostVisitedSet = new Set(
    (mostVisitedBeachesData ?? [])
      .map((b) => b.id)
      .filter((id): id is number => typeof id === 'number'),
  );

  const beachProperties: Property[] =
    mostVisitedBeachesData
      .map((beach) => {
        const p = mapBeachToProperty(
          beach,
          {
            mostVisitedSet,
            locationFallback: islandName,
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

  const bottomBadges =
    islandDetails?.badges
      ?.filter((b) => b.name)
      ?.map((b) => ({
        label: b.name!,
        icon: b.icon ? buildCdnUrl(b.icon, 'icon') : null,
      })) ?? [];

  const infoCards = mapArticlesToInfoCards(
    islandDetails?.articles,
    locale,
  );

  const regionPillLabel = islandDetails?.region?.name
    ? formatRegionPillLabel(islandDetails.region.name)
    : null;

  return (
    <>
      <DynamicTopBar
        pathname={pathname ?? ''}
        breadcrumbLabels={breadcrumbLabels(islandDetails)}
        variant="island"
        navigation={islandDetails?.navigation}
      />

      <BannerSection
        image={bannerImage}
        title={islandName}
        topBarVariant="island"
        continent={islandDetails?.country?.continent}
        country={islandDetails?.country}
        regionPillLabel={regionPillLabel}
        accommodationCount={islandAccommodationsCount}
        beachCount={islandBeachesCount}
        weather={islandWeather}
        weatherLocationName={islandWeatherLocationName}
        isWeatherLoading={isIslandWeatherLoading}
        badges={bottomBadges.length ? bottomBadges : undefined}
        infoCards={infoCards.length ? infoCards : undefined}
        continentCode={islandDetails?.country?.continent?.code}
        countryCode={islandDetails?.country?.code}
        islandSlug={_islandSlug}
      />

      <PropertySection
        title={tIsland('popularBeachesTitle', { island: islandName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <AllBeachesLink label={tProperty('allBeachesLink', { count: islandBeachesCount })} />
        }
      />

      {/* Hidden for launch: no accommodation source yet (fake cards) */}
      {FEATURES.accommodation && (
        <AccommodationSection
          title={tIsland('featuredAccommodationsTitle', { island: islandName })}
          totalCount={islandAccommodationsCount}
          showDropdown
        />
      )}

      <DestinationsSection
  context="island"
  contextName={islandName}
  sections={[
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
  translationNamespace="IslandPage"
  titleKey="browseBeachesTitle"
  titleParams={{ island: islandName }}
  filterButtonColor="#FFC422"
  baseFilters={initialData.listFilters}
  initialPage={initialData.firstPage}
  hiddenFilterKeys={['country', 'region', 'island']}
     />

    </>
  );
}

'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicTopBar from '@/components/DynamicTopBar';
import IslandDestinationsSection from '@/components/IslandPage/IslandDestinationsSection';
import PropertySection, { type Property } from '@/components/PropertySection';

import { useCities } from '@/hooks/useCities';
import { useIslandDetails } from '@/hooks/useIslandDetails';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { useIslandWeather } from '@/hooks/useWeather';

import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { ChevronRight } from 'lucide-react';
import { formatRegionPillLabel } from '../BannerSection/topbar-utils';
import DynamicSearchBeaches from '../DynamicSearchBeaches';

interface IslandListingPageProps {
  islandSlug?: string;
}

interface DestinationItem {
  slug: string;
  location: {
    continent_slug: string;
    country_slug: string;
    region_slug?: string;
    island_slug?: string;
  };
}

export default function IslandListingPage({
  islandSlug: _islandSlug,
}: IslandListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tIsland = useTranslations('IslandPage');
  const tProperty = useTranslations('PropertySection');

  const { islandDetails, loading, error } = useIslandDetails(
    _islandSlug ?? '',
    undefined,
    undefined,
    Boolean(_islandSlug),
  );

  const { cities } = useCities(undefined, undefined, _islandSlug);

  const islandName =
    islandDetails?.name ?? _islandSlug ?? 'Island';

  const bannerImage = buildCdnUrl(islandDetails?.main_image, 'banner');

  const islandBeachesCount = islandDetails?.beaches_count ?? 0;
  const islandAccommodationsCount = 0;

  const { data: islandWeatherResponse, isLoading: isIslandWeatherLoading } =
    useIslandWeather({
      slug: _islandSlug ?? '',
      locale,
      enabled: !!_islandSlug,
    });

  const islandWeather = islandWeatherResponse?.data?.weather ?? null;
  const islandWeatherLocationName =
    islandWeather?.location_name ?? islandName;

  const { data: mostVisitedBeachesData } = useMostVisitedBeaches({
    island_code: _islandSlug,
    limit: 20,
  });

  const mostVisitedSet = new Set(
    (mostVisitedBeachesData ?? [])
      .map((b) => b.id)
      .filter((id): id is number => typeof id === 'number'),
  );

  const beachProperties: Property[] =
    mostVisitedBeachesData
      ?.map((beach) => {
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
      .filter((p): p is Property => p !== null) ?? [];

  const buildUrl = (
    item: DestinationItem,
  ) =>
    buildDestinationUrl({
      locale,
      type: 'city',
      slug: item.slug,
      location: item.location,
    });

  const citiesWithUrl =
    cities?.map((c) => ({
      ...c,
      url: buildUrl(c as unknown as DestinationItem),
    })) ?? [];

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

  if (loading && !islandDetails) {
    return <div className="container mx-auto py-8">Loading island…</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-red-600">
        Failed to load island: {error}
      </div>
    );
  }

  const regionPillLabel = islandDetails?.region?.name
    ? formatRegionPillLabel(islandDetails.region.name)
    : null;

  return (
    <>
      <DynamicTopBar
        pathname={pathname ?? ''}
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
      />

      <PropertySection
        title={tIsland('popularBeachesTitle', { island: islandName })}
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

      <AccommodationSection
        title={tIsland('featuredAccommodationsTitle', { island: islandName })}
        totalCount={islandAccommodationsCount}
        showDropdown
      />

      <IslandDestinationsSection
        islandName={islandName}
        cityItems={citiesWithUrl}
      />

      <DynamicSearchBeaches
        translationNamespace="IslandPage"
        titleKey="browseBeachesTitle"
        titleParams={{ island: islandName }}
        filterButtonColor="#FFC422"
        filters={{
          island: _islandSlug,
          limit: 20,
        }}
      />
    </>
  );
}

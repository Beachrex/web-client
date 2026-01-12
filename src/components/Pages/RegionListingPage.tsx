'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

import PropertySection, { type Property } from '@/components/PropertySection';
import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';

import { useCities } from '@/hooks/useCities';
import { useIslands } from '@/hooks/useIslands';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { useRegionDetails } from '@/hooks/useRegionDetails';
import { useRegionWeather } from '@/hooks/useWeather';

import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';

import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { ChevronRight } from 'lucide-react';
import DestinationsSection from '../DestinationsSection';

interface RegionListingPageProps {
  regionSlug?: string;
}

export default function RegionListingPage({ regionSlug }: RegionListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tRegion = useTranslations('RegionPage');
  const tProperty = useTranslations('PropertySection');

  const { regionDetails, loading, error } = useRegionDetails(
    regionSlug ?? '',
    undefined,
    Boolean(regionSlug),
  );

  const regionCountryCode = regionDetails?.country?.code ?? '';

  const { cities } = useCities(undefined, regionSlug);
  const { islands } = useIslands(undefined, regionSlug);

  const regionName = regionDetails?.name ?? regionSlug ?? 'Region';
  const bannerImage = buildCdnUrl(regionDetails?.main_image, 'banner');

  const regionBeachesCount = regionDetails?.beaches_count ?? 0;
  const regionAccommodationsCount = 0;

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

  const { data: mostVisitedBeaches } = useMostVisitedBeaches({
    region_code: regionSlug,
    limit: 20,
  });

  const mostVisitedSet = new Set(
    (mostVisitedBeaches ?? [])
      .map((b) => b.id)
      .filter((id): id is number => typeof id === 'number'),
  );

  const beachProperties: Property[] =
    mostVisitedBeaches
      ?.map((beach) => {
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
      .filter((p): p is Property => p !== null) ?? [];

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
      />

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
  baseFilters={{
    region: regionSlug!,
    limit: 20,
  }}
  hiddenFilterKeys={['country', 'region']}
      />

    </>
  );
}

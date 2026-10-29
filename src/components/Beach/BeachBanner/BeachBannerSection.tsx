'use client';

import WeatherWidget from '@/components/BannerSection/WeatherWidget';
import { useBeachWeather } from '@/hooks/useWeather';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { getMainBeachImage } from '@/lib/utils/beach-images';
import { buildBeachBadges } from '@/lib/utils/beach-badges';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';
import { FEATURES } from '@/lib/constants/features';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import BeachTitleBlock from './BeachTitleBlock';
import BottomBadgesBeach from './BottomBadgesBeach';
import SeaTempWidget from './SeaTempWidget';
import { beachPillKey, showsSeaTemperature, waterKind } from '@/lib/utils/waterbody';
import TopBarBeachRight from './TopBarBeachRight';
import TopBar from '@/components/BannerSection/TopBar';
import { mapBeachLocationToTopBar } from '@/lib/mappers/mapBeachLocationToTopBar';

interface BeachBannerSectionProps {
  beachDetails?: BeachDetailsSchema;
  accommodationCount?: number;
  activityCount?: number;
}

export default function BeachBannerSection({
  beachDetails,
  accommodationCount,
  activityCount,
}: BeachBannerSectionProps) {
  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const tFilters = useTranslations('Filters');

  const beachName = beachDetails?.basic_info?.name ?? '';
  const beachSlug = beachDetails?.basic_info?.slug;
  const beachId = beachDetails?.basic_info?.id;

  const description = beachDetails?.basic_info?.description;

  // Build map URL with beach context
  const buildMapUrl = () => {
    const params = new URLSearchParams();

    const continentCode = beachDetails?.location?.continent?.code;
    const countryCode = beachDetails?.location?.country?.code;
    const regionSlug = beachDetails?.location?.region?.slug;
    const islandSlug = beachDetails?.location?.island?.slug;
    const citySlug = beachDetails?.location?.city?.slug;
    const beachId = beachDetails?.basic_info?.id;
    const beachLat = beachDetails?.basic_info?.latitude;
    const beachLng = beachDetails?.basic_info?.longitude;

    if (continentCode) params.append('continent_code', continentCode);
    if (countryCode) params.append('country', countryCode);
    if (regionSlug) params.append('region', regionSlug);
    if (islandSlug) params.append('island', islandSlug);
    if (citySlug) params.append('city', citySlug);
    if (beachId) params.append('beach_id', String(beachId));
    if (beachLat) params.append('lat', beachLat);
    if (beachLng) params.append('lng', beachLng);

    const queryString = params.toString();
    return buildBeachMapUrl(locale, queryString || undefined);
  };

  const mainImage = getMainBeachImage(
    beachDetails?.media?.gallery,
    beachDetails?.basic_info?.folder_name,
    beachDetails?.basic_info?.mobile_upload,
    'banner', // Use large CDN for banner images
  );

  // Fetch real-time weather data from API
  const { data: weatherResponse, isLoading: isWeatherLoading } =
    useBeachWeather({
      identifier: beachSlug ?? beachId ?? '',
      locale,
      enabled: !!(beachSlug ?? beachId), // Only fetch if we have an identifier
    });

  // Extract weather data from API response
  const weatherData = weatherResponse?.data?.weather ?? null;
  const seaTemperature = weatherResponse?.data?.sea_temperature ?? null;

  // Get location name for weather widget (prefer API location, fallback to beach location)
  const locationName =
    weatherData?.location_name ??
    beachDetails?.location?.city?.name ??
    beachDetails?.location?.island?.name ??
    beachDetails?.location?.region?.name ??
    beachDetails?.location?.country?.name;

  const badges = buildBeachBadges(beachDetails);

  const topBarData = mapBeachLocationToTopBar(beachDetails);
  const water = waterKind(beachDetails?.characteristics?.waterbody?.code);


  return (
    <section className="relative mx-auto mb-10 h-[600px] min-h-[500px] w-full max-w-[1928px] overflow-visible pb-40 sm:h-[700px] md:min-h-[400px] md:pb-48 lg:h-[798px]">
      {/* Background with rounded corners */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[10px] rounded-t-[10px]">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={beachName}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Top bar stays at the top */}
      <div className="z-1 relative flex flex-row items-center justify-between p-4 sm:p-6 lg:p-8">
        {/* Left: Title + counters */}
        <div className="flex flex-col">


<TopBar
  variant="beach"
  title={beachName}
  continent={topBarData.continent}
  country={topBarData.country}
  regionPillLabel={topBarData.regionPillLabel}
  islandPillLabel={topBarData.islandPillLabel}
  cityPillLabel={topBarData.cityPillLabel}
  accommodationCount={accommodationCount}
  activityCount={activityCount}
  showLocationPills
  showFilter={false}
  pillLabelKey={beachPillKey(water)}
/>


        </div>

        {/* Right: review / save / share */}
        <TopBarBeachRight beachId={beachId} />
      </div>

      {/* === Title + widgets anchored near bottom === */}
      <div className="absolute inset-x-0 bottom-[110px] z-20 sm:bottom-[120px] md:bottom-[130px] pointer-events-none">
        <div className="grid grid-cols-1 gap-6 px-4 pr-16 sm:px-6 sm:pr-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:pr-[96px]">
          <BeachTitleBlock title={beachName} />

          <div className="flex justify-center gap-[6px] sm:gap-[10px] lg:justify-end pointer-events-auto">
            <WeatherWidget
              weather={weatherData}
              locationName={locationName}
              isLoading={isWeatherLoading}
            />
            {showsSeaTemperature(water) && (
              <SeaTempWidget
                tempC={seaTemperature}
                isLoading={isWeatherLoading}
              />
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 translate-y-1/2">
        <BottomBadgesBeach
          badges={badges}
          description={description ?? undefined}
        />
      </div>

      {/* Floating buttons */}
      <div className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col">
        <Link
          href={buildMapUrl()}
          className="mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-[#1A3C68] sm:h-[68.46px] sm:w-[71px]"
        >
          <Image
            src="/images/map.png"
            alt={tCommon('map')}
            width={24}
            height={24}
            className="sm:h-[33px] sm:w-[33px]"
          />
        </Link>
        {FEATURES.accommodation && (
        <button className="flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-[#008260] sm:h-[68.46px] sm:w-[71px]">
          <Image
            src="/images/accomodation.png"
            alt={tFilters('filterButton')}
            width={20}
            height={20}
            className="sm:h-[28px] sm:w-[28px]"
          />
        </button>
        )}
      </div>
    </section>
  );
}

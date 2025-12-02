'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

import PropertySection, { type Property } from '@/components/PropertySection';
import { useRegionDetails } from '@/hooks/useRegionDetails';
import { useRegionWeather } from '@/hooks/useWeather';

import type { Country } from '@/lib/api-client/types.gen';
import { buildRegionUrlFromNavigation } from '@/lib/utils/beach-urls';
import { ChevronRight } from 'lucide-react';

import { useCities } from '@/hooks/useCities';
import { useIslands } from '@/hooks/useIslands';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import AccommodationSection from '../AccommodationCard/AccommodationsSection';
import BannerSection from '../BannerSection/BannerSection';
import DestinationsCarousel from '../DestinationsCarousel';
import DynamicSearchBeaches from '../DynamicSearchBeaches';
import DynamicTopBar from '../DynamicTopBar';

interface RegionListingPageProps {
  regionSlug?: string;
}

export default function RegionListingPage({
  regionSlug,
}: RegionListingPageProps) {

  const pathname = usePathname();
  const locale = useLocale();

  const tRegion = useTranslations('RegionPage');
  const tProperty = useTranslations('PropertySection');

  // ---- FETCH REGION DETAILS ----
  const { regionDetails, loading, error } = useRegionDetails(
    regionSlug ?? '',
    undefined,          // ⛔ no countryCode needed from URL
    Boolean(regionSlug)
  );


  // Extract countryCode from regionDetails
  const regionCountryCode =
    regionDetails?.country?.code ?? '';


const { cities } = useCities(undefined, regionSlug);
const { islands } = useIslands(undefined, regionSlug);


  // Basic region info
  const regionName =
    regionDetails?.name ?? regionSlug ?? 'Kvarner';


    const bannerImage = buildCdnUrl(regionDetails?.main_image, 'banner');


  const regionSlugValue = regionSlug ?? '';

  const regionBeachesCount =
    regionDetails?.beaches_count ?? 123;

  // Mock (API later)
  const regionAccommodationsCount = 569;

  // ---- FETCH WEATHER USING COUNTRY FROM API ----
  const { data: regionWeatherResponse, isLoading: isRegionWeatherLoading } =
    useRegionWeather({
      slug: regionSlugValue,
      countryCode: regionCountryCode,
      locale,
      enabled: !!regionSlugValue && !!regionCountryCode, // ⛔ Must have both
    });

  const regionWeather = regionWeatherResponse?.data?.weather ?? null;
  const regionWeatherLocationName =
    regionWeather?.location_name ?? regionName;

  // ---- MOCK LISTS (TEMP) ----
  const baseBeach: Property = {
    id: '1',
    image:
      'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
    title: 'Plaža Ladinka',
    location: `${regionName}, Croatia`,
    price: 25,
    originalPrice: 40,
    rating: 7.2,
    reviews: 120,
    discount: '15',
    isFreeBreakfast: false,
    isFreeCancellation: true,
  };

  const beachProperties: Property[] = Array.from({ length: 4 }, (_, i) => ({
    ...baseBeach,
    id: String(i + 1),
  }));

  const regionCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
    code: `country-${i}`,
    name: `Country ${i + 1}`,
    full_name: `Country ${i + 1}`,
    beaches_count: 112,
    image_path: null,
  })) as Country[];


// ---- MAP API ISLANDS ----
const islandItems =
  islands?.map((i) => ({
    ...i,
    main_image: buildCdnUrl(i.main_image, 'carousel'),
  })) ?? [];

// ---- MAP API CITIES ----
const cityItems =
  cities?.map((c) => ({
    ...c,
    main_image: buildCdnUrl(c.main_image, 'carousel'),
  })) ?? [];


  // ---- EFFECT ----
  useEffect(() => {
    if (!pathname) return;
  }, [pathname]);

  // ---- LOADING & ERROR HANDLING ----
  if (loading && !regionDetails) {
    return (
      <div className="container mx-auto py-8">
        Loading region…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-red-600">
        Failed to load region: {error}
      </div>
    );
  }

  // ---- MAP REGION BADGES ----
const regionBadges =
  regionDetails?.badges
    ?.filter(b => b.name && b.icon)
    ?.map(b => ({
      label: b.name!,
      icon: buildCdnUrl(b.icon, 'icon')!,
    })) ?? [];

// ---- MAP REGION INFOCARDS (articles) ----
const regionInfoCards =
  regionDetails?.articles
    ?.filter(a => a.title && a.excerpt && a.feature_image)
    ?.map(a => ({
      title: a.title!,
      subtitle: a.excerpt!,
      image: buildCdnUrl(a.feature_image, 'list')!,
      link: a.slug ? `/${locale}/articles/${a.slug}` : undefined,
    })) ?? [];


  // ---- RENDER ----
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
            locale,
          )
        }
      />

      <BannerSection
        image={bannerImage}
        title={regionName}
        topBarVariant="region"
        accommodationCount={regionAccommodationsCount}
        beachCount={regionBeachesCount}
        weather={regionWeather}
        weatherLocationName={regionWeatherLocationName}
        isWeatherLoading={isRegionWeatherLoading}
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
            className="flex items-center font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
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

      <DestinationsCarousel
        items={islandItems}
        title={tRegion('islandsTitle', { region: regionName })}
        countLabel={tRegion('allIslandsCount', { count: islandItems.length })}
        badgeLabel={tRegion('islandBadge')}
        cardVariant="island"
      />

      <DestinationsCarousel
        items={cityItems}
        title={tRegion('citiesTitle', { region: regionName })}
        countLabel={tRegion('allCitiesCount', { count: cityItems.length })}
        badgeLabel={tRegion('cityBadge')}
        cardVariant="city"
      />

      <DynamicSearchBeaches
        countries={regionCountries}
        contextName={regionName}
        translationNamespace="RegionPage"
        titleKey="browseBeachesTitle"
        titleParams={{ region: regionName }}
        filterButtonColor="#FF2877"
      />
    </>
  );
}

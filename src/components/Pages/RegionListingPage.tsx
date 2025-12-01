'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

import PropertySection, { type Property } from '@/components/PropertySection';
import { useRegionWeather } from '@/hooks/useWeather';
import type { Country } from '@/lib/api-client/types.gen';
import { ChevronRight } from 'lucide-react';
import AccommodationSection from '../AccommodationCard/AccommodationsSection';
import BannerSection from '../BannerSection/BannerSection';
import DestinationsCarousel from '../DestinationsCarousel';
import RegionSearchBeaches from '../regions/RegionSearchBeaches';
import DynamicTopBar from '../DynamicTopBar';
import { useRegionDetails } from '@/hooks/useRegionDetails';
import { buildRegionUrlFromNavigation } from '@/lib/utils/beach-urls';

interface RegionListingPageProps {
  regionSlug?: string;
  countryCode: string;
}

export default function RegionListingPage({
  regionSlug,
  countryCode,
}: RegionListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const tRegion = useTranslations('RegionPage');
  const tProperty = useTranslations('PropertySection');

  // Fetch region details from API
  const { regionDetails, loading, error } = useRegionDetails(
    regionSlug ?? '',
    countryCode,
    Boolean(regionSlug),
  );

  // Region display name – prefer API, fallback to slug / mock
  const regionName =
    regionDetails?.name ?? regionSlug ?? 'Kvarner';
  const regionSlugValue = regionSlug ?? '';

  // Use real beaches count if available, otherwise fallback mock
  const regionBeachesCount = regionDetails?.beaches_count ?? 123;

  // For now we don't have accommodations count on API, so keep mock
  const regionAccommodationsCount = 569;

  const { data: regionWeatherResponse, isLoading: isRegionWeatherLoading } =
    useRegionWeather({
      slug: regionSlugValue,
      countryCode,
      locale,
      enabled: !!regionSlugValue,
    });

  const regionWeather = regionWeatherResponse?.data?.weather ?? null;

  const regionWeatherLocationName = regionWeather?.location_name ?? regionName;

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

  // Temporary mock islands data (replace with real API later)
  const baseIsland: Country = {
    code: 'KRK',
    name: 'Krk',
    beaches_count: 112,
  } as Country;

  const islandItems: Country[] = Array.from({ length: 6 }, (_, i) => ({
    ...baseIsland,
    code: `ISL-${i + 1}`,
    name: `Island ${i + 1}`,
  })) as Country[];

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

  useEffect(() => {
    if (!pathname) return;
    // You can add tracking or side-effects here later if needed
  }, [pathname]);

  // Simple loading / error states (can style nicer later)
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
      {/* Shared top bar: breadcrumbs + region prev/next */}
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
        image="/images/banner/region-banner.jpg"
        title={regionName}
        topBarVariant="region"
        accommodationCount={regionAccommodationsCount}
        beachCount={regionBeachesCount}
        weather={regionWeather}
        weatherLocationName={regionWeatherLocationName}
        isWeatherLoading={isRegionWeatherLoading}
      />

      {/* Most visited beaches in region */}
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

      {/* Featured accommodations in region */}
      <AccommodationSection
        title={tRegion('featuredAccommodationsTitle', { region: regionName })}
        totalCount={regionAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      {/* Islands carousel */}
      <DestinationsCarousel
        items={islandItems}
        title={tRegion('islandsTitle', { region: regionName })}
        countLabel={tRegion('allIslandsCount', {
          count: islandItems.length,
        })}
        badgeLabel={tRegion('islandBadge')}
        cardVariant="island"
      />

      {/* Cities carousel */}
      <DestinationsCarousel
        items={cityItems}
        title={tRegion('citiesTitle', { region: regionName })}
        countLabel={tRegion('allCitiesCount', {
          count: cityItems.length,
        })}
        badgeLabel={tRegion('cityBadge')}
        cardVariant="city"
      />

      <RegionSearchBeaches
        countries={regionCountries}
        regionName={regionName}
      />
    </>
  );
}

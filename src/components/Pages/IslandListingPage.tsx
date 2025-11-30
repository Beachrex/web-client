'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicTopBar from '@/components/DynamicTopBar';
import IslandDestinationsSection from '@/components/IslandPage/IslandDestinationsSection';
import IslandSearchBeaches from '@/components/IslandPage/IslandSearchBeaches';
import PropertySection, { type Property } from '@/components/PropertySection';

import type { Country } from '@/lib/api-client/types.gen';
import { ChevronRight } from 'lucide-react';

import { useIslandDetails } from '@/hooks/useIslandDetails';
import { buildIslandUrlFromNavigation } from '@/lib/utils/beach-urls';

interface IslandListingPageProps {
  islandSlug?: string;
  islandDataProp?: unknown; // reserved for possible server data hydration later
}

export default function IslandListingPage({
  islandSlug: _islandSlug,
  islandDataProp: _islandDataProp,
}: IslandListingPageProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const tIsland = useTranslations('IslandPage');
  const tProperty = useTranslations('PropertySection');

 // Fetch island details from API by slug
const { islandDetails, loading: _loading, error: _error } = useIslandDetails(
  _islandSlug ?? '',
  // countryCode – optional filter, not used for now
  undefined,
  // regionCode – optional filter, not used for now
  undefined,
  Boolean(_islandSlug),
);


  useEffect(() => {
    if (!pathname) return;
    // Optional: analytics / side-effects for route changes
  }, [pathname]);

  // Island name – prefer API, then slug, then fallback
  const islandName =
    islandDetails?.name ??
    _islandSlug ??
    'Cres';

  // Beach / accommodation counts – use API when available, otherwise fallback
  const islandBeachesCount = islandDetails?.beaches_count ?? 112;
  const islandAccommodationsCount = 245; // TODO: wire from API when backend exposes this

  // Temporary mock beach data (replace with real API later)
  const baseBeach: Property = {
    id: '1',
    image:
      'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
    title: 'Plaža Ladinka',
    location: `${islandName}, Croatia`,
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

  // Temporary mock countries data used in search section
  const islandCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
    code: `country-${i}`,
    name: `Country ${i + 1}`,
    full_name: `Country ${i + 1}`,
    beaches_count: 112,
    image_path: null,
  })) as Country[];

  return (
    <>
      {/* Shared top bar: breadcrumbs + island prev/next navigation */}
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={islandDetails?.navigation}
        buildUrl={(item) =>
          buildIslandUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale,
          )
        }
      />

      <BannerSection
        image="/images/banner/island-banner.jpg"
        title={islandName}
        topBarVariant="island"
        accommodationCount={islandAccommodationsCount}
        beachCount={islandBeachesCount}
      />

      {/* Most visited beaches on island */}
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

      {/* Featured accommodations on island */}
      <AccommodationSection
        title={tIsland('featuredAccommodationsTitle', { island: islandName })}
        totalCount={islandAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      <IslandDestinationsSection islandName={islandName} cityItems={cityItems} />

      <IslandSearchBeaches
        countries={islandCountries}
        islandName={islandName}
      />
    </>
  );
}

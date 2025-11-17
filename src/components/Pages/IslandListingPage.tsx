'use client';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import PropertySection, { type Property } from '@/components/PropertySection';
import { type Country } from '@/lib/api-client/types.gen';
import IslandDestinationsSection from '../IslandPage/IslandDestinationsSection';
import IslandSearchBeaches from '../IslandPage/IslandSearchBeaches';

interface IslandListingPageProps {
  islandSlug?: string;
  islandDataProp?: unknown;
}

export default function IslandListingPage({
  islandSlug: _islandSlug,
  islandDataProp: _islandDataProp,
}: IslandListingPageProps) {
  const pathname = usePathname();
  const tIsland = useTranslations('IslandPage');
  const tProperty = useTranslations('PropertySection');

  useEffect(() => {
    if (!pathname) return;
  }, [pathname]);

  // TEST DATA
  const islandName = _islandSlug ?? 'Cres';
  const islandBeachesCount = 112;
  const islandAccommodationsCount = 245;

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

  const islandCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
    code: `country-${i}`,
    name: `Country ${i + 1}`,
    full_name: `Country ${i + 1}`,
    beaches_count: 112,
    image_path: null,
  })) as Country[];

  return (
    <>
      <div className="container mx-auto p-4">
        <DynamicBreadcrumbs pathname={pathname ?? ''} />
      </div>

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
            className="font-figtree text-[13px] font-bold leading-none text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
          >
            {tProperty('allBeachesLink', { count: beachProperties.length })}
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

      <IslandDestinationsSection
        islandName={islandName}
        cityItems={cityItems}
      />

      <IslandSearchBeaches
        countries={islandCountries}
        islandName={islandName}
      />
    </>
  );
}

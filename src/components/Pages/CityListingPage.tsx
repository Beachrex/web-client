'use client';

import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import PropertySection, { type Property } from '@/components/PropertySection';
import { type Country } from '@/lib/api-client/types.gen';
import { ChevronRight } from 'lucide-react';
import AccommodationSection from '../AccommodationCard/AccommodationsSection';
import BannerSection from '../BannerSection/BannerSection';
import CityCategories from '../CityPage/CityCategories';
import CitySearchBeaches from '../CityPage/citySearchBeaches';
import DestinationsCarousel from '../DestinationsCarousel';

interface CityListingPageProps {
  citySlug?: string;
  cityDataProp?: unknown;
}

export default function CityListingPage({
  citySlug: _citySlug,
  cityDataProp: _cityDataProp,
}: CityListingPageProps) {
  const pathname = usePathname();

  const tTown = useTranslations('TownPage');
  const tProperty = useTranslations('PropertySection');

  const tRegion = useTranslations('RegionPage');

  useEffect(() => {
    if (!pathname) return;
  }, [pathname]);

  // TEST DATA
  const cityName = _citySlug ?? 'Malinska';
  const cityBeachesCount = 112;
  const cityAccommodationsCount = 245;

  // Temporary mock beach data (replace with real API later)
  const baseBeach: Property = {
    id: '1',
    image:
      'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
    title: 'Plaža Ladinka',
    location: `${cityName}, Croatia`,
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

  // Temporary mock countries data for city search (replace with real API later)
  const cityCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
    code: `country-${i}`,
    name: `Country ${i + 1}`,
    full_name: `Country ${i + 1}`,
    beaches_count: 112,
    image_path: null,
  })) as Country[];

  // Temporary mock islands data (replace with real API later)

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

  return (
    <>
      {/* Simple header with breadcrumbs – same style as Continent Banner */}
      <div className="border-b bg-white py-4">
        <div className="container mx-auto">
          <DynamicBreadcrumbs pathname={pathname ?? ''} />
        </div>
      </div>

      <BannerSection
        image="/images/banner/island-banner.jpg"
        title={cityName}
        topBarVariant="city"
        accommodationCount={cityAccommodationsCount}
        beachCount={cityBeachesCount}
      />

      {/* Most visited beaches in town */}
      <PropertySection
        title={tTown('popularBeachesTitle', { town: cityName })}
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

      {/* Featured accommodations in town */}
      <AccommodationSection
        title={tTown('featuredAccommodationsTitle', { town: cityName })}
        totalCount={cityAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      <CityCategories />

      <CitySearchBeaches countries={cityCountries} townName={cityName} />

      {/* Cities carousel */}
      <DestinationsCarousel
        items={cityItems}
        title={tTown('categories.citiesTitle')}
        countLabel={tRegion('allCitiesCount', {
          count: cityItems.length,
        })}
        badgeLabel={tRegion('cityBadge')}
        cardVariant="city"
      />
    </>
  );
}

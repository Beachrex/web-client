'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import PropertySection, { type Property } from '@/components/PropertySection';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import CountryDestinationsSection from '@/components/CountryPage/CountryDestinationsSection';
import CountrySearchBeaches from '@/components/CountryPage/CountrySearchBeaches';
import type { Country } from '@/lib/api-client/types.gen';

interface CountryListingPageProps {
  countrySlug?: string;
  countryDataProp?: unknown;
}

const Page = ({ countrySlug }: CountryListingPageProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
  }, [pathname]);

  const countryName = countrySlug ?? 'Hrvaška';
  const countryBeachesCount = 112;
  const countryAccommodationsCount = 245;

  const tCountry = useTranslations('countryPage');
  const tProperty = useTranslations('PropertySection');

  // Temporary mock beach data (replace with real API later)
  const baseBeach: Property = {
    id: '1',
    image:
      'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
    title: 'Plaža Ladinka',
    location: `${countryName}`,
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

  // Temporary mock regions data
  const baseRegion: Country = {
    code: 'DAL',
    name: 'Dalmacija',
    beaches_count: 112,
  } as Country;

  const regionItems: Country[] = Array.from({ length: 6 }, (_, i) => ({
    ...baseRegion,
    code: `REG-${i + 1}`,
    name: `Regija ${i + 1}`,
  })) as Country[];

  // Temporary mock cities data
  const baseCity: Country = {
    code: 'BAŠKA',
    name: 'Baška',
    beaches_count: 112,
  } as Country;

  const cityItems: Country[] = Array.from({ length: 6 }, (_, i) => ({
    ...baseCity,
    code: `CITY-${i + 1}`,
    name: `Mesto ${i + 1}`,
  })) as Country[];

  // Temporary mock islands data
  const baseIsland: Country = {
    code: 'KRK',
    name: 'Krk',
    beaches_count: 112,
  } as Country;

  const islandItems: Country[] = Array.from({ length: 6 }, (_, i) => ({
    ...baseIsland,
    code: `ISL-${i + 1}`,
    name: `Otok ${i + 1}`,
  })) as Country[];

  const countryCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
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
        title={countryName}
        topBarVariant="country"
        accommodationCount={countryAccommodationsCount}
        beachCount={countryBeachesCount}
      />

      {/* Most visited beaches in country */}
      <PropertySection
        title={tCountry('popularBeachesTitle', { country: countryName })}
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

      {/* Featured accommodations in country */}
      <AccommodationSection
        title={tCountry('featuredAccommodationTitle', { country: countryName })}
        totalCount={countryAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      {/* Regions / Cities / Islands carousels */}
      <CountryDestinationsSection
        countryName={countryName}
        regionItems={regionItems}
        cityItems={cityItems}
        islandItems={islandItems}
      />

      <CountrySearchBeaches
        countries={countryCountries}
        countryName={countryName}
      />
    </>
  );
};

export default Page;

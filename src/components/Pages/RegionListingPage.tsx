'use client';

import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import PropertySection, { type Property } from '@/components/PropertySection';
import type { Country } from '@/lib/api-client/types.gen';
import { ChevronRight } from 'lucide-react';
import AccommodationSection from '../AccommodationCard/AccommodationsSection';
import BannerSection from '../BannerSection/BannerSection';
import DestinationsCarousel from '../DestinationsCarousel';
import RegionSearchBeaches from '../regions/RegionSearchBeaches';

interface RegionListingPageProps {
  regionSlug?: string;
}

export default function RegionListingPage({
  regionSlug,
}: RegionListingPageProps) {
  const pathname = usePathname();

  const tRegion = useTranslations('RegionPage');
  const tProperty = useTranslations('PropertySection');

  const regionName = regionSlug ?? 'Kvarner';

  // TODO: replace with real API data later
  const regionBeachesCount = 123;
  const regionAccommodationsCount = 569;

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
  }, [pathname]);

  return (
    <>
      <BannerSection
        image="/images/banner/region-banner.jpg"
        title={regionName}
        topBarVariant="region"
        accommodationCount={regionAccommodationsCount}
        beachCount={regionBeachesCount}
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
        totalCount={569}
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

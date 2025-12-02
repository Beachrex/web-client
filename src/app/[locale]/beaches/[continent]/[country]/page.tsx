'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import CountryDestinationsSection from '@/components/CountryPage/CountryDestinationsSection';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import { buildCdnUrl } from '@/lib/utils/beach-images';


import { usePathname } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import { useCities } from '@/hooks/useCities';
import { useCountryDetails } from '@/hooks/useCountryDetails';
import { useIslands } from '@/hooks/useIslands';
import { useRegions } from '@/hooks/useRegions';
import type { Country } from '@/lib/api-client/types.gen';
import { buildCountryUrlFromNavigation } from '@/lib/utils/beach-urls';

interface PageProps {
  params: {
    locale: string;
    continent: string;
    country: string; // expected to be ISO code, e.g. "si", "hr"
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

const Page = ({ params }: PageProps) => {
  const pathname = usePathname();
  const locale = useLocale();

  const { country: countryParam } = params;

  // Fetch country details by ISO code (e.g. "SI", "HR")
  const { countryDetails } = useCountryDetails(countryParam);

const { regions } = useRegions(countryDetails?.code ?? '');
const { cities } = useCities(countryDetails?.code ?? '');
const { islands } = useIslands(countryDetails?.code ?? '');


  const tCountry = useTranslations('countryPage');
  const tProperty = useTranslations('PropertySection');

  // Name & counts from API with sensible fallbacks
  const countryName =
    countryDetails?.name ??
    countryDetails?.full_name ??
    countryParam.toUpperCase();

  const countryBeachesCount = countryDetails?.beaches_count ?? 0;
  const countryAccommodationsCount = 0; // still mock until real data exists

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


  const regionItems = regions ?? [];


  const cityItems = cities ?? [];


  const islandItems = islands ?? [];

  const countryCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
    code: `country-${i}`,
    name: `Country ${i + 1}`,
    full_name: `Country ${i + 1}`,
    beaches_count: 112,
    image_path: null,
  })) as Country[];


const bannerImage = buildCdnUrl(countryDetails?.main_image, 'banner');

const bottomBadges =
  countryDetails?.badges
    ?.filter((badge) => badge.name && badge.icon) // only complete
    ?.map((badge) => ({
      label: badge.name!,
      icon: buildCdnUrl(badge.icon, 'icon')!,
    })) ?? [];


const infoCards =
  countryDetails?.articles
    ?.filter((article) => article.title && article.excerpt && article.feature_image)
    ?.map((article) => ({
      title: article.title!,
      subtitle: article.excerpt!,
      image: buildCdnUrl(article.feature_image, 'list')!,
      link: article.slug ? `/${locale}/articles/${article.slug}` : undefined,
    })) ?? [];


  return (
    <>
      {/* Shared top bar: breadcrumbs on left, country prev/next on right */}
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={countryDetails?.navigation}
        buildUrl={(item) =>  buildCountryUrlFromNavigation(
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
        title={countryName}
        topBarVariant="country"
        accommodationCount={countryAccommodationsCount}
        beachCount={countryBeachesCount}
           badges={bottomBadges.length > 0 ? bottomBadges : undefined}
  infoCards={infoCards.length > 0 ? infoCards : undefined}
      />

      {/* Most visited beaches in country */}
      <PropertySection
        title={tCountry('popularBeachesTitle', { country: countryName })}
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

    <DynamicSearchBeaches
  countries={countryCountries}
  contextName={countryName}

  translationNamespace="countryPage"
  titleKey="browseBeachesTitle"
  titleParams={{ country: countryName }}

  filterButtonColor="#DD0000"
    />

    </>
  );
};

export default Page;

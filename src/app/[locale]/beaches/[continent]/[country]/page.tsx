'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import CountryDestinationsSection from '@/components/CountryPage/CountryDestinationsSection';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';

import { usePathname } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildCountryUrlFromNavigation } from '@/lib/utils/beach-urls';

import { useCountryDetails } from '@/hooks/useCountryDetails';
import { useRegions } from '@/hooks/useRegions';
import { useCities } from '@/hooks/useCities';
import { useIslands } from '@/hooks/useIslands';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';

import type { Country } from '@/lib/api-client/types.gen';

interface PageProps {
  params: {
    locale: string;
    continent: string;
    country: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function Page({ params }: PageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const { country: countryParam } = params;

  // DETAILS
  const { countryDetails } = useCountryDetails(countryParam);

  // DESTINATIONS
  const { regions } = useRegions(countryDetails?.code ?? '');
  const { cities } = useCities(countryDetails?.code ?? '');
  const { islands } = useIslands(countryDetails?.code ?? '');

  const tCountry = useTranslations('countryPage');
  const tProperty = useTranslations('PropertySection');

  // COUNTRY NAME
  const countryName =
    countryDetails?.name ??
    countryDetails?.full_name ??
    countryParam.toUpperCase();

  // COUNTS
  const countryBeachesCount = countryDetails?.beaches_count ?? 0;
  const countryAccommodationsCount = 0;

  // 📌 MOST VISITED BEACHES — REAL API
  const { data: mostVisited = [] } = useMostVisitedBeaches({
    country_code: countryDetails?.code,
    limit: 20,
  });

  // Capitalize
  const cap = (str?: string | null) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  // Transform for PropertySection
  const beachProperties: Property[] = mostVisited.map((beach) => ({
    id: String(beach.id ?? ''),

    image:
      buildCdnUrl(beach.main_image, 'carousel') ??
      '/images/propertycard/card-banner.jpg',

    title: beach.name ?? 'Unknown beach',

    location: cap(beach.city_slug ?? beach.region_slug), // brez države

    price: Math.floor(Math.random() * 20) + 15,
    originalPrice: Math.floor(Math.random() * 40) + 45,
    rating: 3.5 + Math.random() * 1.5,
    reviews: Math.floor(Math.random() * 300) + 10,
    discount: `${Math.floor(Math.random() * 20) + 5}`,

    isFreeBreakfast: false,
    isFreeCancellation: true,
  }));

  // Destination carousels
  const regionItems = regions ?? [];
  const cityItems = cities ?? [];
  const islandItems = islands ?? [];

  // Search dropdown countries — MOCK (will be replaced later)
  const countryCountries: Country[] = Array.from({ length: 16 }, (_, i) => ({
    code: `country-${i}`,
    name: `Country ${i + 1}`,
    full_name: `Country ${i + 1}`,
    beaches_count: 112,
    image_path: null,
  }));

  // Banner image
  const bannerImage = buildCdnUrl(countryDetails?.main_image, 'banner');

  // BADGES
  const bottomBadges =
    countryDetails?.badges
      ?.filter((b) => b.name && b.icon)
      ?.map((b) => ({
        label: b.name!,
        icon: buildCdnUrl(b.icon, 'icon')!,
      })) ?? [];

  // INFOCARDS
  const infoCards =
    countryDetails?.articles
      ?.filter((a) => a.title && a.excerpt && a.feature_image)
      ?.map((a) => ({
        title: a.title!,
        subtitle: a.excerpt!,
        image: buildCdnUrl(a.feature_image, 'list')!,
        link: a.slug ? `/${locale}/articles/${a.slug}` : undefined,
      })) ?? [];

  return (
    <>
      {/* TOP BAR */}
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={countryDetails?.navigation}
        buildUrl={(item) =>
          buildCountryUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale,
          )
        }
      />

      {/* HERO */}
      <BannerSection
        image={bannerImage}
        title={countryName}
        topBarVariant="country"
        accommodationCount={countryAccommodationsCount}
        beachCount={countryBeachesCount}
        badges={bottomBadges.length ? bottomBadges : undefined}
        infoCards={infoCards.length ? infoCards : undefined}
      />

      {/* MOST VISITED BEACHES */}
      <PropertySection
        title={tCountry('popularBeachesTitle', { country: countryName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <a
            href="#"
            className="flex items-center font-figtree text-[14px] font-bold text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
          >
            {tProperty('allBeachesLink', { count: beachProperties.length })}
            <ChevronRight className="h-4 w-4" />
          </a>
        }
      />

      {/* ACCOMMODATIONS */}
      <AccommodationSection
        title={tCountry('featuredAccommodationTitle', { country: countryName })}
        totalCount={countryAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      {/* REGIONS / CITIES / ISLANDS */}
      <CountryDestinationsSection
        countryName={countryName}
        regionItems={regionItems}
        cityItems={cityItems}
        islandItems={islandItems}
      />

      {/* SEARCH BEACHES */}
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
}

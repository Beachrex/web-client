'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import CountryDestinationsSection from '@/components/CountryPage/CountryDestinationsSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';

import { usePathname } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildCountryUrlFromNavigation } from '@/lib/utils/beach-urls';

import { useCities } from '@/hooks/useCities';
import { useCountryDetails } from '@/hooks/useCountryDetails';
import { useIslands } from '@/hooks/useIslands';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { useRegions } from '@/hooks/useRegions';


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

  const { data: mostVisited = [] } = useMostVisitedBeaches({
    country_code: countryDetails?.code,
    limit: 20,
  });

  // CAPITALIZE helper
  const cap = (str?: string | null) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const { data: mostVisitedTop = [] } = useMostVisitedBeaches({
  country_code: countryDetails?.code,
  limit: 20,
});

const mostVisitedSet = new Set(mostVisitedTop.map(b => b.id));


 const beachProperties: Property[] = mostVisited.map((beach) => {
  const image = buildCdnUrl(beach.main_image, 'list');
  if (!image) throw new Error(`Beach ID ${beach.id} missing main_image`);

  return {
    id: String(beach.id),
    image,
    title: beach.name ?? 'Unknown beach',
    location: cap(beach.city_slug ?? beach.region_slug),

    price: 0,
    originalPrice: 0,
    rating: 0,
    reviews: 0,
    discount: '0',

    isFreeBreakfast: false,
    isFreeCancellation: true,

    // ⭐ NEW:
    isMostVisited: mostVisitedSet.has(beach.id),
  };
});


  const regionItems =
    regions?.map((r) => ({
      ...r,
      image: buildCdnUrl(r.main_image, 'list'),
    })) ?? [];

  const cityItems =
    cities?.map((c) => ({
      ...c,
      image: buildCdnUrl(c.main_image, 'list'),
    })) ?? [];

  const islandItems =
    islands?.map((i) => ({
      ...i,
      image: buildCdnUrl(i.main_image, 'list'),
    })) ?? [];

  // BANNER IMAGE (NO FALLBACK)
  const bannerImage = buildCdnUrl(countryDetails?.main_image, 'banner');

  // BADGES
  const bottomBadges =
  countryDetails?.badges
    ?.filter((b) => b.name && b.icon)
    ?.map((b) => {
      const icon = buildCdnUrl(b.icon, 'icon');
      if (!icon) {
        throw new Error(`Missing icon for badge ${b.name}`);
      }

      return {
        label: b.name!,
        icon,
      };
    }) ?? [];


  const infoCards =
  countryDetails?.articles
    ?.filter((a) => a.title && a.excerpt && a.feature_image)
    ?.map((a) => {
      const image = buildCdnUrl(a.feature_image, 'list');
      if (!image) {
        throw new Error(`Missing feature_image for article ${a.title}`);
      }

      return {
        title: a.title!,
        subtitle: a.excerpt!,
        image,
        link: a.slug ? `/${locale}/articles/${a.slug}` : undefined,
      };
    }) ?? [];

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
  translationNamespace="countryPage"
  titleKey="browseBeachesTitle"
  titleParams={{ country: countryName }}
  filterButtonColor="#DD0000"
  filters={{
    country: countryDetails?.code,
    limit: 100,
  }}
    />

    </>
  );
}

'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BannerSection from '@/components/BannerSection/BannerSection';
import CountryDestinationsSection from '@/components/CountryPage/CountryDestinationsSection';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import DynamicTopBar from '@/components/DynamicTopBar';
import PropertySection, { type Property } from '@/components/PropertySection';
import { usePathname } from '@/i18n/routing';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildCountryUrlFromNavigation } from '@/lib/utils/beach-urls';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { useCities } from '@/hooks/useCities';
import { useCountryDetails } from '@/hooks/useCountryDetails';
import { useIslands } from '@/hooks/useIslands';
import { useMostVisitedBeaches } from '@/hooks/useMostVisitedBeaches';
import { useRegions } from '@/hooks/useRegions';
import { mapArticlesToInfoCards } from '@/lib/mappers/mapArticlesToInfoCards';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';

interface PageProps {
  params: {
    locale: string;
    continent: string;
    country: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}


/* ---------------------------------------------
   FIX: YOUTUBE URL → EMBED URL
---------------------------------------------- */

export default function Page({ params }: PageProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const { country: countryParam } = params;

  const { countryDetails } = useCountryDetails(countryParam);

  const { regions } = useRegions(countryDetails?.code ?? '');
  const { cities } = useCities(countryDetails?.code ?? '');
  const { islands } = useIslands(countryDetails?.code ?? '');

  const tCountry = useTranslations('countryPage');
  const tProperty = useTranslations('PropertySection');

  const countryName =
    countryDetails?.name ??
    countryDetails?.full_name ??
    countryParam.toUpperCase();

  const countryBeachesCount = countryDetails?.beaches_count ?? 0;
  const countryAccommodationsCount = 0;

  const { data: mostVisited = [] } = useMostVisitedBeaches({
    country_code: countryDetails?.code,
    limit: 20,
  });


  const { data: mostVisitedTop = [] } = useMostVisitedBeaches({
    country_code: countryDetails?.code,
    limit: 20,
  });
const mostVisitedSet = new Set(
  mostVisitedTop
    .map((b) => b.id)
    .filter((id): id is number => typeof id === 'number'),
);


  const beachProperties: Property[] =
  mostVisited
    ?.map((beach) =>
      mapBeachToProperty(beach, {
        mostVisitedSet,
        locationFallback: countryName,
      }),
    )
    .filter((p): p is Property => p !== null) ?? [];

  /* Regions / Cities / Islands */
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

  const bannerImage = buildCdnUrl(countryDetails?.main_image, 'banner');

  const bottomBadges =
    countryDetails?.badges
      ?.filter((b) => b.name)
      ?.map((b) => ({
        label: b.name!,
        icon: b.icon ? buildCdnUrl(b.icon, 'icon') : null,
      })) ?? [];

  const topBarCountry = countryDetails
    ? {
        code: countryDetails.code,
        name: countryDetails.name,
      }
    : undefined;

 const infoCards = mapArticlesToInfoCards(
  countryDetails?.articles,
  locale,
);


  /* ---------------------------------------------
     RENDER PAGE
  ---------------------------------------------- */
  return (
    <>
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={countryDetails?.navigation}
        buildUrl={(item) =>
          buildCountryUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale
          )
        }
      />

      <BannerSection
        image={bannerImage}
        title={countryName}
        topBarVariant="country"
        country={topBarCountry}
        continent={countryDetails?.continent}
        accommodationCount={countryAccommodationsCount}
        beachCount={countryBeachesCount}
        badges={bottomBadges.length ? bottomBadges : undefined}
        infoCards={infoCards.length ? infoCards : undefined}
      />

      {/* --------------------------
          POPULAR BEACHES SECTION
      --------------------------- */}
      <PropertySection
        title={tCountry('popularBeachesTitle', { country: countryName })}
        totalCount={beachProperties.length}
        properties={beachProperties}
        headerRight={
          <a
            href="#"
            className="flex items-center font-figtree text-[14px] font-bold text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
          >
            {tProperty('allBeachesLink', {
              count: beachProperties.length,
            })}
            <ChevronRight className="h-4 w-4" />
          </a>
        }
      />

      <AccommodationSection
        title={tCountry('featuredAccommodationTitle', { country: countryName })}
        totalCount={countryAccommodationsCount}
        showDropdown
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      <CountryDestinationsSection
        countryName={countryName}
        regionItems={regionItems}
        cityItems={cityItems}
        islandItems={islandItems}
      />

      <DynamicSearchBeaches
        translationNamespace="countryPage"
        titleKey="browseBeachesTitle"
        titleParams={{ country: countryName }}
        filterButtonColor="#DD0000"
        filters={{
          country: countryDetails?.code,
          limit: 20,
        }}
      />
    </>
  );
}

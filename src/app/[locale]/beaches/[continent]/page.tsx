import BannerSection from '@/components/BannerSection/BannerSection';
import ContinentCountriesSection from '@/components/Continent/ContinentCountriesSection';
import SearchContinent from '@/components/Continent/SearchContinent';
import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import { PropertySection } from '@/components/PropertySection';

import {
  getContinent,
  getContinents,
  getMostVisitedBeaches,
} from '@/lib/api-client/sdk.gen';

import type { AcceptLanguage } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';


interface PageProps {
  params: Promise<{
    locale: string;
    continent: string;
  }>;
}

// Validate continent slug
const validateAndGetContinentCode = async (
  continentSlug: string,
  locale: string,
): Promise<string | null> => {
  try {
    const { data: continentsResponse } = await getContinents({
      headers: { 'Accept-Language': locale as AcceptLanguage },
    });

    const continent = continentsResponse?.data?.find(
      (c) => c.slug?.toLowerCase() === continentSlug.toLowerCase(),
    );

    return continent?.code ?? null;
  } catch {
    return null;
  }
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });

  try {
    const continentCode = await validateAndGetContinentCode(
      resolvedParams.continent,
      resolvedParams.locale,
    );

    if (!continentCode) throw new Error('Invalid continent');

    const { data } = await getContinent({
      path: { code: continentCode },
      headers: { 'Accept-Language': resolvedParams.locale as AcceptLanguage },
    });

    const continent = data?.data;

    return {
      title: t('metaTitle', { continent: continent?.name ?? '' }),
      description: t('description', { continent: continent?.name ?? '' }),
    };
  } catch {
    const fallback =
      resolvedParams.continent.charAt(0).toUpperCase() +
      resolvedParams.continent.slice(1);

    return {
      title: t('metaTitle', { continent: fallback }),
      description: t('description', { continent: fallback }),
    };
  }
}

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const pathname = `/beaches/${resolvedParams.continent}`;

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });

  try {
    const continentCode = await validateAndGetContinentCode(
      resolvedParams.continent,
      resolvedParams.locale,
    );

    if (!continentCode) notFound();

    // Fetch continent data
    const { data: continentResponse } = await getContinent({
      path: { code: continentCode },
      headers: { 'Accept-Language': resolvedParams.locale as AcceptLanguage },
    });

    const continent = continentResponse?.data;
    if (!continent) notFound();


    // Fetch MOST VISITED beaches
    const { data: mostVisitedResponse } = await getMostVisitedBeaches({
      query: {
        continent_code: continentCode,
        limit: 20,
      },
      headers: {
        'Accept-Language': resolvedParams.locale as AcceptLanguage,
      },
    });

    const mostVisited = mostVisitedResponse?.data ?? [];

 // MOST VISITED → PropertySection (SSR-safe, no fallback, no random)
const transformedProperties = mostVisited.map((beach) => {
  const image = buildCdnUrl(beach.main_image, 'list');
  if (!image) {
    throw new Error(`Beach ID ${beach.id} is missing main_image`);
  }

  return {
    id: String(beach.id),

    image, // ✔ guaranteed string
    title: beach.name ?? 'Unknown beach',
    location: beach.city_slug ?? beach.region_slug ?? '',

    // ✔ no random → SSR stable (until API gives real values)
    price: 0,
    originalPrice: 0,
    rating: 0,
    reviews: 0,
    discount: '0',

    isFreeBreakfast: false,
    isFreeCancellation: false,
  };
});


    const bannerImage = continent.main_image
      ? buildCdnUrl(continent.main_image, 'banner')
      : null;

    return (
      <>
        <div className="bg-white py-4">
          <div className="container mx-auto">
            <DynamicBreadcrumbs pathname={pathname} />
          </div>
        </div>

        <BannerSection
          image={bannerImage}
          title={continent.name ?? ''}
          continent={continent}
          accommodationCount={continent.accommodation_count ?? 0}
          beachCount={continent.beaches_count ?? 0}
          topBarVariant="continent"
        />

        <PropertySection
          title={t('popularDestinations', { continent: continent.name })}
          properties={transformedProperties}
        />

        <SearchContinent
          continent={continent}
          continentSlug={resolvedParams.continent}
        />

        <ContinentCountriesSection />

        <DynamicSearchBeaches
  translationNamespace="SearchBeach"
  titleKey="title"
  filterButtonColor="#5E1CA5"
  filters={{
    continent_code: continent.code,
    limit: 100,
  }}
        />

      </>
    );
  } catch (error) {
    console.error('Error loading continent:', error);
    notFound();
  }
};

export default Page;

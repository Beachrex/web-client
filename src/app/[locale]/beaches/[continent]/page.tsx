import BannerSection from '@/components/BannerSection/BannerSection';
import ContinentCountriesSection from '@/components/Continent/ContinentCountriesSection';
import SearchContinent from '@/components/Continent/SearchContinent';
import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import DynamicSearchBeaches from '@/components/DynamicSearchBeaches';
import { PropertySection } from '@/components/PropertySection';
import {
  getContinent,
  getContinents,
  getCountries,
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

// Validate continent slug and get code by fetching from API
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
  } catch (error) {
    console.error('Error validating continent:', error);
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
    // Validate and get continent code
    const continentCode = await validateAndGetContinentCode(
      resolvedParams.continent,
      resolvedParams.locale,
    );
    if (!continentCode) {
      throw new Error('Invalid continent');
    }

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
    // Fallback to capitalized slug if API fails
    const capitalizedContinent =
      resolvedParams.continent.charAt(0).toUpperCase() +
      resolvedParams.continent.slice(1);

    return {
      title: t('metaTitle', { continent: capitalizedContinent }),
      description: t('description', { continent: capitalizedContinent }),
    };
  }
}

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });
  const pathname = `/beaches/${resolvedParams.continent}`;

  try {
    // Validate and get continent code
    const continentCode = await validateAndGetContinentCode(
      resolvedParams.continent,
      resolvedParams.locale,
    );
    if (!continentCode) {
      notFound();
    }

    const { data: continentResponse } = await getContinent({
      path: { code: continentCode },
      headers: { 'Accept-Language': resolvedParams.locale as AcceptLanguage },
    });
    const continent = continentResponse?.data;

    if (!continent) {
      notFound();
    }

    // Get countries for this continent
    const { data: countriesResponse } = await getCountries({
      query: { continent: continentCode },
      headers: { 'Accept-Language': resolvedParams.locale as AcceptLanguage },
    });
    const countries = countriesResponse?.data ?? [];


    // Transform countries to property format for now (until we have real accommodation data)
    const transformedProperties = countries
      .slice(0, 8)
      .filter((country) => country.code && country.name)
      .map((country) => ({
        id: country.code!,
        image: country.main_image
          ? buildCdnUrl(country.main_image, 'carousel') ?? '/images/spain.jpg'
          : '/images/spain.jpg',
        title: country.full_name ?? country.name!,
        location: `${country.name}, ${continent.name}`,
        price: Math.floor(Math.random() * 200) + 50, // Mock price until we have real data
        originalPrice: Math.floor(Math.random() * 100) + 200,
        rating: 4.0 + Math.random() * 0.9,
        reviews: Math.floor(Math.random() * 300) + 50,
        discount: `${Math.floor(Math.random() * 25) + 10}`, // Convert to string
        isFreeBreakfast: Math.random() > 0.5,
        isFreeCancellation: Math.random() > 0.3,
        beaches_count: country.beaches_count,
      }));

const bannerImage =
  continent.main_image
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
  image={bannerImage ?? null}
  title={continent.name ?? ''}
  continent={continent}
  accommodationCount={continent.accommodation_count ?? 0}
  beachCount={continent.beaches_count ?? 0}
  topBarVariant="continent"
        />


        <PropertySection
          title={t('popularDestinations', { continent: continent.name })}
          properties={transformedProperties ?? []}
        />

        <SearchContinent
          continent={continent}
          continentSlug={resolvedParams.continent}
        />

        {/* top destination section HERE */}
        <ContinentCountriesSection />

    <DynamicSearchBeaches
  countries={countries}
  contextName={continent?.name ?? resolvedParams.continent}

  translationNamespace="SearchBeach"
  titleKey="title"

  filterButtonColor="#5E1CA5"
    />

      </>
    );
  } catch (error: unknown) {
  console.error(
    'Error loading continent data:',
    error instanceof Error ? error : String(error)
  );
  notFound();
}

};

export default Page;

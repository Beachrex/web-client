import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Banner from '@/app/components/Beach/Banner';
import SearchBeach from '@/app/components/Beach/SearchBeach';
import SearchContinent from '@/app/components/Beach/SearchContinent';
import TopDestination from '@/app/components/Home/TopDestination';
import { PropertySection } from '@/app/components/PropertySection';
import { continentService } from '@/app/services/continentService';
import { countryService } from '@/app/services/countryService';
import { getContinentCodeFromSlug, getContinentSlugFromCode, isValidContinentSlug, getAllContinentSlugs } from '@/app/utils/continentMapping';
import type { Continent, Country } from '@/app/types/api';

// Remove unused mockProperties to fix lint errors
const _mockProperties = {
  popularDestinations: [
    {
      id: '1',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Grand Hotel Adriatic',
      location: 'Opatija, Kvarner',
      price: 180,
      originalPrice: 220,
      rating: 4.8,
      reviews: 234,
      discount: '18',
      isFreeBreakfast: true,
      isFreeCancellation: true,
    },
    {
      id: '2',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Seaside Resort & Spa',
      location: 'Crikvenica, Kvarner',
      price: 145,
      rating: 4.6,
      reviews: 189,
      isFreeBreakfast: true,
      isFreeCancellation: false,
    },
    {
      id: '3',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Coastal Villa Apartments',
      location: 'Rijeka, Kvarner',
      price: 95,
      originalPrice: 120,
      rating: 4.4,
      reviews: 156,
      discount: '21',
      isFreeBreakfast: false,
      isFreeCancellation: true,
    },
    {
      id: '4',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Adriatic Bay Hotel',
      location: 'Lovran, Kvarner',
      price: 160,
      rating: 4.7,
      reviews: 287,
      isFreeBreakfast: true,
      isFreeCancellation: true,
    },
    {
      id: '5',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Luxury Beachfront Villa',
      location: 'Mali Lošinj, Lošinj',
      price: 320,
      originalPrice: 400,
      rating: 4.9,
      reviews: 98,
      discount: '20',
      isFreeBreakfast: true,
      isFreeCancellation: true,
    },
    {
      id: '6',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Premium Spa Resort',
      location: 'Rab, Rab Island',
      price: 280,
      rating: 4.8,
      reviews: 145,
      isFreeBreakfast: true,
      isFreeCancellation: false,
    },
    {
      id: '7',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Elite Marina Hotel',
      location: 'Punat, Krk Island',
      price: 245,
      originalPrice: 290,
      rating: 4.7,
      reviews: 203,
      discount: '16',
      isFreeBreakfast: true,
      isFreeCancellation: true,
    },
    {
      id: '8',
      image:
        'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: 'Exclusive Resort & Club',
      location: 'Malinska, Krk Island',
      price: 310,
      rating: 4.9,
      reviews: 167,
      isFreeBreakfast: true,
      isFreeCancellation: true,
    },
  ],
};

interface PageProps {
  params: Promise<{
    locale: string;
    continent: string;
  }>;
}

// Validate continent slug and get code
const validateAndGetContinentCode = (continentSlug: string): string | null => {
  if (!isValidContinentSlug(continentSlug)) {
    return null;
  }
  return getContinentCodeFromSlug(continentSlug);
};

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });

  try {
    // Validate and get continent code
    const continentCode = validateAndGetContinentCode(resolvedParams.continent);
    if (!continentCode) {
      throw new Error('Invalid continent');
    }

    const continent = await continentService.getContinent(continentCode, resolvedParams.locale);

    return {
      title: t('metaTitle', { continent: continent.name }),
      description: t('description', { continent: continent.name }),
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
    const continentCode = validateAndGetContinentCode(resolvedParams.continent);
    if (!continentCode) {
      notFound();
    }

    const continent: Continent = await continentService.getContinent(continentCode, resolvedParams.locale);

    // Get countries for this continent
    const countries: Country[] = await countryService.getCountriesByContinent(continentCode, resolvedParams.locale);

    // Get all continents for navigation
    const allContinents = await continentService.getContinents(resolvedParams.locale);

    // Find current continent index for navigation
    const currentIndex = allContinents.findIndex(c => c.code === continentCode);
    const prevContinent = currentIndex > 0 ? allContinents[currentIndex - 1] : allContinents[allContinents.length - 1];
    const nextContinent = currentIndex < allContinents.length - 1 ? allContinents[currentIndex + 1] : allContinents[0];

    // Get URL slugs for navigation
    const prevSlug = getContinentSlugFromCode(prevContinent.code) ?? prevContinent.code.toLowerCase();
    const nextSlug = getContinentSlugFromCode(nextContinent.code) ?? nextContinent.code.toLowerCase();

    // Transform countries to property format for now (until we have real accommodation data)
    const transformedProperties = countries.slice(0, 8).map((country) => ({
      id: country.code,
      image: country.image_path
        ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${country.image_path}`
        : 'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
      title: country.full_name ?? country.name,
      location: `${country.name}, ${continent.name}`,
      price: Math.floor(Math.random() * 200) + 50, // Mock price until we have real data
      originalPrice: Math.floor(Math.random() * 100) + 200,
      rating: 4.0 + Math.random() * 0.9,
      reviews: Math.floor(Math.random() * 300) + 50,
      discount: Math.floor(Math.random() * 25) + 10,
      isFreeBreakfast: Math.random() > 0.5,
      isFreeCancellation: Math.random() > 0.3,
      beaches_count: country.beaches_count,
    }));

    return (
      <>
        <Banner
          pathname={pathname}
          title={continent.name}
          continent={continent}
          accommodationCount={Math.floor(Math.random() * 100) + 20}
          prevBeach={{
            name: prevContinent.name,
            url: `/beaches/${prevSlug}`,
          }}
          nextBeach={{
            name: nextContinent.name,
            url: `/beaches/${nextSlug}`,
          }}
        />
        <PropertySection
          title={t('popularDestinations', { continent: continent.name })}
          properties={transformedProperties}
        />

        <SearchContinent
          continent={continent}
          continentSlug={resolvedParams.continent}
        />

<TopDestination
          countries={countries}
          continent={continent}
/>

        <SearchBeach
          countries={countries}
          continent={continent}
        />
      </>
    );

  } catch (error) {
    console.error('Error loading continent data:', error);
    // Return 404 if continent not found
    notFound();
  }
};

// Generate static paths for all continents
export function generateStaticParams() {
  const continentSlugs = getAllContinentSlugs();

  return continentSlugs.map((continent) => ({
    continent,
  }));
}

export default Page;

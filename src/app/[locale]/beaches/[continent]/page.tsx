import { getTranslations } from 'next-intl/server';
// import {Link} from '@/i18n/routing';
// import { Button, Carousel, Tooltip } from "flowbite-react";
// import { FaHeart, FaPlay, FaBed, FaMap, FaUmbrellaBeach, FaUser } from 'react-icons/fa';
// import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
// import CountrySection from "@/app/components/CountrySection";
// import DynamicBreadcrumbs from "@/app/components/DynamicBreadcrumbs";
import Banner from '@/app/components/Beach/Banner';
import SearchBeach from '@/app/components/Beach/SearchBeach';
import SearchEurope from '@/app/components/Beach/SearchEurope';
import TopDestination from '@/app/components/Home/TopDestination';
import { PropertySection } from '@/app/components/PropertySection';

// Commented out unused variable to fix lint errors
// const countryData = [
//     { countryName: 'Slovenia', beachCount: '1', hotelPrice: '70€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država B', beachCount: '2', hotelPrice: '60€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država C', beachCount: '3', hotelPrice: '50€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država D', beachCount: '4', hotelPrice: '80€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država E', beachCount: '5', hotelPrice: '90€', link: '/beaches/europe/slovenia' },
//     { countryName: 'Država F', beachCount: '6', hotelPrice: '100€', link: '/beaches/europe/slovenia' },
// ];

const mockProperties = {
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

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });

  // Capitalize first letter of continent
  const capitalizedContinent =
    resolvedParams.continent.charAt(0).toUpperCase() +
    resolvedParams.continent.slice(1);

  return {
    title: t('metaTitle', { continent: capitalizedContinent }),
    description: t('description', { continent: capitalizedContinent }),
  };
}

const Page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ContinentPage',
  });
  const pathname = `/beaches/${resolvedParams.continent}`;

  // Capitalize first letter of continent
  const capitalizedContinent =
    resolvedParams.continent.charAt(0).toUpperCase() +
    resolvedParams.continent.slice(1);

  return (
    <>
      <Banner
        pathname={pathname}
        prevBeach={{
          name: 'Africa',
          url: '/beaches/africa',
        }}
        nextBeach={{
          name: 'Asia',
          url: '/beaches/europe/asia',
        }}
      />
      <PropertySection
        title={t('popularDestinations', { continent: capitalizedContinent })}
        properties={mockProperties.popularDestinations}
      />

      <SearchEurope />

      <TopDestination />

      <SearchBeach />
    </>
  );
};

export default Page;

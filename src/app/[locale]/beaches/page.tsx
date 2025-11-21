'use client';
import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import PropertySection, { type Property } from '@/components/PropertySection';
import WorldBannerSection from '@/components/WorldPage/WorldBanner/WorldBannerSection';
import WorldSearchBeaches from '@/components/WorldPage/WorldSearchBeaches';
import { usePathname } from '@/i18n/routing';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const mockCountries = Array.from({ length: 16 }, (_, i) => ({
  code: `country-${i}`,
  name: `Country ${i + 1}`,
  full_name: `Country ${i + 1}`,
  beaches_count: Math.floor(Math.random() * 200) + 20,
  image_path: null,
}));

const baseBeach: Property = {
  id: '1',
  image:
    'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
  title: 'Plaža Ladinka',
  price: 25,
  originalPrice: 40,
  rating: 7.2,
  reviews: 120,
  discount: '15',
  isFreeBreakfast: false,
  isFreeCancellation: true,
  location: '',
};

const beachProperties: Property[] = Array.from({ length: 4 }, (_, i) => ({
  ...baseBeach,
  id: String(i + 1),
}));

const Page = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return; // Return if slug is not available
    // Here you can handle your routing logic based on the slug
    // For example, you could fetch data or set a state based on the slug
  }, [pathname]);

  const tWorld = useTranslations('WorldTopBar');
  const tProperty = useTranslations('PropertySection');
  const tSEO = useTranslations('WorldSEO');
  return (
    <>
      {/* Simple header with breadcrumbs – same style as Continent Banner */}
      <div className="py-4">
        <div className="container mx-auto">
          <DynamicBreadcrumbs pathname={pathname ?? ''} />
        </div>
      </div>

      <WorldBannerSection
        image="/images/banner/world-banner.png"
        totalCountriesWithBeaches={120}
        totalBeaches={1000}
        totalOpenPools={4300}
        totalIndoorPools={3100}
        totalIslandsWithBeaches={980}
        totalRiverBeaches={22000}
        totalLakeBeaches={15000}
      />

      <PropertySection
        title={tWorld('popularBeachesTitle')}
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

      {/* SEO DESCRIPTION */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-4 font-figtree text-[28px] font-bold leading-[120%] text-[#222] sm:text-[32px]">
            {tSEO('title')}
          </h2>

          <p className="mb-6 font-figtree text-[16px] leading-[26px] text-[#4D4D4D]">
            {tSEO('paragraph1')}
          </p>

          <p className="mb-6 font-figtree text-[16px] leading-[26px] text-[#4D4D4D]">
            {tSEO('paragraph2')}
          </p>

          <p className="font-figtree text-[16px] leading-[26px] text-[#4D4D4D]">
            {tSEO('paragraph3')}
          </p>
        </div>
      </section>

      {/* WORLD BEACH SEARCH LIST */}
      <WorldSearchBeaches countries={mockCountries} />
    </>
  );
};

export default Page;

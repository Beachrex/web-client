'use client';
import { usePathname } from 'next/navigation';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachPageView from '@/components/Beach/BeachBanner/BeachPageView';
import BeachPromoBanner from '@/components/Beach/BeachBanner/BeachPromoBanner';
import BreadCrumbsBeach from '@/components/Beach/BeachBanner/BreadCrumbsBeach';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';
import SimilarBeachesSection from '@/components/Beach/SimilarBeachesSection';
import GetYourGuideSection from '@/components/Beach/GetYourGuideSection';

export default function Page() {
  const pathname = usePathname();

  if (!pathname) return null;

  const baseBeach = {
    id: '1',
    image:
      'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
    title: 'Plaža Ladinka',
    location: 'Baška, Hrvaška',
    price: 25,
    originalPrice: 40,
    rating: 7.2,
    reviews: 120,
    discount: '15',
    isFreeBreakfast: false,
    isFreeCancellation: true,
  };

  const nearbyBeaches = Array.from({ length: 4 }, (_, i) => ({
    ...baseBeach,
    id: String(i + 1), // unique id
  }));

  return (
    <>
      <div className="flex flex-col">
        <BreadCrumbsBeach pathname={pathname} />
      </div>

      <BeachBannerSection />
      <BeachPageView />

      <AccommodationSection
        totalCount={569}
        showDropdown
        items={Array.from({ length: 12 }, () => ({}))}
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('distance', v)}
        onFilterClick={() => console.log('filter')}
        onMapClick={() => console.log('map')}
      />

      <GetYourGuideSection />

      <BeachDetailsSection />

      <SimilarBeachesSection
        properties={nearbyBeaches}
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('similar beaches distance', v)}
      />

      <BeachPromoBanner />
    </>
  );
}

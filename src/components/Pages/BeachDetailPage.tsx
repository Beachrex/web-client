'use client';
import { usePathname } from '@/i18n/routing';
import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachPageView from '@/components/Beach/BeachPageView';
import BreadCrumbsBeach from '@/components/Beach/BeachBanner/BreadCrumbsBeach';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';
import SimilarBeachesSection from '@/components/Beach/SimilarBeachesSection';
import GetYourGuideSection from '@/components/Beach/GetYourGuideSection';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

interface BeachDetailPageProps {
  beachDetails: BeachDetailsSchema;
}

export default function BeachDetailPage({ beachDetails }: BeachDetailPageProps) {
    const pathname = usePathname();

    // Mock data for sections that don't have API data yet
    const baseBeach = {
      id: '1',
      image: 'https://beachrex.fra1.digitaloceanspaces.com/public/img/beaches/hr-102-o-pag/hr-102-o-pag-sl4.jpg',
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
      id: String(i + 1),
    }));

    return (
      <>
        <div className="flex flex-col">
          <BreadCrumbsBeach pathname={pathname} beachDetails={beachDetails} />
        </div>

        <BeachBannerSection
          beachDetails={beachDetails}
          accommodationCount={beachDetails?.facilities?.accommodation_around?.length}
          activityCount={beachDetails?.activities?.sporting_activities?.length}
        />
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
      </>
    );
}


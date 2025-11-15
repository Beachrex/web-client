'use client';

import { useParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachPageView from '@/components/Beach/BeachPageView';
import BeachPromoBanner from '@/components/Beach/BeachPromoBanner';
import BreadCrumbsBeach from '@/components/Beach/BeachBanner/BreadCrumbsBeach';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';
import SimilarBeachesSection from '@/components/Beach/SimilarBeachesSection';
import GetYourGuideSection from '@/components/Beach/GetYourGuideSection';
import { useBeachDetails } from '@/hooks/useBeachDetails';

export default function BeachDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug as string;

  // Fetch beach details using the slug
  const { beachDetails, loading, error } = useBeachDetails(slug);

  if (!pathname) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading beach details...</p>
        </div>
      </div>
    );
  }

  if (error || !beachDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Beach not found</h1>
          <p className="text-gray-600">{error ?? 'Unable to load beach details'}</p>
        </div>
      </div>
    );
  }

  // Mock data for sections that don't have API data yet
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

      <BeachPromoBanner />
    </>
  );
}


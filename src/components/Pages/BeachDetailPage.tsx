'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';
import BeachPageView from '@/components/Beach/BeachPageView';
import GetYourGuideSection from '@/components/Beach/GetYourGuideSection';
import SimilarBeachesSection from '@/components/Beach/SimilarBeachesSection';
import DynamicTopBar from '@/components/DynamicTopBar';

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildBeachUrlFromNavigation } from '@/lib/utils/beach-urls';

interface BeachDetailPageProps {
  beachDetails: BeachDetailsSchema;
}

export default function BeachDetailPage({ beachDetails }: BeachDetailPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

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
      {/* Shared top bar: breadcrumbs + beach prev/next */}
      <DynamicTopBar
  pathname={pathname ?? ''}
  navigation={beachDetails.navigation}
  buildUrl={(item) =>
    buildBeachUrlFromNavigation(
      {
        slug: item.slug ?? undefined,
        location: item.location ?? undefined,
      },
      locale,
    )
  }
      />


      <BeachBannerSection
        beachDetails={beachDetails}
        accommodationCount={beachDetails?.facilities?.accommodation_around?.length}
        activityCount={beachDetails?.activities?.sporting_activities?.length}
      />

      <BeachPageView beachDetails={beachDetails} />

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
      <BeachDetailsSection beachDetails={beachDetails} />

      <SimilarBeachesSection
        properties={nearbyBeaches}
        selectedDistance={{ value: 1, label: '1 km' }}
        onDistanceChange={(v) => console.log('similar beaches distance', v)}
      />
    </>
  );
}

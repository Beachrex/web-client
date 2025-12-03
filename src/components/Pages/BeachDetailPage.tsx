'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';
import BeachPageView from '@/components/Beach/BeachPageView';
import GetYourGuideSection from '@/components/Beach/GetYourGuideSection';
import SimilarBeachesSection from '@/components/Beach/SimilarBeachesSection';
import DynamicTopBar from '@/components/DynamicTopBar';

import type { Property } from '@/components/PropertySection';
import { useBeachesRadius } from '@/hooks/useBeaches';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromNavigation } from '@/lib/utils/beach-urls';

interface BeachDetailPageProps {
  beachDetails: BeachDetailsSchema;
}

export default function BeachDetailPage({ beachDetails }: BeachDetailPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  // ------------------------------------
  // Extract correct fields from API
  // ------------------------------------
  const beachId = beachDetails.basic_info?.id ?? null;

  const latitude = Number(beachDetails.basic_info?.latitude);
  const longitude = Number(beachDetails.basic_info?.longitude);

  // Proper safety check → radius API enabled only when both coords exist & are valid numbers
  const canSearchRadius =
    beachId !== null &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  // ------------------------------------
  // Distance dropdown (default = 1 km)
  // ------------------------------------
  const [selectedDistance, setSelectedDistance] = useState({
    value: 10,
    label: '10 km',
  });

  // ------------------------------------
  // Fetch SIMILAR beaches based on radius
  // ------------------------------------
  const { beaches: radiusBeaches } = useBeachesRadius(
    {
      latitude,
      longitude,
      radius: selectedDistance.value,
      limit: 20,
    },
    canSearchRadius
  );

  // ------------------------------------
  // Transform similar beaches → Property[]
  // ------------------------------------
  const similarProperties: Property[] = useMemo(() => {
    if (!beachId) return [];

    return radiusBeaches
      .filter((b) => b.id !== beachId)
      .map((b) => {
        const image = buildCdnUrl(b.main_image, 'list');
        if (!image) return null;

        const item: Property = {
          id: String(b.id),
          image,
          title: b.name ?? 'Unknown beach',
          location: b.city_slug ?? '',
          price: 0,
          originalPrice: 0,
          rating: 0,
          reviews: 0,
          discount: '0',
          isFreeBreakfast: false,
          isFreeCancellation: false,
        };

        return item;
      })
      .filter((x): x is Property => x !== null);
  }, [radiusBeaches, beachId]);

  return (
    <>
      {/* TOP BAR */}
      <DynamicTopBar
        pathname={pathname ?? ''}
        navigation={beachDetails.navigation}
        buildUrl={(item) =>
          buildBeachUrlFromNavigation(
            {
              slug: item.slug ?? undefined,
              location: item.location ?? undefined,
            },
            locale
          )
        }
      />

      {/* HERO */}
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
        properties={similarProperties}
        selectedDistance={selectedDistance}
        onDistanceChange={(value) =>
          setSelectedDistance({
            value: Number(value),
            label: value + ' km',
          })
        }
      />
    </>
  );
}

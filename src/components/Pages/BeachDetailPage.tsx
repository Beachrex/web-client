'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';
import BeachFaqSection from '@/components/Beach/BeachFaqSection';
import BeachPageView from '@/components/Beach/BeachPageView';
import GetYourGuideSection from '@/components/Beach/GetYourGuideSection';
import SimilarBeachesSection from '@/components/Beach/SimilarBeachesSection';
import DynamicTopBar from '@/components/DynamicTopBar';
import type { Property } from '@/components/PropertySection';
import { useBeachesRadius } from '@/hooks/useBeaches';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildBeachUrlFromNavigation } from '@/lib/utils/beach-urls';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';
import { FEATURES } from '@/lib/constants/features';
import { reportBeachView } from '@/lib/utils/beach-views';
import { breadcrumbLabels } from '@/lib/utils/breadcrumb-labels';
import { readBeachFaq } from '@/lib/utils/beach-faq';

interface BeachDetailPageProps {
  beachDetails: BeachDetailsSchema;
}

/* -------------------------------------------------------------
   Build gallery (max 5 images)
   Same logic as Country, Region, Search pages
-------------------------------------------------------------- */


export default function BeachDetailPage({ beachDetails }: BeachDetailPageProps) {
  const pathname = usePathname();
  const locale = useLocale();

  // ------------------------------------
  // Extract correct fields from API
  // ------------------------------------
  const beachId = beachDetails.basic_info?.id ?? null;

  // The page HTML is cached (ISR); the visit is counted from the browser.
  useEffect(() => {
    if (beachId !== null) reportBeachView(beachId);
  }, [beachId]);

  const latitude = Number(beachDetails.basic_info?.latitude);
  const longitude = Number(beachDetails.basic_info?.longitude);

  const canSearchRadius =
    beachId !== null &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  // ------------------------------------
  // Distance dropdown (default = 10 km)
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
  // WITH galleryImages support
  // ------------------------------------
  const similarProperties: Property[] = useMemo(() => {
  if (!beachId) return [];

  return radiusBeaches
    .filter((b) => b.id !== beachId)
    .map((b) =>
      mapBeachToProperty(b, { locale })
    )
    .filter((p): p is Property => p !== null);
}, [radiusBeaches, beachId, locale]);


  return (
    <>
      {/* TOP BAR */}
      <DynamicTopBar
        pathname={pathname ?? ''}
        breadcrumbLabels={breadcrumbLabels(beachDetails.location, beachDetails.basic_info)}
        variant="beach"
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

      {/* Hidden for launch: fake accommodation cards ("569 accommodations") and an empty GetYourGuide shell */}
      {FEATURES.accommodation && (
        <AccommodationSection
          showDropdown
          selectedDistance={{ value: 1, label: '1 km' }}
        />
      )}
      {FEATURES.getYourGuide && <GetYourGuideSection />}
      <BeachDetailsSection beachDetails={beachDetails} />

      {/* TASK-007: FAQ (same items as the FAQPage JSON-LD of the page) */}
      <BeachFaqSection beachName={beachDetails.basic_info?.name ?? ''} items={readBeachFaq(beachDetails)} />

      {/* SIMILAR BEACHES WITH GALLERY */}
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

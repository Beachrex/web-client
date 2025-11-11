'use client';

import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachPageView from '@/components/Beach/BeachBanner/BeachPageView';
import BeachPromoBanner from '@/components/Beach/BeachBanner/BeachPromoBanner';
import BreadCrumbsBeach from '@/components/Beach/BeachBanner/BreadCrumbsBeach';
import { usePathname } from 'next/navigation';

export default function Page() {
  // get the current path, e.g. "/evropa/hrvaska/kvarner/otok-krk/malinska/plaza-haludovo"
  const pathname = usePathname();

  // until Next.js gives the pathname (on hydration), we can early return
  if (!pathname) return null;

  return (
    <>
      <div className="flex flex-col">
        {/* Only breadcrumbs for now */}
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

<BeachPromoBanner />

    </>
  );
}

'use client';
import { usePathname } from 'next/navigation';


import AccommodationSection from '@/components/AccommodationCard/AccommodationsSection';
import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
import BeachPageView from '@/components/Beach/BeachBanner/BeachPageView';
import BeachPromoBanner from '@/components/Beach/BeachBanner/BeachPromoBanner';
import BreadCrumbsBeach from '@/components/Beach/BeachBanner/BreadCrumbsBeach';
import BeachDetailsSection from '@/components/Beach/BeachDetails/beachDetailsSection';

export default function Page() {
  const pathname = usePathname();


  if (!pathname) return null;

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

<BeachDetailsSection />

      <BeachPromoBanner />

    </>
  );
}

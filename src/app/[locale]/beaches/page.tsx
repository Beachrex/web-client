'use client';

import BeachBannerSection from '@/components/Beach/BeachBanner/BeachBannerSection';
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
    </>
  );
}

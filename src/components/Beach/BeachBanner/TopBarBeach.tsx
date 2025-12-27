'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface TopBarBeach {
  /** Beach name to display (e.g. Plaža Haludovo) */
  beachName?: string;
  /** Total number of activities related to this beach */
  activityCount?: number;
  /** Total number of accommodations for this beach/area */
  accommodationCount?: number;
}

const TopBarBeach: React.FC<TopBarBeach> = ({
  beachName = '',
  activityCount = 0,
  accommodationCount = 0,
}) => {
  const t = useTranslations('TopBarBeach');

  return (
   <div className="flex h-[54px] items-center rounded-[12px]">
  <div className="flex h-full items-center gap-[8px] rounded-[12px] bg-[#0069AB] px-[10px] sm:gap-[12px] sm:px-[18px]">

    {/* Beach label */}
    <span
className="hidden md:flex items-center rounded-full bg-white/95 px-[12px] py-[2px]
                     font-figtree text-[16px] font-semibold leading-none text-[#0069AB]
                     shadow-sm"
    >
      {t('beachLabel')}
    </span>

    {/* Beach name */}
    <span className="hidden md:block font-figtree text-[26px] font-bold leading-none text-white tracking-tight">
      {beachName}
    </span>

    {/* Accommodations */}
    <div className="flex h-[36px] items-center gap-[6px] rounded-[8px] bg-white px-[8px] sm:px-[10px]">
      <Image
        src="/images/accommodation-black.png"
        alt={t('numAccommodationsLabel')}
        width={22}
        height={22}
        className="opacity-80"
      />
      <span className="hidden sm:block text-[13px] font-medium text-[#333]">
        {t('numAccommodationsLabel')}
      </span>
      <span className="text-[13px] font-bold text-[#0069AB]">
        {accommodationCount}
      </span>
    </div>

    {/* Activities */}
    <div className="flex h-[36px] items-center gap-[6px] rounded-[8px] bg-white px-[8px] sm:px-[10px]">
      <Image
        src="/images/banner/signpost.png"
        alt={t('numActivitiesLabel')}
        width={22}
        height={22}
        className="opacity-80"
      />
      <span className="hidden sm:block text-[13px] font-medium text-[#333]">
        {t('numActivitiesLabel')}
      </span>
      <span className="text-[13px] font-bold text-[#0069AB]">
        {activityCount}
      </span>
    </div>

  </div>
</div>

  );
};

export default TopBarBeach;

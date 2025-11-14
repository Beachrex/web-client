'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface TopBarBeach {
  /** Beach name to display (e.g. Plaža Haludovo) */
  beachName: string;
  /** Total number of activities related to this beach */
  activityCount?: number;
  /** Total number of accommodations for this beach/area */
  accommodationCount?: number;
}

const TopBarBeach: React.FC<TopBarBeach> = ({
  beachName,
  activityCount = 0,
  accommodationCount = 0,
}) => {
  const t = useTranslations('TopBarBeach');

  return (
    <div className="flex h-[54px] items-center rounded-[10px]">
      {/* Textual block */}
      <div className="flex h-full items-center gap-[6px] rounded-[10px] bg-[#0069AB] px-[8px] sm:gap-[10px] sm:px-[16px]">
        {/* Beach label (white pill) — hidden on mobile */}
        <span className="hidden items-center justify-center gap-[7px] rounded-full bg-white px-[10px] py-[3px] font-figtree text-[20px] font-bold leading-[100%] text-[#0069AB] md:flex">
          {t('beachLabel')}
        </span>

        {/* Beach name */}
        <span className="hidden font-figtree text-[30px] font-bold leading-[100%] text-white md:block">
          {beachName}
        </span>

        {/* Accommodations count */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:gap-[8px] sm:px-[10px]">
          <Image
            src="/images/accommodation-black.png"
            alt={t('numAccommodationsLabel')}
            width={26}
            height={26}
            className="h-[20px] w-[20px] sm:h-[26px] sm:w-[26px]"
          />
          <span className="hidden font-figtree text-[14px] font-medium text-[#222222] sm:block">
            {t('numAccommodationsLabel')}
          </span>
          <span className="font-figtree text-[12px] font-bold text-[#0069AB] sm:text-[14px]">
            {accommodationCount}
          </span>
        </div>

        {/* Activities count */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:gap-[8px] sm:px-[10px]">
          <Image
            src="/images/banner/signpost.png"
            alt={t('numActivitiesLabel')}
            width={26}
            height={26}
            className="h-[20px] w-[20px] sm:h-[26px] sm:w-[26px]"
          />
          <span className="hidden font-figtree text-[14px] font-medium text-[#222222] sm:block">
            {t('numActivitiesLabel')}
          </span>
          <span className="font-figtree text-[12px] font-bold text-[#0069AB] sm:text-[14px]">
            {activityCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBarBeach;

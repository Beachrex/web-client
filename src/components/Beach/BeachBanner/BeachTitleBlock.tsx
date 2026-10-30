'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { useBeachEmbedded } from '@/components/Beach/BeachEmbedContext';

interface BeachTitleBlockProps {
  title?: string; // e.g. "Plaža Haludovo"
}

const BeachTitleBlock: React.FC<BeachTitleBlockProps> = ({ title = '' }) => {
  const tCommon = useTranslations('Common'); // uses Common.beach
  // Beach map panel (≤ 720px): the phone sizes, not the window's lg sizes
  const embedded = useBeachEmbedded();

  return (
    <div className="relative select-none">
      {/* Large faded background label (e.g. "Plaža" / "Beach") */}
      <span
        aria-hidden
        className={[
          'block capitalize font-figtree font-bold leading-[100%] text-white opacity-30 pointer-events-none',
          embedded ? 'text-[72px] sm:text-[96px]' : 'text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px]',
        ].join(' ')}
      >
        {tCommon('beach')}
      </span>

      {/* Main title positioned above the background label */}
      <h1
        className={[
          'absolute bottom-0 font-figtree font-bold leading-[100%] text-white pointer-events-none',
          embedded
            ? 'left-[20px] text-[34px] sm:left-[28px] sm:text-[44px]'
            : 'left-[20px] sm:left-[40px] md:left-[60px] lg:left-[80px] text-[40px] sm:text-[60px] md:text-[80px] lg:text-[100px]',
        ].join(' ')}
      >
        {title}
      </h1>
    </div>
  );
};

export default BeachTitleBlock;

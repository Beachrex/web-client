'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

interface BeachTitleBlockProps {
  title: string; // e.g. "Plaža Haludovo"
}

const BeachTitleBlock: React.FC<BeachTitleBlockProps> = ({ title }) => {
  const tCommon = useTranslations('Common'); // uses Common.beach

  return (
    <div className="relative select-none pointer-events-none">
      {/* Large faded background label (e.g. "Plaža" / "Beach") */}
      <span
        aria-hidden
        className="
          block font-figtree font-bold leading-[100%] text-white opacity-30
          text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px]
        "
      >
        {tCommon('beach')}
      </span>

      {/* Main title positioned above the background label */}
      <span
        className="
          absolute bottom-0 left-[20px] sm:left-[40px] md:left-[60px] lg:left-[80px]
          font-figtree font-bold leading-[100%] text-white
          text-[40px] sm:text-[60px] md:text-[80px] lg:text-[100px]
        "
      >
        {title}
      </span>
    </div>
  );
};

export default BeachTitleBlock;

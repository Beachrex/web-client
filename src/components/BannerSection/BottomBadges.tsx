'use client';
import Image from 'next/image';
import React from 'react';

interface Badge {
  label: string;
  icon: string;
}

interface BottomBadgesProps {
  badges: Badge[];
}

/**
 * BadgeItem component — displays individual badge with icon and label
 */
const BadgeItem: React.FC<Badge> = ({ label, icon }) => (
  <div className="flex h-8 w-full min-w-0 items-center justify-self-start whitespace-nowrap rounded-full bg-[#5E1CA5] px-3 font-figtree text-[0.9rem] font-bold leading-none text-white sm:h-9 sm:px-4 sm:text-[1rem] lg:w-auto">
    <Image
      src={icon}
      alt={label}
      width={20}
      height={20}
      className="mr-2 h-[1.1em] w-[1.1em] flex-none object-contain"
    />
    <span className="truncate">{label}</span>
  </div>
);

/**
 * BottomBadges component — responsive grid of up to 12 badges.
 * - Below lg: 3 columns × 2 rows (6 visible badges)
 * - From lg up: show all badges with existing dense layout
 */
const BottomBadges: React.FC<BottomBadgesProps> = ({ badges }) => {
  return (
    <div className="w-full overflow-hidden">
      <div className="/* 3 columns on small screens */ /* stretch badges to fill each cell */ /* from lg up: use original responsive */ /* hide items 7+ below lg, re-show from lg up */ grid w-full grid-cols-3 justify-items-stretch gap-x-2 gap-y-2 lg:w-fit lg:grid-cols-[repeat(2,max-content)] lg:grid-rows-[repeat(6,auto)] lg:justify-items-start xl:grid-cols-[repeat(3,max-content)] xl:grid-rows-[repeat(4,auto)] 2xl:grid-cols-[repeat(6,max-content)] 2xl:grid-rows-[repeat(2,auto)] [&>*:nth-child(n+7)]:hidden lg:[&>*:nth-child(n+7)]:flex">
        {badges.slice(0, 12).map((b, i) => (
          <BadgeItem key={`${b.label}-${i}`} {...b} />
        ))}
      </div>
    </div>
  );
};

export default BottomBadges;

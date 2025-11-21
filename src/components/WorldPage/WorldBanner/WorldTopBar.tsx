'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface WorldTopBarProps {
  totalCountriesWithBeaches?: number;
  totalBeaches?: number;
  totalOpenPools?: number;
  totalIndoorPools?: number;
  totalIslandsWithBeaches?: number;
  totalRiverBeaches?: number;
  totalLakeBeaches?: number;
}

interface StatBadgeProps {
  label: string;
  value?: number;
  // Optional icon so you can switch later (or remove completely)
  iconSrc?: string;
}

/**
 * Formats large numbers with thousand separators.
 */
const formatNumber = (value?: number) => {
  if (value == null) return '–';
  try {
    return value.toLocaleString();
  } catch {
    return String(value);
  }
};

const StatBadge: React.FC<StatBadgeProps> = ({ label, value, iconSrc }) => {
  const displayValue = formatNumber(value);

  const numberTextClasses =
    'font-figtree text-[12px] sm:text-[14px] font-bold text-[#1A3C68]';

  return (
    <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white/95 px-[6px] sm:gap-[8px] sm:px-[10px]">
      {iconSrc && (
        <Image
          src={iconSrc}
          alt={label}
          width={26}
          height={26}
          className="h-[20px] w-[20px] sm:h-[26px] sm:w-[26px]"
        />
      )}

      <span className="hidden font-figtree text-[13px] font-medium text-[#222222] sm:block">
        {label}
      </span>

      <span className={numberTextClasses}>{displayValue}</span>
    </div>
  );
};

const WorldTopBar: React.FC<WorldTopBarProps> = ({
  totalCountriesWithBeaches,
  totalBeaches,
  totalOpenPools,
  totalIndoorPools,
  totalIslandsWithBeaches,
  totalRiverBeaches,
  totalLakeBeaches,
}) => {
  const t = useTranslations('WorldTopBar');

  // For now we use the same beach icon everywhere; replace per badge later if needed
  const defaultIcon = '/images/beach-black.png';

  return (
    <div className="flex h-[54px] items-center gap-[6px] overflow-x-auto rounded-[10px] px-[8px] py-[6px] backdrop-blur-sm sm:gap-[10px] sm:px-[12px] lg:px-[16px] scrollbar-hide">

      {/* statistic badges */}
      <div className="flex flex-nowrap items-center gap-[6px] sm:gap-[8px]">
        <StatBadge
          label={t('countriesWithBeachesLabel')}
          value={totalCountriesWithBeaches}
          iconSrc={defaultIcon}
        />
        <StatBadge
          label={t('totalBeachesLabel')}
          value={totalBeaches}
          iconSrc={defaultIcon}
        />
        <StatBadge
          label={t('openPoolsLabel')}
          value={totalOpenPools}
          iconSrc={defaultIcon}
        />
        <StatBadge
          label={t('indoorPoolsLabel')}
          value={totalIndoorPools}
          iconSrc={defaultIcon}
        />
        <StatBadge
          label={t('islandsWithBeachesLabel')}
          value={totalIslandsWithBeaches}
          iconSrc={defaultIcon}
        />
        <StatBadge
          label={t('riverBeachesLabel')}
          value={totalRiverBeaches}
          iconSrc={defaultIcon}
        />
        <StatBadge
          label={t('lakeBeachesLabel')}
          value={totalLakeBeaches}
          iconSrc={defaultIcon}
        />
      </div>
    </div>
  );
};

export default WorldTopBar;

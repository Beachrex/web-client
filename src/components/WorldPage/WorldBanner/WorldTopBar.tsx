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
  iconSrc?: string;
}

const formatNumber = (value?: number) => {
  if (value == null) return '–';
  try {
    return value.toLocaleString();
  } catch {
    return String(value);
  }
};

const StatBadge: React.FC<StatBadgeProps> = ({ label, value, iconSrc }) => {
  // Stats without data (e.g. lake/river/pool counts until that data exists) are hidden, not shown as 0 or "–".
  if (value == null || value <= 0) return null;
  const displayValue = formatNumber(value);

  return (
    <div
      className="
        inline-flex items-center gap-2 rounded-md
        bg-white/90 px-3 py-1.5
        shadow-[0_6px_16px_rgba(0,0,0,0.12)]
        border border-white/60
        backdrop-blur-md
      "
    >
      {iconSrc && (
        <div
          className="
            flex items-center justify-center rounded-full
            bg-[#16BFD6]/10 p-1
          "
        >
          <Image
            src={iconSrc}
            alt={label}
            width={25}
            height={25}
            className="opacity-80"
          />
        </div>
      )}

      <div className="flex flex-col leading-tight">
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.06em] text-[#3A3A3A] sm:block">
          {label}
        </span>
        <span className="text-[12px] sm:text-[14px] font-semibold text-[#006b6b]">
          {displayValue}
        </span>
      </div>
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
  const defaultIcon = '/images/beach-black.png';

  return (

      <div
        className="
          mt-2 flex items-center gap-3 overflow-x-auto scrollbar-hide
          rounded-[10px]
          bg-gradient-to-r from-[#0FBAD6] via-[#16C9D4] to-[#0B99C2]
          px-3 py-3 sm:px-4 sm:py-4
          shadow-[0_10px_30px_rgba(0,0,0,0.15)]
        "
      >
        {/* Stat badges */}
        <div className="flex flex-nowrap items-center gap-2.5 sm:gap-3.5">
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

'use client';
import type { Continent } from '@/lib/api-client/types.gen';
import { continentCodeToKey } from '@/lib/constants/mappings';
import { getContinentIcon } from '@/lib/utils/icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface TopBarProps {
  continent?: Continent;
  accommodationCount?: number;
  /** Used for region name or custom title (e.g. "Kvarner") */
  title?: string;
  /** Controls layout & colors */
  variant?: 'continent' | 'region';
  /** Explicit beach count (for regions); falls back to continent.beaches_count */
  beachCount?: number;
}

const TopBar: React.FC<TopBarProps> = ({
  continent,
  accommodationCount = 0,
  title,
  variant = 'continent',
  beachCount,
}) => {
  const t = useTranslations('TopBar');
  const tContinent = useTranslations('Continents');

  const isRegion = variant === 'region';

  // Continent-related data (only relevant for continent variant)
  const continentKey = continent?.code
    ? (continentCodeToKey[continent.code] ?? 'europe')
    : 'europe';
  const continentIcon = continent
    ? getContinentIcon(continentKey)
    : '/images/continents/evropa.png';
  const continentName = continent
    ? (continent.name ?? tContinent('europe'))
    : tContinent('europe');

  const displayTitle = isRegion ? (title ?? '') : continentName;
  const displayBeachCount =
    typeof beachCount === 'number'
      ? beachCount
      : (continent?.beaches_count ?? 0);

  const barBgClass = isRegion ? 'bg-[#FF2877]' : 'bg-[#5E1CA5]';
  const pillTextColorClass = isRegion ? 'text-[#FF2877]' : 'text-[#5E1CA5]';
  const numberTextColorClass = isRegion ? 'text-[#FF2877]' : 'text-[#5E1CA5]';
  const barRadiusClass = isRegion ? 'rounded-[10px]' : 'rounded-r-[10px]';
  const filterIcon =
    variant === 'region'
      ? '/images/common/pink-filter.svg'
      : '/images/common/purple-filter.svg';

  return (
    <div className="flex h-[54px] items-center rounded-[10px]">
     <div
  className={`
    flex h-full items-center
    gap-[6px] px-[8px]
    sm:gap-[10px] sm:px-[16px]
    ${barBgClass} ${barRadiusClass}
  `}
     >

        {/* Label pill (Continent / Region) - Hidden on mobile */}
       <span
  className={`
    hidden md:flex items-center justify-center 
    gap-[7px] rounded-full bg-white 
    px-[10px] py-[3px] 
    font-figtree text-[20px] font-bold leading-[100%]
    ${pillTextColorClass}
  `}
       >

          {isRegion ? t('regionLabel') : t('continentLabel')}
        </span>

        {/* Continent icon – only for continent variant */}
        {!isRegion && (
          <div className="flex h-full w-[54px] items-center justify-center overflow-hidden rounded-l-[10px] bg-[#5E1CA5]">
            <Image
              src={continentIcon}
              alt={continentName}
              width={35}
              height={35}
              className="object-contain"
            />
          </div>
        )}

        {/* Title: continent name or region name */}
        <span className="hidden font-figtree text-[30px] font-bold leading-[100%] text-white md:block">
          {displayTitle}
        </span>

        {/* Number of beaches */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:gap-[8px] sm:px-[10px]">
          <Image
            src="/images/beach-black.png"
            alt={t('numBeachesLabel')}
            width={26}
            height={26}
            className="h-[20px] w-[20px] sm:h-[26px] sm:w-[26px]"
          />
          <span className="hidden font-figtree text-[14px] font-medium text-[#222222] sm:block">
            {t('numBeachesLabel')}
          </span>
          <span
            className={`font-figtree text-[12px] font-bold sm:text-[14px] ${numberTextColorClass}`}
          >
            {displayBeachCount}
          </span>
        </div>

        {/* Number of accommodations */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:gap-[8px] sm:px-[10px]">
          <img
            src="/images/common/accommodation-black.svg"
            alt={t('numAccommodationsLabel')}
            width={26}
            height={26}
            className="h-[20px] w-[20px] sm:h-[26px] sm:w-[26px]"
          />
          <span className="hidden font-figtree text-[14px] font-medium text-[#222222] sm:block">
            {t('numAccommodationsLabel')}
          </span>
          <span
            className={`font-figtree text-[12px] font-bold sm:text-[14px] ${numberTextColorClass}`}
          >
            {accommodationCount}
          </span>
        </div>

        {/* Filter button */}
        <button
          type="button"
          className="flex h-[41px] w-[35px] items-center justify-center rounded-[6px] bg-white sm:w-[41px]"
        >
          <Image
            src={filterIcon}
            alt="filter"
            width={20}
            height={20}
            className="h-[20px] w-[20px]"
          />
        </button>
      </div>
    </div>
  );
};

export default TopBar;

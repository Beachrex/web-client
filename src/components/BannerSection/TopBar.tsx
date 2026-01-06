'use client';

import type { Continent, Country } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { getContinentIcon } from '@/lib/utils/icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import {
  type PageVariant,
  VARIANT_BG_CLASS,
  VARIANT_PILL_LABEL_KEY,
  VARIANT_TEXT_CLASS,
} from '../ui/pageVariants';

type CountryWithFlag = Country & { flag_icon?: string | null };

interface TopBarProps {
  continent?: Continent;
  country?: CountryWithFlag;
  accommodationCount?: number;
  activityCount?: number;
  regionPillLabel?: string | null;
  islandPillLabel?: string | null;
  cityPillLabel?: string | null;
  title?: string;
  variant?: PageVariant;
  beachCount?: number;
  showLocationPills?: boolean;
  showFilter?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  continent,
  country,
  accommodationCount = 0,
  activityCount = 0,
  regionPillLabel = null,
  islandPillLabel = null,
  cityPillLabel = null,
  title,
  variant = 'continent',
  beachCount,
  showLocationPills,
  showFilter,
}) => {
  const t = useTranslations('TopBar');
  const tContinent = useTranslations('Continents');
  const tCommon = useTranslations('Common');
  /* ------------------------------------------------
   * VARIANT LOGIC
   * ------------------------------------------------ */
  const isBeach = variant === 'beach';

  const showLocationPillsResolved =
    showLocationPills ?? !isBeach;

  const showFilterResolved =
    showFilter ?? !isBeach;

  /* ------------------------------------------------
   * EFFECTIVE CONTINENT
   * ------------------------------------------------ */
  const effectiveContinentCode =
    continent?.code ?? country?.continent_code;

  const continentName = effectiveContinentCode
    ? tContinent(effectiveContinentCode)
    : '';

  /* ------------------------------------------------
   * COUNTRY FLAG
   * ------------------------------------------------ */
  let countryIcon: string | null = null;
  if (country?.code) {
    countryIcon = buildCdnUrl(
      `img/flag/${country.code.toLowerCase()}.svg`,
      'icon',
    );
  }

  /* ------------------------------------------------
   * TITLE
   * ------------------------------------------------ */
  const displayTitle =
    variant === 'continent'
      ? continent?.name ?? continentName
      : title ?? country?.name ?? '';

  const displayBeachCount =
    typeof beachCount === 'number'
      ? beachCount
      : continent?.beaches_count ?? 0;

  /* ------------------------------------------------
   * COLORS
   * ------------------------------------------------ */
  const barBgClass = VARIANT_BG_CLASS[variant];
  const accentTextClass = VARIANT_TEXT_CLASS[variant];
  const pillLabelKey = VARIANT_PILL_LABEL_KEY[variant];

  const barRadiusClass =
    variant === 'continent'
      ? 'rounded-r-[10px]'
      : 'rounded-[10px]';

  /* ------------------------------------------------
   * FILTER ICON
   * ------------------------------------------------ */
  let filterIcon = '/images/common/purple-filter.svg';
  if (variant === 'region') filterIcon = '/images/common/pink-filter.svg';
  if (variant === 'island') filterIcon = '/images/common/yellow-filter.svg';
  if (variant === 'city') filterIcon = '/images/common/orange-filter.svg';
  if (variant === 'country') filterIcon = '/images/common/red-filter.svg';

  /* ------------------------------------------------
   * CLASSES
   * ------------------------------------------------ */
  const containerClasses = [
    'flex h-full items-center',
    'gap-[6px] px-[8px]',
    'sm:gap-[10px] sm:px-[16px]',
    barBgClass,
    barRadiusClass,
    '-ml-[7px]',
  ].join(' ');

  const pillClasses = [
    'hidden md:flex items-center justify-center',
    'gap-[7px] rounded-full bg-white',
    'px-[10px] py-[3px]',
    'font-figtree text-[20px] font-bold leading-[100%]',
    accentTextClass,
  ].join(' ');

  const numberTextClasses = [
    'font-figtree text-[12px] sm:text-[14px] font-bold',
    accentTextClass,
  ].join(' ');

  /* ------------------------------------------------
   * RENDER
   * ------------------------------------------------ */
  return (
    <div className="flex h-[54px] items-center">

      {/* LOCATION PILLS (hidden on beach) */}
      {showLocationPillsResolved && (
        <div className="hidden lg:flex h-full items-center">

          {effectiveContinentCode && (
            <div className="flex h-full w-[54px] items-center justify-center rounded-l-[10px] bg-[#5E1CA5]">
              <Image
                src={getContinentIcon(effectiveContinentCode)}
                alt={continentName}
                width={35}
                height={35}
                className="object-contain"
              />
            </div>
          )}

          {(variant === 'region' ||
            variant === 'island' ||
            variant === 'city' ||
            variant === 'beach') &&
            countryIcon && (
              <div className="flex h-full w-[54px] items-center justify-center bg-[#DD0000] -ml-[7px] rounded-l-[10px]">
                <Image
                  src={countryIcon}
                  alt={country?.name ?? ''}
                  width={28}
                  height={26}
                  className="object-contain"
                />
              </div>
            )}

          {regionPillLabel &&
            (variant === 'island' || variant === 'city' || variant === 'beach') && (
              <div className="flex h-full w-[54px] items-center justify-center bg-[#FF2877] -ml-[7px] rounded-l-[10px]">
                <span className="font-figtree text-[14px] font-bold text-white">
                  {regionPillLabel}
                </span>
              </div>
            )}

          {(variant === 'city' || variant === 'beach') && islandPillLabel && (
            <div className="flex h-full w-[54px] items-center justify-center bg-[#FFC422] -ml-[7px] rounded-l-[10px]">
              <span className="font-figtree text-[14px] font-bold text-white">
                {islandPillLabel}
              </span>
            </div>
          )}

          {variant === 'beach' && cityPillLabel && (
            <div className="flex h-full w-[54px] items-center justify-center bg-[#FF8000] -ml-[7px] rounded-l-[10px]">
              <span className="font-figtree text-[14px] font-bold text-white">
                {cityPillLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {/* MAIN BAR */}
      <div className={containerClasses}>

        <span className={pillClasses}>
          {t(pillLabelKey)}
        </span>

       <span
  className="
    hidden md:block
    max-w-[220px] lg:max-w-[320px] xl:max-w-none
    overflow-hidden whitespace-nowrap
    font-figtree text-[30px] font-bold leading-[100%] text-white
  "
       >
  {displayTitle}
</span>


        {/* COUNTERS */}
      {isBeach ? (
  <>
    {/* ACCOMMODATIONS */}
    <div className="flex h-[41px] items-center gap-[6px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
      <Image
        src="/images/common/accommodation-black.svg"
        alt=""
        width={26}
        height={26}
      />

      <span
        className="
          hidden 2xl:block
          font-figtree text-[14px] font-medium
          leading-[100%] text-[#222222]
        "
      >
        {tCommon('numAccommodations')}
      </span>

      <span className={numberTextClasses}>
        {accommodationCount}
      </span>
    </div>

    {/* ACTIVITIES */}
    <div className="flex h-[41px] items-center gap-[6px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
      <Image
        src="/images/banner/signpost.svg"
        alt=""
        width={26}
        height={26}
      />

      <span
        className="
          hidden 2xl:block
          font-figtree text-[14px] font-medium
          leading-[100%] text-[#222222]
        "
      >
        {tCommon('activities')}
      </span>

      <span className={numberTextClasses}>
        {activityCount}
      </span>
    </div>
  </>
) : (

          <>
            {/* BEACH COUNT */}
<div className="flex h-[41px] items-center gap-[6px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
  <Image
    src="/images/beach-black.png"
    alt=""
    width={26}
    height={26}
  />

 <span
  className="
    hidden md:block
    font-figtree text-[14px] font-medium
    leading-[100%] text-[#222222]
  "
 >
  {tCommon('numBeaches')}
</span>

  <span className={numberTextClasses}>
    {displayBeachCount}
  </span>
</div>

{/* ACCOMMODATIONS COUNT */}
<div className="flex h-[41px] items-center gap-[6px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
  <Image
    src="/images/common/accommodation-black.svg"
    alt=""
    width={26}
    height={26}
  />

  <span
  className="
    hidden md:block
    font-figtree text-[14px] font-medium
    leading-[100%] text-[#222222]
  "
  >
  {tCommon('numAccommodations')}
</span>


  <span className={numberTextClasses}>
    {accommodationCount}
  </span>
</div>

          </>
        )}

        {/* FILTER */}
        {showFilterResolved && (
          <button className="flex h-[41px] w-[35px] items-center justify-center rounded-[6px] bg-white sm:w-[41px]">
            <Image
src={filterIcon} alt="filter" width={20}
height={20} />
          </button>
        )}

      </div>
    </div>
  );
};

export default TopBar;

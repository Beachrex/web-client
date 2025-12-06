'use client';

import type { Continent, Country } from '@/lib/api-client/types.gen';
import { continentCodeToKey } from '@/lib/constants/mappings';
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
  title?: string;
  variant?: PageVariant;
  beachCount?: number;
}

const TopBar: React.FC<TopBarProps> = ({
  continent,
  country,
  accommodationCount = 0,
  title,
  variant = 'continent',
  beachCount,
}) => {
  const t = useTranslations('TopBar');
  const tContinent = useTranslations('Continents');

  // ------------------------------------------------
  // EFFECTIVE CONTINENT CODE (works for ALL pages)
  // ------------------------------------------------
  const effectiveContinentCode =
    continent?.code ??
    (country?.code ? continentCodeToKey[country.code] : null) ??
    'europe';

  const continentIcon = getContinentIcon(effectiveContinentCode);
  const continentName = tContinent(effectiveContinentCode);

  // ------------------------------------------------
  // COUNTRY FLAG (CDN)
  // ------------------------------------------------
  let countryIcon: string | null = null;
  if (country?.code) {
    countryIcon = buildCdnUrl(`img/flag/${country.code.toLowerCase()}.svg`, 'icon');
  }

  // ------------------------------------------------
  // TITLE
  // ------------------------------------------------
const displayTitle =
  variant === 'continent'
    ? continent?.name ?? continentName
    : title ?? country?.name ?? '';


  const displayBeachCount =
    typeof beachCount === 'number'
      ? beachCount
      : continent?.beaches_count ?? 0;

  // ------------------------------------------------
  // COLORS
  // ------------------------------------------------
  const barBgClass = VARIANT_BG_CLASS[variant];
  const accentTextClass = VARIANT_TEXT_CLASS[variant];
  const pillLabelKey = VARIANT_PILL_LABEL_KEY[variant];

  const barRadiusClass =
    variant === 'continent' ? 'rounded-r-[10px]' : 'rounded-[10px]';

  // ------------------------------------------------
  // FILTER ICON
  // ------------------------------------------------
  let filterIcon = '/images/common/purple-filter.svg';
  if (variant === 'region') filterIcon = '/images/common/pink-filter.svg';
  if (variant === 'island') filterIcon = '/images/common/yellow-filter.svg';
  if (variant === 'city') filterIcon = '/images/common/orange-filter.svg';
  if (variant === 'country') filterIcon = '/images/common/red-filter.svg';

  // ------------------------------------------------
  // MAIN TOPBAR WRAPPER
  // ------------------------------------------------
  const containerClasses = [
    'flex h-full items-center',
    'gap-[6px] px-[8px]',
    'sm:gap-[10px] sm:px-[16px]',
    barBgClass,
    barRadiusClass,
    '-ml-[7px]', // overlap visual effect
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

  return (
    <div className="flex h-[54px] items-center">

      {/*  CONTINENT PILL — for country, region, island, city */}
      {(['country', 'region', 'island', 'city'].includes(variant)) && (
        <div className="flex h-full w-[54px] items-center justify-center rounded-l-[10px] bg-[#5E1CA5]">
          <Image
            src={continentIcon}
            alt={continentName}
            width={35}
            height={35}
            className="object-contain"
          />
        </div>
      )}

      {/*  COUNTRY FLAG PILL — for region, island, city */}
      {(variant === 'region' || variant === 'island' || variant === 'city') &&
        countryIcon && (
          <div className="flex h-full w-[54px] items-center justify-center bg-[#DD0000] -ml-[7px] rounded-l-[10px]">
            <Image
              src={countryIcon}
              alt={country?.name ?? 'country icon'}
              width={28}
              height={26}
              className="object-contain"
            />
          </div>
        )}

      {/*  MAIN TOPBAR */}
      <div className={containerClasses}>

        {/* White label pill */}
        <span className={pillClasses}>{t(pillLabelKey)}</span>

        {/* Country flag ONLY for country topbar */}
        {variant === 'country' && countryIcon && (
          <div className="flex items-center justify-center overflow-hidden rounded-[5px]">
            <Image
              src={countryIcon}
              alt={displayTitle}
              width={32}
              height={30}
              className="object-contain"
            />
          </div>
        )}

        {/* Title */}
        <span className="hidden font-figtree text-[30px] font-bold leading-[100%] text-white md:block">
          {displayTitle}
        </span>

        {/* Beaches count */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
          <Image
src="/images/beach-black.png" alt="" width={26}
height={26}
          />
          <span className="hidden sm:block font-figtree text-[14px] font-medium text-[#222]">
            {t('numBeachesLabel')}
          </span>
          <span className={numberTextClasses}>{displayBeachCount}</span>
        </div>

        {/* Accommodation count */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
          <Image
src="/images/common/accommodation-black.svg" alt="" width={26}
height={26}
          />
          <span className="hidden sm:block font-figtree text-[14px] font-medium text-[#222]">
            {t('numAccommodationsLabel')}
          </span>
          <span className={numberTextClasses}>{accommodationCount}</span>
        </div>

        {/* Filter button */}
        <button className="flex h-[41px] w-[35px] items-center justify-center rounded-[6px] bg-white sm:w-[41px]">
          <Image
src={filterIcon} alt="filter" width={20}
height={20}
          />
        </button>

      </div>
    </div>
  );
};

export default TopBar;

'use client';

import type { Continent, Country } from '@/lib/api-client/types.gen';
import { continentCodeToKey } from '@/lib/constants/mappings';
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

// Local extension so we can safely use country.flag_icon later
type CountryWithFlag = Country & {
  flag_icon?: string | null;
};

interface TopBarProps {
  continent?: Continent;
  country?: CountryWithFlag;
  accommodationCount?: number;
  /** Used for region/island/city/country title (e.g. "Kvarner", "Krk") */
  title?: string;
  /** Controls visual style: continent | region | island | city | country */
  variant?: PageVariant;
  /** Explicit beach count for non-continent variants */
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

  const isContinent = variant === 'continent';

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

  // Country flag icon (only relevant for country variant)
  const countryIcon =
    variant === 'country'
      ? (country?.flag_icon ?? '/images/common/croatia-icon.png')
      : null;

  // For continent we show continent name, for others we expect title or fall back to country name
  const displayTitle = isContinent
    ? continentName
    : (title ?? country?.name ?? '');

  const displayBeachCount =
    typeof beachCount === 'number'
      ? beachCount
      : (continent?.beaches_count ?? 0);

  const barBgClass = VARIANT_BG_CLASS[variant];
  const accentTextClass = VARIANT_TEXT_CLASS[variant];
  const pillLabelKey = VARIANT_PILL_LABEL_KEY[variant];
  const barRadiusClass = isContinent ? 'rounded-r-[10px]' : 'rounded-[10px]';

  // Filter icon per variant
  let filterIcon = '/images/common/purple-filter.svg';
  if (variant === 'region') {
    filterIcon = '/images/common/pink-filter.svg';
  } else if (variant === 'island') {
    filterIcon = '/images/common/yellow-filter.svg';
  } else if (variant === 'city') {
    filterIcon = '/images/common/orange-filter.svg';
  } else if (variant === 'country') {
    filterIcon = '/images/common/red-filter.svg';
  }

  const containerClasses = [
    'flex h-full items-center',
    'gap-[6px] px-[8px]',
    'sm:gap-[10px] sm:px-[16px]',
    barBgClass,
    barRadiusClass,
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
    <div className="flex h-[54px] items-center rounded-[10px]">
      <div className={containerClasses}>
        {/* Label pill (Continent / Region / Island / City / Country) */}
        <span className={pillClasses}>{t(pillLabelKey)}</span>

        {/* Country icon – only for country variant (between pill and title) */}
        {variant === 'country' && countryIcon && (
          <div className="flex items-center justify-center overflow-hidden">
            <Image
              src={countryIcon}
              alt={displayTitle || 'country flag'}
              width={32}
              height={55}
              className="object-contain"
            />
          </div>
        )}

        {/* Continent icon – only for continent variant */}
        {isContinent && (
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

        {/* Title: continent name or custom title */}
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
          <span className={numberTextClasses}>{displayBeachCount}</span>
        </div>

        {/* Number of accommodations */}
        <div className="flex h-[41px] items-center gap-[4px] rounded-[6px] bg-white px-[6px] sm:gap-[8px] sm:px-[10px]">
          <Image
            src="/images/common/accommodation-black.svg"
            alt={t('numAccommodationsLabel')}
            width={26}
            height={26}
            className="h-[20px] w-[20px] sm:h-[26px] sm:w-[26px]"
          />
          <span className="hidden font-figtree text-[14px] font-medium text-[#222222] sm:block">
            {t('numAccommodationsLabel')}
          </span>
          <span className={numberTextClasses}>{accommodationCount}</span>
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

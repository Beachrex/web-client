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
import { FEATURES } from '@/lib/constants/features';
import type { LocationPillUrls } from '@/lib/utils/beach-urls';
import LocationPill from './LocationPill';

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
  /** TopBar key that replaces the variant's pill label (beach pages: lake/river/pool wording). */
  pillLabelKey?: string;
  /** Pages of the places in the pills; a pill with a link opens on hover/focus and navigates on click. */
  pillLinks?: Partial<LocationPillUrls>;
  /** Full names for the region/island/city pills (their collapsed labels are shortened). */
  pillNames?: { region?: string | null; island?: string | null; city?: string | null };
  /**
   * Published beaches per pill level, shown in the open tab. A level without a number gets no count box
   * (listing pages do not have their parents' counts; never show a wrong number).
   */
  pillCounts?: Partial<Record<PillLevel, number | null>>;
}

type PillLevel = 'continent' | 'country' | 'region' | 'island' | 'city';

const PILL_BG: Record<PillLevel, string> = {
  continent: VARIANT_BG_CLASS.continent,
  country: VARIANT_BG_CLASS.country,
  region: VARIANT_BG_CLASS.region,
  island: VARIANT_BG_CLASS.island,
  city: VARIANT_BG_CLASS.city,
};

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
  pillLabelKey: pillLabelKeyOverride,
  pillLinks,
  pillNames,
  pillCounts,
}) => {
  const t = useTranslations('TopBar');
  const tContinent = useTranslations('Continents');
  const tCommon = useTranslations('Common');
  const tFilters = useTranslations('Filters');

  /** Colours, level word and count of one pill's open tab: the same pieces as that place's own main bar. */
  const pillTab = (level: PillLevel) => ({
    colorClass: PILL_BG[level],
    accentTextClass: VARIANT_TEXT_CLASS[level],
    levelLabel: t(VARIANT_PILL_LABEL_KEY[level]),
    beachCount: pillCounts?.[level],
    beachCountLabel: tCommon('numBeaches').trim(),
  });
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
  const pillLabelKey = pillLabelKeyOverride ?? VARIANT_PILL_LABEL_KEY[variant];

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
            <LocationPill
              first
              name={continentName}
              // On the continent's own page this pill is the page itself: no link, no tab (owner, 2026-10-29).
              href={variant === 'continent' ? null : pillLinks?.continent}
              {...pillTab('continent')}
            >
              <Image
                src={getContinentIcon(effectiveContinentCode)}
                alt={variant !== 'continent' && pillLinks?.continent ? '' : continentName}
                width={35}
                height={35}
                className="object-contain"
              />
            </LocationPill>
          )}

          {(variant === 'region' ||
            variant === 'island' ||
            variant === 'city' ||
            variant === 'beach') &&
            countryIcon && (
              <LocationPill
                name={country?.name ?? ''}
                href={pillLinks?.country}
                {...pillTab('country')}
              >
                <Image
                  src={countryIcon}
                  alt={pillLinks?.country ? '' : country?.name ?? ''}
                  width={28}
                  height={26}
                  className="object-contain"
                />
              </LocationPill>
            )}

          {regionPillLabel &&
            (variant === 'island' || variant === 'city' || variant === 'beach') && (
              <LocationPill
                name={pillNames?.region ?? regionPillLabel}
                href={pillLinks?.region}
                {...pillTab('region')}
              >
                {regionPillLabel}
              </LocationPill>
            )}

          {(variant === 'city' || variant === 'beach') && islandPillLabel && (
            <LocationPill
              name={pillNames?.island ?? islandPillLabel}
              href={pillLinks?.island}
              {...pillTab('island')}
            >
              {islandPillLabel}
            </LocationPill>
          )}

          {variant === 'beach' && cityPillLabel && (
            <LocationPill
              name={pillNames?.city ?? cityPillLabel}
              href={pillLinks?.city}
              {...pillTab('city')}
            >
              {cityPillLabel}
            </LocationPill>
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
    {/* ACCOMMODATIONS (hidden for launch) */}
    {FEATURES.accommodation && (
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
    )}

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

{/* ACCOMMODATIONS COUNT (hidden for launch) */}
{FEATURES.accommodation && (
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
  )}

          </>
        )}

        {/* FILTER */}
        {showFilterResolved && (
          <button
            type="button"
            onClick={() => {
              const filtersSection = document.getElementById('filters-section');
              if (filtersSection) {
                filtersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Open filter sidebar after scroll
                setTimeout(() => {
                  window.dispatchEvent(new Event('openFilterSidebar'));
                }, 500);
              }
            }}
            className="flex h-[41px] w-[35px] items-center justify-center rounded-[6px] bg-white sm:w-[41px]"
          >
            <Image
src={filterIcon} alt={tFilters('filterButton')} width={20}
height={20} />
          </button>
        )}

      </div>
    </div>
  );
};

export default TopBar;

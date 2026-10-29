'use client';

import type { Continent, Country } from '@/lib/api-client/types.gen';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { buildBeachMapUrl, type LocationPillUrls } from '@/lib/utils/beach-urls';

import BottomBadges from './BottomBadges';
import InfoCardsSection from './InfoCardsSection';
import TopBar from './TopBar';
import WeatherWidget from './WeatherWidget';

import type { PageVariant } from '../ui/pageVariants';
import {
  VARIANT_BG_CLASS,
  VARIANT_CATEGORY_LABEL_KEY,
} from '../ui/pageVariants';

interface BannerSectionProps {
  image: string | null;
  title: string;
  continentCode?: string;
  countryCode?: string;
  regionSlug?: string;
  islandSlug?: string;
  citySlug?: string;

  badges?: {
    label: string;
    icon: string | null;
    color?: string;
  }[];

  infoCards?: {
    title: string;
    subtitle: string;
    image: string;
    link?: string;
  }[];

  rightWidgets?: React.ReactNode;
  children?: React.ReactNode;

  continent?: Continent;
  country?: Country;

  accommodationCount?: number;
  regionPillLabel?: string | null;
  islandPillLabel?: string | null;
  topBarVariant?: PageVariant;
  beachCount?: number;
  /** Pages of the places in the location pills (see TopBar). */
  pillLinks?: Partial<LocationPillUrls>;
  /** Full names for the region/island pills (their collapsed labels are shortened). */
  pillNames?: { region?: string | null; island?: string | null; city?: string | null };
  /** Published beaches per pill level; a missing level shows no count box. */
  pillCounts?: Partial<Record<'continent' | 'country' | 'region' | 'island' | 'city', number | null>>;

  weather?: {
    temperature?: number | null;
    description?: string | null;
    icon_url?: string | null;
    location_name?: string | null;
  } | null;

  weatherLocationName?: string;
  isWeatherLoading?: boolean;
}

const BannerSection: React.FC<BannerSectionProps> = ({
  image,
  title,
  continent,
  accommodationCount,
  regionPillLabel,
  islandPillLabel,
  topBarVariant = 'continent',
  beachCount,
  continentCode,
  countryCode,
  regionSlug,
  islandSlug,
  citySlug,

  badges,
  infoCards,
  rightWidgets,
  children,
  country,
  weather,
  weatherLocationName,
  isWeatherLoading,
  pillLinks,
  pillNames,
  pillCounts,
}) => {
  const t = useTranslations('BannerSection');
  const tCommon = useTranslations('Common');
  const tFilters = useTranslations('Filters');
  const locale = useLocale();

  const variant = topBarVariant;
  const variantBgClass = VARIANT_BG_CLASS[variant];
  const categoryLabelKey = VARIANT_CATEGORY_LABEL_KEY[variant];

  const floatingButtonColorClass = variantBgClass;
  const showWeather = variant !== 'country' && variant !== 'continent';

  // Build map URL with context filters
  const buildMapUrl = () => {
    const params = new URLSearchParams();

    // Add filters based on current context
    if (continentCode) params.append('continent_code', continentCode);
    if (countryCode) params.append('country', countryCode);
    if (regionSlug) params.append('region', regionSlug);
    if (islandSlug) params.append('island', islandSlug);
    if (citySlug) params.append('city', citySlug);

    const queryString = params.toString();
    return buildBeachMapUrl(locale, queryString || undefined);
  };

  return (
    <>
      <section
        className={[
          'relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px]',
          'overflow-hidden rounded-b-[10px] rounded-t-[10px]',
          'bg-cover bg-center sm:h-[700px] lg:h-[735px]',
        ].join(' ')}
        style={{
          backgroundImage: image ? `url(${image})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 lg:p-8">
          {/* Top Bar */}
          <TopBar
            variant={variant}
            continent={continent}
            country={country}
            regionPillLabel={regionPillLabel}
            islandPillLabel={islandPillLabel}
            accommodationCount={accommodationCount}
            title={title}
            beachCount={beachCount}
            pillLinks={pillLinks}
            pillNames={pillNames}
            pillCounts={pillCounts}
          />

          <div className="flex flex-1 flex-col justify-center">
            {/* Title */}
            <div className="relative">
              <span
                className={[
                  'left-0 block font-figtree font-bold leading-[100%] text-white opacity-30',
                  'text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px]',
                ].join(' ')}
              >
                {t(categoryLabelKey)}
              </span>

              <h1
                className={[
                  'absolute bottom-0 left-[30px] font-figtree font-bold leading-[100%] text-white',
                  'text-[40px] sm:left-[50px] sm:text-[60px]',
                  'md:left-[80px] md:text-[80px]',
                  'lg:left-[100px] lg:text-[100px]',
                ].join(' ')}
              >
                {title}
              </h1>
            </div>

            <div
              className={[
                'mx-[20px] mt-8 flex flex-col items-start justify-between gap-6',
                'sm:mx-[50px] sm:mt-12 md:mx-[80px] lg:mx-[100px]',
                'lg:flex-row lg:items-end',
              ].join(' ')}
            >
                 {/* LEFT COLUMN — ALWAYS RENDER, even if badges do not exist */}
<div className="hidden min-w-0 flex-1 md:block">
  {badges && badges.length > 0 ? (
    <BottomBadges badges={badges} variant={variant} />
  ) : (
    // Empty placeholder so layout stays stable
    <div className="h-[1px] w-full" />
  )}
</div>


              {/* Widgets. No map thumbnail here: the floating map icon on the right edge
                  opens the same map (owner 2026-10-29), and an empty row is not rendered. */}
              {(showWeather || rightWidgets) && (
                <div className="flex shrink-0 justify-center gap-[6px] sm:gap-[10px] lg:justify-end">
                  {showWeather && (
                    <WeatherWidget
                      weather={weather}
                      locationName={weatherLocationName}
                      isLoading={isWeatherLoading}
                    />
                  )}
                  {rightWidgets}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Icons */}
        <div className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col">
          <Link
            href={buildMapUrl()}
            className={[
              'mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px]',
              'sm:h-[68.46px] sm:w-[71px]',
              'bg-variable-collection-temno-modro',
            ].join(' ')}
          >
            <Image
              src="/images/common/map-icon.svg"
              alt={tCommon('map')}
              width={24}
              height={24}
              className="h-[24px] w-[24px] sm:h-[33px] sm:w-[33px]"
            />
          </Link>

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
            className={[
              'flex h-12 w-12 items-center justify-center rounded-l-[10px]',
              'sm:h-[68.46px] sm:w-[71px]',
              floatingButtonColorClass,
            ].join(' ')}
          >
            <Image
              src="/images/common/white-filter.svg"
              alt={tFilters('filterButton')}
              width={20}
              height={20}
              className="h-[20px] w-[20px] sm:h-[28px] sm:w-[28px]"
            />
          </button>
        </div>
      </section>

      {/* ✔ CONDITIONAL → SHOW ONLY IF INFOCARDS EXIST */}
      {infoCards && infoCards.length > 0 && (
        <InfoCardsSection cards={infoCards} variant={variant} />
      )}

      {children}
    </>
  );
};

export default BannerSection;

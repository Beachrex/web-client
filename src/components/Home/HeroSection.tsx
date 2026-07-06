'use client';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { useContinents } from '@/hooks/useContinents';
import { useCountries } from '@/hooks/useCountries';
import { useHeroBanner } from '@/hooks/useFirstPageContent';
import Link from 'next/link';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildContinentUrl } from '@/lib/utils/beach-urls';

const HeroSection: React.FC = () => {
  const t = useTranslations('HomePage');
  const tContinents = useTranslations('Continents');
  const locale = useLocale();
  const { continents, loading, error } = useContinents();
  const { countries } = useCountries();
  const { content: heroBanner, loading: bannerLoading } = useHeroBanner();

  // Calculate total beaches count from all continents
  const totalBeaches = useMemo(() => {
    return continents.reduce((sum, continent) => sum + continent.beaches_count, 0);
  }, [continents]);

  // Get total countries count
  const totalCountries = useMemo(() => {
    return countries.length;
  }, [countries]);

  // Get background image from API (now returns relative path, need to prepend CDN)
  const backgroundImage = useMemo(() => {
    if (heroBanner?.media && heroBanner.media.length > 0) {
      // Try to find by collection first, then by is_primary, then just take first
      const bgMedia = heroBanner.media.find(m => m.collection === 'background_image')
        ?? heroBanner.media.find(m => m.is_primary)
        ?? heroBanner.media[0];
      const url = bgMedia?.url;
      if (url) {
        return buildCdnUrl(url, 'hero') ?? '';
      }
      return '';
    }
    return '';
  }, [heroBanner]);

  // Get hero title from API
  const heroTitle = heroBanner?.title ?? '';
  return (
    <section
      className="relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px] bg-cover bg-center sm:h-[700px] lg:h-[798px]"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Main content container */}
      <div className="relative z-1 flex h-full flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Top section - Continents buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-[9px]">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-10 w-10 animate-pulse items-center justify-center rounded-[10px] bg-gray-300 p-2 sm:h-[54px] sm:w-auto sm:gap-[16px] sm:px-[12px] sm:py-[9px]"
              >
                <div className="h-[25px] w-[25px] rounded bg-gray-400 sm:h-[35px] sm:w-[35px]" />
                <div className="hidden h-[24px] w-[80px] rounded bg-gray-400 sm:block" />
              </div>
            ))
          ) : error ? (
            // Error state - show fallback message
            <div className="text-white text-sm">
              {error}
            </div>
          ) : (
            // Render continents from API
            continents.map((c) => (
              <Link
                key={c.key}
                href={buildContinentUrl(locale, c.slug)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] bg-[#5E1CA5] p-2 transition-all hover:bg-[#7A2BC9] hover:shadow-lg sm:h-[54px] sm:w-auto sm:gap-[16px] sm:px-[12px] sm:py-[9px]"
                title={`${tContinents(c.key)} - ${tContinents('num_of_beaches')}: ${c.beaches_count}`}
              >
                <Image
                  src={c.icon}
                  alt={tContinents(c.key)}
                  width={25}
                  height={25}
                  className="opacity-100 sm:h-[35px] sm:w-[35px]"
                />
                <span className="hidden font-figtree text-[20px] font-bold leading-[24px] text-white sm:block">
                  {tContinents(c.key)}
                </span>
                {/* Optional: Show beach count as a small badge */}
                {c.beaches_count > 0 && (
                  <span className="hidden text-xs text-white/80 sm:block">
                    ({c.beaches_count})
                  </span>
                )}
              </Link>
            ))
          )}
        </div>

        <div className="container ml-0 mr-auto pl-[4%]">
          {/* Center section - Main heading */}
          <div className="flex flex-1 items-center">
            {bannerLoading ? (
              <div className="h-32 w-full max-w-2xl animate-pulse rounded bg-white/20" />
            ) : (
              <div className="font-damion text-white">
                <span className="block text-[40px] font-normal leading-tight sm:text-[80px] sm:leading-tight lg:text-[120px] lg:leading-[110px]">
                  {heroTitle}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="container ml-0 mr-auto pl-[4%]">
          {/* Bottom section - Stats */}
          <div className="flex flex-col gap-4 text-white sm:flex-row sm:gap-8 lg:gap-[80px]">
            {/* 1. Plaže */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Image
                src="/images/beach.png"
                alt="beach"
                width={40}
                height={40}
                className="sm:h-[60px] sm:w-[60px]"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold sm:text-[32px]">
                  {totalBeaches}
                </span>
                <span className="text-sm font-normal sm:text-[16px]">
                  {t('beachesLabel')}
                </span>
              </div>
            </div>

            {/* 2. Države */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Image
                src="/images/map.png"
                alt="map"
                width={40}
                height={40}
                className="sm:h-[60px] sm:w-[60px]"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold sm:text-[32px]">
                  {totalCountries}
                </span>
                <span className="text-sm font-normal sm:text-[16px]">
                  {t('countriesLabel')}
                </span>
              </div>
            </div>

            {/* 3. Namestitve */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Image
                src="/images/accomodation.png"
                alt="accommodation"
                width={40}
                height={40}
                className="sm:h-[60px] sm:w-[60px]"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold sm:text-[32px]">
                  {t('accommodationsCount')}
                </span>
                <span className="text-sm font-normal sm:text-[16px]">
                  {t('accommodationsLabel')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side floating buttons - Keep absolute for floating effect */}
      {/* Commented out for now
      <div className="absolute right-0 top-1/2 z-20 flex translate-y-[-50%] flex-col">
        Play / Beach button
        <Link
          href={tRoutes('beachMap')}
          className="mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px]
            bg-variable-collection-temno-modro sm:h-[68.46px] sm:w-[71px]"
        >
          <Image
            src="/images/map.png"
            alt="play beach"
            width={24}
            height={24}
            className="sm:h-[33px] sm:w-[33px]"
          />
        </Link>

        Filters button
        <button
          type="button"
          onClick={() => {
            const filtersSection = document.getElementById('filters-section');
            if (filtersSection) {
              filtersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              Open filter sidebar after scroll
              setTimeout(() => {
                window.dispatchEvent(new Event('openFilterSidebar'));
              }, 500);
            }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-l-[10px]
            bg-variable-collection-temno-modro sm:h-[68.46px] sm:w-[71px]"
        >
          <Image
            src="/images/filters.png"
            alt="filters"
            width={20}
            height={20}
            className="sm:h-[28px] sm:w-[28px]"
          />
        </button>
      </div>
      */}
    </section>
  );
};

export default HeroSection;

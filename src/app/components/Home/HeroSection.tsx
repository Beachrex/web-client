'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import { useContinents } from '@/app/hooks/useContinents';

const HeroSection: React.FC = () => {
  const t = useTranslations('HomePage');
  const tContinents = useTranslations('Continents');
  const { continents, loading, error } = useContinents();
  return (
    <section
      className="relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px] bg-cover bg-center sm:h-[700px] lg:h-[798px]"
      style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Main content container */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 lg:p-8">
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
              <div
                key={c.key}
                className="flex h-10 w-10 cursor-default items-center justify-center rounded-[10px] bg-[#5E1CA5] p-2 sm:h-[54px] sm:w-auto sm:gap-[16px] sm:px-[12px] sm:py-[9px]"
                title={`${tContinents(c.key)} - ${c.beaches_count} beaches`}
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
              </div>
            ))
          )}
        </div>

        <div className="container ml-0 mr-auto pl-[4%]">
          {/* Center section - Main heading */}
          <div className="flex flex-1 items-center">
            <div className="font-damion text-white">
              <span className="block text-[40px] font-normal leading-tight sm:text-[80px] sm:leading-tight lg:text-[120px] lg:leading-[110px]">
                {t('heroTitle1')}
              </span>
              <span className="block text-[40px] font-normal leading-tight sm:text-[80px] sm:leading-tight lg:text-[120px] lg:leading-[110px]">
                {t('heroTitle2')}
              </span>
            </div>
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
                  {t('beachesCount')}
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
                  {t('countriesCount')}
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
      <div className="absolute right-0 top-1/2 z-20 flex translate-y-[-50%] flex-col">
        {/* Play / Beach button */}
        <button className="mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-variable-collection-temno-modro sm:h-[68.46px] sm:w-[71px]">
          <Image
            src="/images/map.png"
            alt="play beach"
            width={24}
            height={24}
            className="sm:h-[33px] sm:w-[33px]"
          />
        </button>

        {/* Filters button */}
        <button className="flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-variable-collection-temno-modro sm:h-[68.46px] sm:w-[71px]">
          <Image
            src="/images/filters.png"
            alt="filters"
            width={20}
            height={20}
            className="sm:h-[28px] sm:w-[28px]"
          />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;

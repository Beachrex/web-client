'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import MapWidget from '@/components/BannerSection/MapWidget';
import WorldTopBar from './WorldTopBar';
import WeatherWidget from '@/components/BannerSection/WeatherWidget';

interface WorldBannerSectionProps {
  image: string;
  totalCountriesWithBeaches?: number;
  totalBeaches?: number;
  totalOpenPools?: number;
  totalIndoorPools?: number;
  totalIslandsWithBeaches?: number;
  totalRiverBeaches?: number;
  totalLakeBeaches?: number;
}

const WorldBannerSection: React.FC<WorldBannerSectionProps> = ({
  image,
  totalCountriesWithBeaches,
  totalBeaches,
  totalOpenPools,
  totalIndoorPools,
  totalIslandsWithBeaches,
  totalRiverBeaches,
  totalLakeBeaches,
}) => {
  const tWorldTopBar = useTranslations('WorldTopBar');
  const worldLabel = tWorldTopBar('worldLabel');

  return (
    <section
      className="relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px] overflow-hidden rounded-[10px] bg-cover bg-center sm:h-[700px] lg:h-[780px]"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Bottom gradient fade for a smoother transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[160px] bg-gradient-to-t from-black/65 via-black/30 to-transparent" />

      {/* Main content wrapper */}
      <div className="relative z-10 flex h-full flex-col">
        <div className=" flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

          {/* WorldTopBar at the top */}
          <div className="flex justify-start">
            <WorldTopBar
              totalCountriesWithBeaches={totalCountriesWithBeaches}
              totalBeaches={totalBeaches}
              totalOpenPools={totalOpenPools}
              totalIndoorPools={totalIndoorPools}
              totalIslandsWithBeaches={totalIslandsWithBeaches}
              totalRiverBeaches={totalRiverBeaches}
              totalLakeBeaches={totalLakeBeaches}
            />
          </div>

          {/* Center content: Ghost title + main title + widgets */}
          <div className="mt-10 flex flex-1 items-center justify-between gap-6 sm:mt-12 lg:mt-16">
         <div className="flex flex-1 flex-col justify-center">
            {/* Title block */}
            <div className="relative">
              {/* Big background category label */}
              <span
                className={[
                  'left-0 block font-figtree font-bold leading-[100%] text-white opacity-30',
                  'text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px]',
                ].join(' ')}
              >
                {worldLabel.toUpperCase()}
              </span>

              <span
                className={[
                  'absolute bottom-0 left-[30px] font-figtree font-bold leading-[100%] text-white',
                  'text-[40px] sm:left-[50px] sm:text-[60px]',
                  'md:left-[80px] md:text-[80px]',
                  'lg:left-[100px] lg:text-[100px]',
                ].join(' ')}
              >
                {worldLabel.toUpperCase()}
              </span>
            </div>

            </div>

            {/* Right side: Map + Weather widgets */}
            <div className="hidden sm:flex justify-end">
              <div className="flex gap-3 rounded-[12px] bg-white/92 p-3 shadow-lg backdrop-blur-sm sm:gap-4 sm:p-4">
                <MapWidget />
                <WeatherWidget />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldBannerSection;

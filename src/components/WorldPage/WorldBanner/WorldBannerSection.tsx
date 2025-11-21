'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import MapWidget from '@/components/BannerSection/MapWidget';
import WorldTopBar from './WorldTopBar';

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

  // Title reused from worldLabel translation
  const title = tWorldTopBar('worldLabel');

  return (
    <section
      className="relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px] bg-cover bg-center sm:h-[700px] lg:h-[798px]"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="container mx-auto flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {/* Top bar */}
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

          {/* Center content: title + map widget */}
          <div className="mt-10 flex flex-1 items-center justify-between gap-6 sm:mt-12 lg:mt-16">
            <div className="max-w-xl">
              <h1 className="font-figtree text-[70px] font-bold leading-[100%] text-white sm:text-[60px] md:text-[80px] lg:text-[96px]">
                {title}
              </h1>
            </div>

            <div className="hidden shrink-0 sm:flex">
              <MapWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldBannerSection;

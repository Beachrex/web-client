'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface SeaTempWidgetProps {
  tempC?: number | null;
  isLoading?: boolean;
}

const SeaTempWidget: React.FC<SeaTempWidgetProps> = ({ tempC, isLoading = false }) => {
  // Use provided temperature or show placeholder
  const displayTemp = tempC !== null && tempC !== undefined ? Math.round(tempC) : '--';
  const tBadges = useTranslations('BottomBadgesBeach.badges');

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px] font-figtree text-white">
        <Image
          src="/images/sea.png"
          alt="sea background"
          fill
          className="object-cover opacity-80 mix-blend-lighten"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px] font-figtree text-white">
      {/* Faded background image */}
      <Image
        src="/images/sea.png"
        alt="sea background"
        fill
        className="object-cover opacity-80 mix-blend-lighten"
        priority
      />

      {/* Much lighter overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-start justify-end p-[14px]">
        <Image
          src="/images/sea-water.png"
          alt={tBadges('SeaTemperature')}
          width={30}
          height={30}
          className="absolute right-[14px] top-[14px]"
        />

        <div className="mb-[4px] flex items-start">
          <span className="text-[50px] font-bold leading-[100%]">{displayTemp}</span>
          {displayTemp !== '--' && (
            <span className="ml-[2px] mt-[10px] text-[12px] font-semibold">
              °C
            </span>
          )}
        </div>

        <span className="text-[12px] font-bold leading-[100%]">
          {tBadges('SeaTemperature')}
        </span>
      </div>
    </div>
  );
};

export default SeaTempWidget;

'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface SeaTempWidgetProps {
  tempC?: number;
}

const SeaTempWidget: React.FC<SeaTempWidgetProps> = ({ tempC = 8 }) => {
  const tBadges = useTranslations('BottomBadgesBeach.badges');

  return (
    <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px] font-figtree text-white">
      {/* Background image */}
      <Image
        src="/images/sea.png"
        alt="sea background"
        fill
        className="object-cover"
      />

      {/* Darker overlay (closer to Figma design) */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content (aligned left, slightly lower) */}
      <div className="relative z-10 flex h-full flex-col items-start justify-start pl-[14px] pt-[60px]">
        {/* Icon - top right */}
        <Image
          src="/images/sea-water.png"
          alt={tBadges('SeaTemperature')}
          width={30}
          height={30}
          className="absolute right-[14px] top-[14px]"
        />

        {/* Temperature */}
        <div className="flex items-start">
          <span className="text-[50px] font-bold leading-[100%]">{tempC}</span>
          <span className="ml-[2px] mt-[10px] text-[12px] font-semibold">
            °C
          </span>
        </div>

        {/* Label */}
        <span className="mt-[6px] text-[12px] font-bold leading-[100%]">
          {tBadges('SeaTemperature')}
        </span>
      </div>
    </div>
  );
};

export default SeaTempWidget;

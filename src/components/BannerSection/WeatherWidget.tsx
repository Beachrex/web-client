'use client';
import Image from 'next/image';
import React from 'react';

const WeatherWidget: React.FC = () => {
  return (
    <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px] bg-black/15 font-figtree text-white">
      {/* Icon (top right) */}
      <Image
        src="/images/beach.png"
        alt="vreme ikona"
        width={36}
        height={36}
        className="absolute right-[14px] top-[14px]"
      />

      {/* Content bottom-left */}
      <div className="absolute bottom-[14px] left-[14px] z-10 flex flex-col items-start justify-end">
        {/* Temperature */}
        <div className="flex items-start">
          <span className="text-[50px] font-bold leading-[100%]">23</span>
          <span className="ml-[2px] mt-[10px] text-[12px] font-semibold">°C</span>
        </div>

        {/* Location */}
        <div className="mt-[4px] flex items-center gap-[4px]">
          <Image
            src="/images/banner/rotated-arrow.png"
            alt="lokacija"
            width={10}
            height={10}
          />
          <span className="text-[12px] font-bold leading-[100%]">Krk</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;

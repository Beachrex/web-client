'use client';
import Image from 'next/image';
import React from 'react';

const WeatherWidget: React.FC = () => {
  return (
    <div className="relative flex h-[144px] w-[144px] flex-col items-center justify-center rounded-[10px] bg-white/20 font-figtree text-white opacity-70">
      {/* Ikona vremena */}
      <Image
        src="/images/banner/weather-icons/sun.png" // primer ikone
        alt="vreme"
        width={40}
        height={30}
        className="absolute left-[86px] top-[15px]"
      />

      {/* Temperatura */}
      <div className="mt-[30px] flex items-start">
        <span className="text-[50px] font-bold leading-[100%]">23</span>
        <span className="ml-[2px] mt-[10px] text-[12px] font-semibold">°C</span>
      </div>

      {/* Lokacija */}
      <div className="mt-[10px] flex items-center gap-[4px]">
        <Image
          src="/images/banner/rotated-arrow.png"
          alt="lokacija"
          width={10}
          height={10}
        />
        <span className="font-figtree text-[12px] font-bold leading-[100%] text-white">
          Krk
        </span>
      </div>
    </div>
  );
};

export default WeatherWidget;

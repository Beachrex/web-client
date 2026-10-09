'use client';
import Image from 'next/image';
import React from 'react';

const MapWidget: React.FC = () => {
  return (
    <div className="relative h-[144px] w-[144px] overflow-hidden rounded-[10px]">
      <Image
        src="/images/banner/banner-map.png"
        alt=""
        fill
        className="object-cover"
        priority
      />

      <div className="pointer-events-none absolute inset-0 bg-black/5" />
    </div>
  );
};

export default MapWidget;

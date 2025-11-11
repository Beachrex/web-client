'use client';
import Image from 'next/image';
import React from 'react';

const MapWidget: React.FC = () => {
  return (
    <div className="relative aspect-square w-36 overflow-hidden rounded-[10px]">
      <Image
        src="/images/banner/banner-map.png"
        alt="mapa"
        fill
        className="object-cover rounded-inherit"
        priority
      />

      <div className="absolute inset-0 rounded-inherit bg-black/20 pointer-events-none" />
    </div>
  );
};

export default MapWidget;

'use client';
import Image from 'next/image';
import React from 'react';

const MapWidget: React.FC = () => {
  return (
    <div className="h-[144px] w-[144px] overflow-hidden rounded-[10px] bg-[#000] opacity-70">
      <Image
        src="/images/banner/banner-map.png" // začasna slika
        alt="mapa"
        width={144}
        height={144}
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default MapWidget;

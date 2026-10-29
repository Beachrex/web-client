'use client';
import Image from 'next/image';
import React from 'react';

/**
 * Decorative map thumbnail. Only the world banner uses it (wrapped in its own link),
 * because that banner has no floating map icon. Continent/country/region/island/city
 * and beach banners do not render it: their floating map icon opens the same map
 * (owner 2026-10-29).
 */
const MapWidget: React.FC = () => (
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

export default MapWidget;

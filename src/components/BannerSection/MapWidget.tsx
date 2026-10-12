'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface MapWidgetProps {
  /** Beach map URL for this place; the thumbnail is a link when set (owner 2026-10-12: it was not clickable). */
  href?: string;
  /** Accessible name of the link (the image itself is decorative). */
  label?: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({ href, label }) => {
  const thumbnail = (
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

  if (!href) return thumbnail;

  return (
    <Link href={href} aria-label={label} className="block rounded-[10px] transition hover:opacity-90">
      {thumbnail}
    </Link>
  );
};

export default MapWidget;

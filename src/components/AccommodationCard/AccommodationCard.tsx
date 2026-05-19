'use client';

import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export interface AccommodationCardProps {
  // Keeping props minimal; extend later when data becomes dynamic
  title?: string;
  locationLabel?: string; // e.g., "Baška"
  distanceText?: string; // e.g., "250 m od plaže"
  beachName?: string; // e.g., "Plaža Haludovo"
  priceText?: string; // e.g., "od 25 €"
}

/**
 * Memoized AccommodationCard component to prevent unnecessary re-renders in carousels
 * Only re-renders when props change
 */
const AccommodationCard = React.memo<AccommodationCardProps>(function AccommodationCard({
  title,
  locationLabel,
  distanceText,
  beachName,
  priceText,
}) {
  const t = useTranslations('Common');
  const [isFavorite, setIsFavorite] = useState(false);

  // Use translations as defaults
  const displayTitle = title ?? t('accommodationDefaultTitle');
  const displayLocation = locationLabel ?? t('accommodationDefaultLocation');
  const displayDistance = distanceText ?? t('accommodationDefaultDistance');
  const displayBeach = beachName ?? t('accommodationDefaultBeach');
  const displayPrice = priceText ?? t('accommodationDefaultPrice');

  // Memoize toggle handler to prevent recreation on every render
  const toggleFavorite = React.useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  return (
    <div className="flex h-[400px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg">
      {/* Top banner area */}
      <div className="relative grow">
        {/* Single background image (no carousel) */}
        <Image
          src="/images/propertycard/accommodation-card-banner.png"
          alt="Accommodation"
          fill
          priority
          className="rounded-inherit object-cover"
        />

        {/* Top-left badges (same look as PropertyCard) */}
        <div className="absolute left-2 top-2 flex gap-1">
          <div className="flex items-center rounded-[12px] bg-white px-[8px] py-[2px]">
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              Najbolj obiskano
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-[12px] bg-[#F5F5F5] px-[8px] py-[2px]">
            <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              7.2
            </span>
          </div>
        </div>

        {/* Top-right heart */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? 'Remove from favourites' : 'Save to favourites'
          }
          className="absolute right-2 top-2 rounded-full p-1 transition hover:bg-black/40"
        >
          <Heart
            size={22}
            // lucide Heart needs fill for solid color
            fill={isFavorite ? '#ef4444' : 'transparent'}
            color={isFavorite ? '#ef4444' : '#ffffff'}
          />
        </button>

        {/* Bottom overlay controls */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          {/* LEFT: Flag + orange location badge */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="h-[47px] w-[40px] overflow-hidden rounded-[6px] shadow-sm">
              <Image
                src="/images/propertycard/croatia-icon.png"
                alt="Croatia flag"
                width={40}
                height={47}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px]">
              <span className="font-figtree text-[12px] font-bold text-white">
                {displayLocation}
              </span>
            </div>
          </div>

          {/* RIGHT: Blue beach distance badge */}
          <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-[8px] bg-[#0069AB] px-3 py-[10px] text-white">
            <Image
              src="/images/beach.png"
              alt="Beach"
              width={18}
              height={18}
              className="shrink-0"
            />
            <span className="truncate font-figtree text-[14px] leading-[100%]">
              <span className="font-medium">{displayDistance}&nbsp;</span>
              <span className="font-bold">{displayBeach}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom white section */}
      <div className="flex shrink-0 flex-col gap-4 rounded-b-[10px] bg-white px-5 py-4">
        {/* Title + price row */}
        <div className="flex items-center justify-between">
          <h3 className="font-figtree text-[20px] font-bold leading-[100%] tracking-tight text-[#222222]">
            {displayTitle}
          </h3>
          <div className="text-right font-figtree text-[20px] font-bold leading-[100%] tracking-tight text-[#222222]">
            {displayPrice}
          </div>
        </div>

        {/* Features row */}
        <p className="font-figtree text-[12px] font-medium leading-4 tracking-tight text-[#4D4D4D]">
          Celotno stanovanje <span className="mx-[2px]">•</span> 2 spalnici{' '}
          <span className="mx-[2px]">•</span> 1 dnevna soba{' '}
          <span className="mx-[2px]">•</span> 1 kopalnica{' '}
          <span className="mx-[2px]">•</span> 1 kuhinja{' '}
          <span className="mx-[2px]">•</span> 45 m²
        </p>
      </div>
    </div>
  );
});

export default AccommodationCard;

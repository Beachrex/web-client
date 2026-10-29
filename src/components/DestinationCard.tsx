// DestinationCard.tsx
'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  prefetchCountryDetails,
  prefetchRegionDetails,
  prefetchIslandDetails,
  prefetchCityDetails,
  debouncedPrefetch,
  cancelPrefetch,
} from '@/lib/prefetch-utils';
import { FEATURES } from '@/lib/constants/features';

interface DestinationCardProps {
  country: Country;
  url: string;
  /** Beach map filtered to this place (the pin opens it; owner 2026-10-29) */
  mapUrl?: string;
  badgeLabel?: string;
  bottomVariant?: 'default' | 'city' | 'island' | 'region';
  showFlag?: boolean;
}


/**
 * Memoized DestinationCard component to prevent unnecessary re-renders in carousels
 * Only re-renders when country data, badgeLabel, bottomVariant, or showFlag changes
 */
const DestinationCard = React.memo<DestinationCardProps>(function DestinationCard({
  country,
  url,
  mapUrl,
  badgeLabel,
  bottomVariant = 'default',
  showFlag = false,
}) {
  const tHome = useTranslations('HomePage');
  const tDest = useTranslations('Destinations');
  const tCard = useTranslations('PropertyCard');
  const queryClient = useQueryClient();

  const name = country.name ?? '';
  const beachCount = country.beaches_count ?? 0;


const countryLike = country as Record<string, unknown>;

const countryCode =
  ((typeof countryLike.country_code === 'string' && countryLike.country_code) ||
    country.code) ??
  country.slug ??
  '';


const flagUrl =
  typeof countryCode === 'string' && countryCode
    ? buildCdnUrl(`img/flag/${countryCode.toLowerCase()}.svg`, 'icon')
    : null;


  const src = country.main_image
    ? buildCdnUrl(country.main_image, 'carousel') ?? '/images/topdestination/spain.jpg'
    : '/images/topdestination/spain.jpg';

  const accommodationCount =
    typeof (country as Record<string, unknown>).accommodations_count ===
    'number'
      ? (country as { accommodations_count: number }).accommodations_count
      : 20;

  const priceText = tDest('priceFrom');
  const beachesLabel = tHome('beachesLabel2');

  const bottomBgClass =
    bottomVariant === 'city'
      ? 'bg-[#FFEFDE]'
      : bottomVariant === 'island'
        ? 'bg-[#FBF6E5]'
        : bottomVariant === 'region'
          ? 'bg-[#FBE6EE]'
          : 'bg-[#F8E2E2]';

  const locationIconSrc =
    bottomVariant === 'city'
      ? '/images/beachicons/location-icon-orange.svg'
      : bottomVariant === 'island'
        ? '/images/beachicons/location-icon-yellow.svg'
        : '/images/topdestination/icon.png';

  /**
   * Prefetch data on hover to improve perceived performance
   * Debounced to avoid excessive prefetching on quick mouse movements
   */
  const handleMouseEnter = useCallback(() => {
    const code = country.code ?? country.slug ?? '';
    if (!code) return;

    debouncedPrefetch(async () => {
      // Prefetch based on card variant
      switch (bottomVariant) {
        case 'city':
          await prefetchCityDetails(queryClient, code);
          break;
        case 'island':
          await prefetchIslandDetails(queryClient, code);
          break;
        case 'region':
          await prefetchRegionDetails(queryClient, code);
          break;
        default:
          // Default is country
          await prefetchCountryDetails(queryClient, code);
          break;
      }
    });
  }, [queryClient, country.code, country.slug, bottomVariant]);

  /**
   * Cancel prefetch if user moves mouse away quickly
   */
  const handleMouseLeave = useCallback(() => {
    cancelPrefetch();
  }, []);

  return (
    // The whole card opens the place (a link stretched over the card); the pin is a separate link to the map
    // above it, since a link cannot be nested in another one.
    <div
      className="relative flex h-[310px] flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg focus-within:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={url}
        aria-label={name}
        data-testid="destination-card-link"
        className="absolute inset-0 z-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2342] focus-visible:ring-inset"
      />
      <div className="relative w-full flex-1">
        {/* No priority: these cards sit in carousels below the fold; only the banner image is preloaded */}
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover"
        />

        {/* Fixed placeholder badge ("Scenic town"): hidden for launch */}
        {FEATURES.placeCardBadges && badgeLabel && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0A2342] sm:text-sm">
            {badgeLabel}
          </div>
        )}

        {/* desktop info row */}
        <div className="absolute bottom-2 left-2 right-2 hidden gap-2 sm:flex">
          {/* Accommodation count and price: hidden for launch (placeholder values) */}
          {FEATURES.accommodation && (
            <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#008260] px-3 text-white">
              <Image
                src="/images/accomodation.png"
                alt=""
                width={26}
                height={26}
              />
              <span className="text-[13px] font-semibold">
                {accommodationCount}
              </span>
              <span
                aria-hidden
                className="block h-[18px] w-[1px] shrink-0 bg-white/90"
              />
              <span className="text-[13px] font-semibold">{priceText}</span>
            </div>
          )}

          <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#0069AB] px-3 text-white">
            <Image
              src="/images/beach.png"
              alt=""
              width={26}
              height={26}
            />
            <span className="text-[13px] font-semibold">
              {beachesLabel} {beachCount}
            </span>
          </div>
        </div>
      </div>

      {/* bottom bar – now themed */}
      <div
        className={`flex items-center justify-between p-3 sm:p-4 ${bottomBgClass}`}
      >
        <div className="flex items-center gap-2">
         {showFlag && flagUrl && (
  <Image
    src={flagUrl}
    alt=""
    width={32}
    height={24}
    className="w-[32px] h-[24px] rounded-md object-cover sm:w-[32px] sm:h-[24px]"
  />
)}


          <span className="text-lg font-bold text-[#0A2342] truncate sm:text-xl">
            {name}
          </span>
        </div>
        {mapUrl ? (
          <Link
            href={mapUrl}
            prefetch={false}
            data-testid="destination-card-map-pin"
            aria-label={tCard('showOnMap', { title: name })}
            title={tCard('showOnMap', { title: name })}
            className="relative z-20 shrink-0 rounded-full transition-transform hover:scale-110 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2342] focus-visible:ring-offset-2"
          >
            <Image
              src={locationIconSrc}
              alt=""
              width={24}
              height={24}
              className="sm:h-8 sm:w-8"
            />
          </Link>
        ) : (
          <Image
            src={locationIconSrc}
            alt=""
            width={24}
            height={24}
            className="sm:h-8 sm:w-8"
          />
        )}
      </div>

      {/* mobile info row */}
      <div className="flex gap-2 bg-gray-50 p-3 sm:hidden">
        {/* Accommodation count and price: hidden for launch (placeholder values) */}
        {FEATURES.accommodation && (
          <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#008260] px-3 text-white">
            <Image
              src="/images/accomodation.png"
              alt=""
              width={26}
              height={26}
            />
            <span className="text-[13px] font-semibold">
              {accommodationCount}
            </span>
            <span
              aria-hidden
              className="block h-[18px] w-[1px] shrink-0 bg-white/90"
            />
            <span className="text-[13px] font-semibold">{priceText}</span>
          </div>
        )}
        <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#0069AB] px-3 text-white">
          <Image
src="/images/beach.png" alt="" width={26}
height={26}
          />
          <span className="text-[13px] font-semibold">
            {beachesLabel} {beachCount}
          </span>
        </div>
      </div>
    </div>
  );
});

export default DestinationCard;

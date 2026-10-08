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
  badgeLabel,
  bottomVariant = 'default',
  showFlag = false,
}) {
  const tHome = useTranslations('HomePage');
  const tDest = useTranslations('Destinations');
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
    <Link
      href={url}
      className="flex h-[310px] flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full flex-1">
        <Image
src={src} alt={name} fill
className="object-cover" priority
        />

        {badgeLabel && (
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
                alt="Accommodation"
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
              alt="Beaches"
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
    alt={`${name} flag`}
    width={32}
    height={24}
    className="w-[32px] h-[24px] rounded-md object-cover sm:w-[32px] sm:h-[24px]"
  />
)}


          <span className="text-lg font-bold text-[#0A2342] truncate sm:text-xl">
            {name}
          </span>
        </div>
        <Image
          src={locationIconSrc}
          alt="Location"
          width={24}
          height={24}
          className="sm:h-8 sm:w-8"
        />
      </div>

      {/* mobile info row */}
      <div className="flex gap-2 bg-gray-50 p-3 sm:hidden">
        {/* Accommodation count and price: hidden for launch (placeholder values) */}
        {FEATURES.accommodation && (
          <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#008260] px-3 text-white">
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
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
src="/images/beach.png" alt="Beaches" width={26}
height={26}
          />
          <span className="text-[13px] font-semibold">
            {beachesLabel} {beachCount}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default DestinationCard;

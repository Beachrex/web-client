'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface DestinationCardProps {
  country: Country;
  badgeLabel?: string; // e.g. t('HomePage.seaExperiences')
}

export default function DestinationCard({
  country,
  badgeLabel,
}: DestinationCardProps) {
  const tHome = useTranslations('HomePage');
  const tDest = useTranslations('Destinations');

  const name = country.name ?? '';
  const beachCount =
  (country as { beaches_count?: number; beachCount?: number }).beachCount ??
  (country as { beaches_count?: number }).beaches_count ??
  0;


  // Prefer API image; otherwise fallback to a neutral default
  const src = country.image_path
    ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${country.image_path}`
    : '/images/topdestination/spain.jpg';

  // TODO: replace with real backend field when available
  const accommodationCount =
  typeof (country as Record<string, unknown>).accommodations_count === 'number'
    ? (country as { accommodations_count: number }).accommodations_count
    : Math.floor(Math.random() * 50) + 10;

  const priceText = tDest('priceFrom'); // e.g., "od 25€"
  const beachesLabel = tHome('beachesLabel2'); // "Plaže:" / "Beaches:"

  return (
    <div className="flex h-[310px] flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Image area fills remaining vertical space to avoid white gaps */}
      <div className="relative w-full flex-1">
        <Image
src={src} alt={name} fill
className="object-cover" priority
        />

        {/* Badge (top-left) */}
        {badgeLabel && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0A2342] sm:text-sm">
            {badgeLabel}
          </div>
        )}

        {/* Desktop/Tablet info row (inside image, visible from sm+) */}
        <div className="absolute bottom-2 left-2 right-2 hidden gap-2 sm:flex">
          {/* Left info: accommodations + price */}
          <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#008260] px-3 text-white">
            {/* icon 26x26 */}
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
              width={26}
              height={26}
            />
            {/* number */}
            <span className="text-[13px] font-semibold">
              {accommodationCount}
            </span>
            {/* separator line */}
            {/* vertical separator */}
            <span
              aria-hidden
              className="block h-[18px] w-[1px] shrink-0 bg-white/90"
            />

            {/* price text */}
            <span className="text-[13px] font-semibold">{priceText}</span>
          </div>

          {/* Right info: beaches with label */}
          <div className="flex h-[41px] flex-1 items-center justify-start gap-2 rounded bg-[#0069AB] px-3 text-white">
            {/* icon 26x26 */}
            <Image
              src="/images/beach.png"
              alt="Beaches"
              width={26}
              height={26}
            />
            {/* "Plaže:" / "Beaches:" + number */}
            <span className="text-[13px] font-semibold">
              {beachesLabel} {beachCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar (country + icon) */}
      <div className="flex items-center justify-between bg-[#F8E2E2] p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/images/topdestination/country.png"
            alt="Country flag"
            width={24}
            height={24}
            className="sm:h-8 sm:w-8"
          />
          <span className="text-lg font-bold text-[#0A2342] sm:text-xl">
            {name}
          </span>
        </div>
        <Image
          src="/images/topdestination/icon.png"
          alt="More info"
          width={24}
          height={24}
          className="sm:h-8 sm:w-8"
        />
      </div>

      {/* Mobile info row (only on mobile) */}
      <div className="flex gap-2 bg-gray-50 p-3 sm:hidden">
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
          {/* vertical separator */}
          <span
            aria-hidden
            className="block h-[18px] w-[1px] shrink-0 bg-white/90"
          />

          <span className="text-[13px] font-semibold">{priceText}</span>
        </div>
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
    </div>
  );
}

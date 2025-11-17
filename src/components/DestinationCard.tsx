// DestinationCard.tsx
'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { buildCountryUrl } from '@/lib/utils/beach-urls';

interface DestinationCardProps {
  country: Country;
  badgeLabel?: string;
  bottomVariant?: 'default' | 'city' | 'island';
}

export default function DestinationCard({
  country,
  badgeLabel,
  bottomVariant = 'default',
}: DestinationCardProps) {
  const tHome = useTranslations('HomePage');
  const tDest = useTranslations('Destinations');
  const locale = useLocale();

  const name = country.name ?? '';
  const beachCount = country.beaches_count ?? 0;

  const countrySlug = country.slug ?? country.code?.toLowerCase() ?? '';
  const continentSlug =
    country.continent?.slug ?? country.continent_code?.toLowerCase() ?? '';

  const countryUrl = buildCountryUrl(locale, continentSlug, countrySlug);

  const src = country.image_path
    ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${country.image_path}`
    : '/images/topdestination/spain.jpg';

  const accommodationCount =
    typeof (country as Record<string, unknown>).accommodations_count === 'number'
      ? (country as { accommodations_count: number }).accommodations_count
      : Math.floor(Math.random() * 50) + 10;

  const priceText = tDest('priceFrom');
  const beachesLabel = tHome('beachesLabel2');

  const bottomBgClass =
    bottomVariant === 'city'
      ? 'bg-[#FFEFDE]'
      : bottomVariant === 'island'
      ? 'bg-[#FBF6E5]'
      : 'bg-[#F8E2E2]';

  const locationIconSrc =
    bottomVariant === 'city'
      ? '/images/beachicons/location-icon-orange.svg'
      : bottomVariant === 'island'
      ? '/images/beachicons/location-icon-yellow.svg'
      : '/images/topdestination/icon.png';

  return (
    <Link
      href={countryUrl}
      className="flex h-[310px] flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
    >
      <div className="relative w-full flex-1">
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          priority
        />

        {badgeLabel && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0A2342] sm:text-sm">
            {badgeLabel}
          </div>
        )}

        {/* desktop info row */}
        <div className="absolute bottom-2 left-2 right-2 hidden gap-2 sm:flex">
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
          src={locationIconSrc}
          alt="Location"
          width={24}
          height={24}
          className="sm:h-8 sm:w-8"
        />
      </div>

      {/* mobile info row */}
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
          <span
            aria-hidden
            className="block h-[18px] w-[1px] shrink-0 bg-white/90"
          />
          <span className="text-[13px] font-semibold">{priceText}</span>
        </div>
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
    </Link>
  );
}

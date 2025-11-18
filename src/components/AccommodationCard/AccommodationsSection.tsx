'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { ChevronRight } from 'lucide-react';
import DistanceDropdown, { type DistanceOption } from '../DistanceDropdown';
import { type AccommodationCardProps } from './AccommodationCard';
import AccommodationFlowbiteCarousel from './AccommodationCarousel';

interface Props {
  title?: string;
  totalCount?: number;
  items?: AccommodationCardProps[];
  showDropdown?: boolean;
  distanceOptions?: DistanceOption[];
  selectedDistance?: DistanceOption;
  onFilterClick?: () => void;
  onMapClick?: () => void;
  onDistanceChange?: (value: string | number) => void;
  onAllAccommodationsClick?: () => void;
}

export default function AccommodationSection({
  title,
  totalCount = 0,
  items = Array.from({ length: 8 }, () => ({}) as AccommodationCardProps),
  showDropdown = true,
  distanceOptions = [
    { value: 0.25, label: '250 m' },
    { value: 0.5, label: '500 m' },
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
  ],
  selectedDistance,
  onFilterClick,
  onMapClick,
  onDistanceChange,
  onAllAccommodationsClick,
}: Props) {
  const tAcc = useTranslations('AccommodationSection');

  const heading = title ?? tAcc('accomodationTitle');

  return (
    <section className="relative overflow-hidden bg-[#F5F5F5] py-10 sm:py-14 lg:py-20">
      {/* Decorative background image */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 opacity-60">
        <div className="relative h-[400px] w-[400px]">
          <Image
            src="/images/accomodation.svg"
            alt="Decorative beach image"
            width={400}
            height={400}
            className="h-full w-full select-none object-contain"
            priority
          />
        </div>
      </div>

      {/* Content wrapper */}
      <div className="container relative z-10 mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center">
          <h2 className="font-figtree text-[30px] font-bold leading-[100%] text-[#222222]">
            {heading}
          </h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* All accommodations link */}
            <button
              type="button"
              onClick={() => onAllAccommodationsClick?.()}
              className="inline-flex items-center gap-[4px] font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] hover:text-[#555] sm:text-[14px]"
            >
              <span className="underline underline-offset-[2px]">
                {tAcc('accommodationsLink', { count: totalCount })}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Filter button */}
            <button
              type="button"
              onClick={() => onFilterClick?.()}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#5E1CA5] px-5 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#4b1489]"
            >
              <Image
                src="/images/filters.png"
                alt="Filter icon"
                width={20}
                height={20}
              />
              <span>{tAcc('filterButton')}</span>
            </button>

            {/* Map button */}
            <button
              type="button"
              onClick={() => onMapClick?.()}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78]"
            >
              <Image
                src="/images/map.png"
                alt="Map icon"
                width={20}
                height={20}
              />
              <span>{tAcc('mapButton')}</span>
            </button>

            {/* Distance dropdown (reusable component) */}
            {showDropdown && (
              <DistanceDropdown
                value={
                  selectedDistance?.value ?? distanceOptions[0]?.value ?? ''
                }
                options={distanceOptions}
                onChange={(val) => onDistanceChange?.(val)}
                ariaLabel={tAcc('dropdownAria')}
                renderOptionLabel={(opt) =>
                  tAcc('dropdownOption', { distance: opt.label })
                }
              />
            )}
          </div>
        </div>

        {/* Carousel (cards 4/3/2/1 by breakpoint) */}
        <AccommodationFlowbiteCarousel items={items} />
      </div>
    </section>
  );
}

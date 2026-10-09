'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import DistanceDropdown, { type DistanceOption } from '../DistanceDropdown';

interface Props {
  title?: string;
  totalCount?: number;
  // Show dropdown only on the beach page
  showDropdown?: boolean;
  distanceOptions?: DistanceOption[];
  selectedDistance?: DistanceOption;
  onFilterClick?: () => void;
  onMapClick?: () => void;
  onDistanceChange?: (value: string | number) => void;
  onAllActivitiesClick?: () => void;
}

export default function GetYourGuideSection({
  // Keep prop but alias to an underscored local to satisfy no-unused-vars
  title: _title,
  totalCount = 0,
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
  onAllActivitiesClick,
}: Props) {
  const tAcc = useTranslations('AccommodationSection');

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-14 lg:py-20">
      {/* Decorative background icon */}
      <div className="pointer-events-none absolute left-0 top-0 z-0 opacity-80">
        <div className="relative aspect-square w-[260px] max-w-full">
          <Image
            src="/images/banner/signpost-big.png"
            alt=""
            fill
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
            {tAcc('activitiesTitle')}
          </h2>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* All activities link */}
            <button
              type="button"
              onClick={() => onAllActivitiesClick?.()}
              className="inline-flex items-center gap-[4px] font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] hover:text-[#555] sm:text-[14px]"
            >
              <span className="underline underline-offset-[2px]">
                {tAcc('activitiesLink', { count: totalCount })}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Filter button (dark red) */}
            <button
              type="button"
              onClick={() => {
                const filtersSection = document.getElementById('filters-section');
                if (filtersSection) {
                  filtersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // Open filter sidebar after scroll
                  setTimeout(() => {
                    window.dispatchEvent(new Event('openFilterSidebar'));
                  }, 500);
                }
                onFilterClick?.();
              }}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#8C062B] px-5 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#6E0521]"
            >
              <Image
                src="/images/filters.png"
                alt=""
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
                alt=""
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
                ariaLabel={tAcc('dropdownAria', {
                  default: 'Razdalja od plaže',
                })}
                renderOptionLabel={(opt) =>
                  tAcc('dropdownOption', { distance: opt.label })
                }
              />
            )}
          </div>
        </div>

        {/* Content area for future GetYourGuide cards / carousel */}
        <div className="min-h-[40px]">
          {/* TODO: Add GetYourGuide activities carousel/cards once available */}
        </div>
      </div>
    </section>
  );
}

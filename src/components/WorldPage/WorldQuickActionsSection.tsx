'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface WorldQuickActionsSectionProps {
  onAccommodationsClick?: () => void;
  onWeatherClick?: () => void;
  onTopBeachesClick?: () => void;
}

const WorldQuickActionsSection: React.FC<WorldQuickActionsSectionProps> = ({
  onAccommodationsClick,
  onWeatherClick,
  onTopBeachesClick,
}) => {
  return (
    <section className="bg-[#F5F7FA] py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Accommodations */}
          <button
            type="button"
            onClick={onAccommodationsClick}
            className="group relative flex flex-col justify-between rounded-[12px] border border-[#E1E5EB] bg-white px-5 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-[3px] hover:border-[#1A3C68]/40 hover:shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
          >
            {/* subtle top gradient line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#1A3C68] via-[#16BFD6] to-[#1A3C68] opacity-70" />

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-[#1A3C68]/10 p-2">
                <Image
                  src="/images/accomodation.png"
                  alt="Accommodations"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-figtree text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Stay near the beach
                </span>
                <span className="font-figtree text-[16px] font-bold leading-[120%] text-[#111827]">
                  World accommodations
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="max-w-[230px] font-figtree text-[13px] leading-[140%] text-[#6B7280]">
                Discover stays close to the most popular beaches worldwide.
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF2F7] transition group-hover:bg-[#1A3C68]">
                <ChevronRight className="h-4 w-4 text-[#6B7280] transition group-hover:text-white" />
              </div>
            </div>
          </button>

          {/* Weather */}
          <button
            type="button"
            onClick={onWeatherClick}
            className="group relative flex flex-col justify-between rounded-[12px] border border-[#E1E5EB] bg-white px-5 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-[3px] hover:border-[#16BFD6]/50 hover:shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#16BFD6] via-[#4FD1C5] to-[#0EA5E9] opacity-80" />

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-[#16BFD6]/10 p-2">
                <Image
                  src="/images/weather-icon.png"
                  alt="Weather"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-figtree text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  When to visit
                </span>
                <span className="font-figtree text-[16px] font-bold leading-[120%] text-[#111827]">
                  Beach weather overview
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="max-w-[230px] font-figtree text-[13px] leading-[140%] text-[#6B7280]">
                Check air and sea temperature by region before your trip.
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF2F7] transition group-hover:bg-[#16BFD6]">
                <ChevronRight className="h-4 w-4 text-[#6B7280] transition group-hover:text-white" />
              </div>
            </div>
          </button>

          {/* Top beaches */}
          <button
            type="button"
            onClick={onTopBeachesClick}
            className="group relative flex flex-col justify-between rounded-[12px] border border-[#E1E5EB] bg-white px-5 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-[3px] hover:border-[#FB923C]/60 hover:shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#FDBA74] via-[#FB923C] to-[#F97316] opacity-80" />

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-[#FDBA74]/20 p-2">
                <Image
                  src="/images/topdestination/icon.png"
                  alt="Top beaches"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-figtree text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Curated picks
                </span>
                <span className="font-figtree text-[16px] font-bold leading-[120%] text-[#111827]">
                  World TOP beaches
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="max-w-[230px] font-figtree text-[13px] leading-[140%] text-[#6B7280]">
                Jump to hand-picked lists of the most beautiful beaches.
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF2F7] transition group-hover:bg-[#FB923C]">
                <ChevronRight className="h-4 w-4 text-[#6B7280] transition group-hover:text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default WorldQuickActionsSection;

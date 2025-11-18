'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import PropertyCard from './PropertyCard/PropertyCard';
import { ChevronRight } from 'lucide-react';

// TODO: optionally export this type so you can reuse it elsewhere
export interface Property {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: string;
  isFreeBreakfast?: boolean;
  isFreeCancellation?: boolean;
}

interface PropertySectionProps {
  title: string;
  totalCount?: number;
  properties: Property[];
  // Optional: custom right-side element (e.g. dropdown instead of link)
  headerRight?: React.ReactNode;
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  totalCount = 124,
  properties,
  headerRight,
}) => {
  const t = useTranslations('PropertySection');

  return (
    <section className="relative overflow-x-hidden bg-white py-10 sm:py-14 lg:py-20">
      {/* Decorative background image (fixed to left edge) */}
      <div className="pointer-events-none absolute left-0 top-1/2 z-[1] -translate-y-1/2">
        <div className="relative h-[400px] w-[250px] opacity-70 sm:w-[300px] lg:w-[350px]">
          <Image
            src="/images/propertycard/beach-gray.png"
            alt="Decorative beach image"
            width={400}
            height={400}
            className="h-full w-full select-none object-contain object-left"
            priority
          />
        </div>
      </div>

      {/* Main content container */}
      <div className="container relative z-10 mx-auto">
        {/* Header row: title (left) | controls (right) */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-6">
          {/* Left: Section title */}
          <h2 className="font-figtree text-[22px] font-bold leading-[100%] text-[#222222] sm:text-[26px] lg:text-[30px]">
            {title}
          </h2>

          {/* Right: media icons + secondary action (link or dropdown) */}
          <div className="flex flex-wrap items-center gap-[16px]">
            {/* Media display toggle section – ALWAYS visible */}
            <div className="flex flex-wrap items-center justify-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="whitespace-nowrap font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              {/* Media icons */}
              <div className="flex items-center gap-[10px]">
                {/* Photo */}
                <button
                  type="button"
                  onClick={() => console.log('photo clicked')}
                >
                  <Image
                    src="/images/beachmedia/photo.png"
                    alt="photo"
                    width={24}
                    height={24}
                  />
                </button>

                <div className="h-[25px] w-[1px] bg-[#ffffff]" />

                {/* Video */}
                <button
                  type="button"
                  onClick={() => console.log('video clicked')}
                >
                  <Image
                    src="/images/beachmedia/video-icon-white.png"
                    alt="video"
                    width={24}
                    height={24}
                  />
                </button>

                <div className="h-[25px] w-[1px] bg-[#ffffff]" />

                {/* 360° view */}
                <button
                  type="button"
                  onClick={() => console.log('360 clicked')}
                >
                  <Image
                    src="/images/beachmedia/360-degree-white.png"
                    alt="360 view"
                    width={24}
                    height={24}
                  />
                </button>

                <div className="h-[25px] w-[1px] bg-[#ffffff]" />

                {/* Live cam */}
                <button
                  type="button"
                  onClick={() => console.log('live cam clicked')}
                >
                  <Image
                    src="/images/beachmedia/play-button-arrowhead-white.png"
                    alt="live cam"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>

            {/* Secondary action: default link OR custom headerRight */}
            {headerRight ?? (
              <a
                href="#"
                className="flex items-center gap-1 font-figtree text-[14px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555]"
              >
                {t('allBeachesLink', { count: totalCount })}
                <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Property cards grid (responsive, 1–4 per row) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertySection;

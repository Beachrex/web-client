'use client';
import { useBeaches } from '@/hooks/useBeaches';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import PropertyCard from './PropertyCard/PropertyCard';

interface Property {
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
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  totalCount = 124,
}) => {
  const t = useTranslations('PropertySection');
  const { beaches } = useBeaches();

  console.table(
    beaches.slice(0, 5).map((b) => ({
      id: b.id,
      name: b.name,
      mainImage: b.mainImage,
    })),
  );

  return (
    <section className="relative overflow-x-hidden bg-white py-10 sm:py-14 lg:py-20">
      {/* Background image - fixed to left edge */}
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

      <div className="container relative z-10 mx-auto">
        {/* Header row: title left | beaches display + link right */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-6">
          {/* Left: Title */}
          <h2 className="font-figtree text-[22px] font-bold leading-[100%] text-[#222222] sm:text-[26px] lg:text-[30px]">
            {title}
          </h2>

          {/* Right side: Beaches display + all beaches link */}
          <div className="flex flex-wrap items-center gap-[16px]">
            {/* Beaches display container */}
            <div className="flex h-[40px] flex-wrap items-center justify-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="whitespace-nowrap font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              {/* Icons */}
              <div className="flex items-center gap-[10px]">
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

            {/* All beaches link */}
            <a
              href="#"
              className="font-figtree text-[13px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555] sm:text-[14px]"
            >
              {t('allBeachesLink', { count: totalCount })}
            </a>
          </div>
        </div>
        {/* Property cards grid - 4 per row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {beaches.map((b) => (
            <PropertyCard key={b.id} beachtitle={b.name} />
          ))}
        </div>
      </div>
    </section>
  );
};

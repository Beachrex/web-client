'use client';

import { Carousel } from 'flowbite-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropertyCard from './PropertyCard/PropertyCard';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

interface PropertyCarouselProps {
  items: Property[];
}

function PropertyFlowbiteCarousel({ items = [] }: PropertyCarouselProps) {
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  // Update itemsPerSlide on resize based on Tailwind breakpoints
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= 1536) setItemsPerSlide(4); // 2xl: 4 cards
      else if (w >= 1280) setItemsPerSlide(3); // xl: 3 cards
      else if (w >= 640) setItemsPerSlide(2); // sm/md/lg: 2 cards
      else setItemsPerSlide(1); // base: 1 card
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Chunk items into slides based on itemsPerSlide
  const slides = useMemo(() => {
    const chunks: Property[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunks.push(items.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [items, itemsPerSlide]);

  // Dynamic height measurement so all slides share the same height
  const measurementRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>();

  useEffect(() => {
    if (!measurementRef.current) return;

    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height;
      if (h) setMeasuredHeight(Math.ceil(h));
    });

    ro.observe(measurementRef.current);
    return () => ro.disconnect();
  }, [slides.length]);

  // Prevent dragging/swiping the outer Flowbite carousel.
  // We want navigation between slides ONLY via controls (arrows/indicators),
  // not via touch drag on the cards themselves.
  const stopOuterSwipe = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  if (!items.length) return null;

  return (
    <div>
      {/* Hidden measurer for consistent card height */}
      <div className="invisible absolute left-0 top-0 -z-10 w-full">
        <div ref={measurementRef}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {(slides[0] ?? []).map((card, i) => (
              <PropertyCard key={`measure_${i}`} {...card} />
            ))}
          </div>
        </div>
      </div>

      {/* Main carousel wrapper */}
      <div style={{ height: measuredHeight ? `${measuredHeight}px` : undefined }}>
        <Carousel
          indicators={false}
          slide={false} // static; no auto sliding
          className="h-full"
        >
          {slides.map((chunk, idx) => (
            <div
              key={idx}
              className="h-full px-0"
              // Stop drag / swipe events on the slides so the outer carousel
              // does not move when the user drags over the cards.
              onTouchStart={stopOuterSwipe}
              onTouchMove={stopOuterSwipe}
              onTouchEnd={stopOuterSwipe}
              onMouseDown={stopOuterSwipe}
              onMouseMove={stopOuterSwipe}
              onMouseUp={stopOuterSwipe}
            >
              <div className="grid h-full grid-cols-1 content-center gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {chunk.map((card, i) => (
                  <PropertyCard key={`${idx}_${i}`} {...card} />
                ))}
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

// ---------- PropertySection component (ostane skoraj isto) ----------

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

        {/* Property cards carousel / or empty state */}
        {properties.length === 0 ? (
          <p className="font-figtree text-[14px] text-[#8D8D8D]">
            {t('noBeachesLabel')}
          </p>
        ) : (
          <PropertyFlowbiteCarousel items={properties} />
        )}
      </div>
    </section>
  );
};

export default PropertySection;

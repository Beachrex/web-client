'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight as ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import PropertyCard from './PropertyCard/PropertyCard';

// Property type
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
  countryCode?: string;
}

interface PropertySectionProps {
  title: string;
  totalCount?: number;
  properties: Property[];
  headerRight?: React.ReactNode;
}

interface PropertyCarouselProps {
  items: Property[];
}

/* -----------------------------------------------------
   EMBLA CAROUSEL (NO DRAGGING) — 100% FLOWBITE UI MATCH
------------------------------------------------------- */
function PropertyEmblaCarousel({ items = [] }: PropertyCarouselProps) {
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  // Responsive: number of cards per slide
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1536) setItemsPerSlide(4);
      else if (w >= 1280) setItemsPerSlide(3);
      else if (w >= 640) setItemsPerSlide(2);
      else setItemsPerSlide(1);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Group cards into slides
  const slides = useMemo(() => {
    const chunks: Property[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunks.push(items.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [items, itemsPerSlide]);

  const [emblaRef, embla] = useEmblaCarousel({
  dragFree: false,   // optional
  loop: false,
  watchDrag: false,  // 🔥 KLJUČNO! Onemogoči analiziranje draga
});


  const scrollPrev = () => embla?.scrollPrev();
  const scrollNext = () => embla?.scrollNext();

  if (!items.length) return null;

  return (
    <div className="relative">

      {/* VIEWPORT */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((chunk, idx) => (
            <div key={idx} className="embla__slide flex-shrink-0 w-full px-1">

              <div className="grid grid-cols-1 h-full gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {chunk.map((card, i) => (
                  <PropertyCard key={`${idx}_${i}`} {...card} />
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* LEFT ARROW */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <ChevronLeft size={24} />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}

/* -----------------------------------------------------
   PROPERTY SECTION COMPONENT
------------------------------------------------------- */
export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  totalCount = 124,
  properties,
  headerRight,
}) => {
  const t = useTranslations('PropertySection');

  return (
    <section className="relative overflow-x-hidden bg-white py-10 sm:py-14 lg:py-20">

      {/* Decorative background image */}
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

      {/* Main container */}
      <div className="container relative z-10 mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-6">

          {/* Title */}
          <h2 className="font-figtree text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#222222]">
            {title}
          </h2>

          {/* Right side icons */}
          <div className="flex flex-wrap items-center gap-[16px]">

            {/* Display mode icons */}
            <div className="flex items-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              <div className="flex items-center gap-[10px]">
                <button><Image
src="/images/beachmedia/photo.png" width={24} height={24}
alt="photo"
                        /></button>
                <div className="h-[25px] w-[1px] bg-white" />
                <button><Image
src="/images/beachmedia/video-icon-white.png" width={24} height={24}
alt="video"
                        /></button>
                <div className="h-[25px] w-[1px] bg-white" />
                <button><Image
src="/images/beachmedia/360-degree-white.png" width={24} height={24}
alt="360"
                        /></button>
                <div className="h-[25px] w-[1px] bg-white" />
                <button><Image
src="/images/beachmedia/play-button-arrowhead-white.png" width={24} height={24}
alt="live cam"
                        /></button>
              </div>
            </div>

            {/* Right link */}
            {headerRight ?? (
              <a
                href="#"
                className="flex items-center gap-1 font-figtree text-[14px] font-bold text-[#8D8D8D] underline hover:text-[#555]"
              >
                {t('allBeachesLink', { count: totalCount })}
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Carousel or empty state */}
        {properties.length === 0 ? (
          <p className="font-figtree text-[14px] text-[#8D8D8D]">
            {t('noBeachesLabel')}
          </p>
        ) : (
          <PropertyEmblaCarousel items={properties} />
        )}
      </div>
    </section>
  );
};

export default PropertySection;

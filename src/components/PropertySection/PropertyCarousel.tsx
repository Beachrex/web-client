'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo } from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';
import type { Property } from '../PropertySection';

interface PropertyCarouselProps {
  items: Property[];
  itemsPerSlide: number;
}

/**
 * Property Carousel component using Embla
 * This component is dynamically imported to reduce initial bundle size
 */
export const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  items,
  itemsPerSlide,
}) => {
  const c = useTranslations('Common');
  const slides = useMemo(() => {
    const chunks: Property[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunks.push(items.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [items, itemsPerSlide]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: false,
    loop: true, // Enable infinite loop
    watchDrag: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((chunk, idx) => (
            <div key={idx} className="embla__slide flex-shrink-0 w-full px-1">
              {/* Columns follow itemsPerSlide (owner, 2026-10-30). The old `lg:grid-cols-3 2xl:grid-cols-4`
                  followed the window: in the 720px beach panel on the map a card got a quarter of the width,
                  and between 1024 and 1279px a slide of 2 cards left an empty third column. */}
              <div
                className="grid h-full gap-6"
                style={{ gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))` }}
              >
                {chunk.map((card, i) => (
                  <PropertyCard key={`${idx}_${i}`} {...card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARROWS: only when there is more than one slide (one card showed both arrows over it). */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label={c('paginationPrevious')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            aria-label={c('paginationNext')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
};

export default PropertyCarousel;


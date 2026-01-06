'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
              <div className="grid grid-cols-1 h-full gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {chunk.map((card, i) => (
                  <PropertyCard key={`${idx}_${i}`} {...card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARROWS */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default PropertyCarousel;


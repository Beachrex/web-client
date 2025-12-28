'use client';

import { Carousel } from 'flowbite-react';
import React, { useEffect, useMemo, useState } from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';
import type { Property } from '../PropertySection';

interface PropertyCarouselProps {
  items: Property[];
  itemsPerSlide: number;
}

/**
 * Property Carousel component using Flowbite Carousel
 * - Mobile: Swipe behavior with hidden controls
 * - Desktop: Hover controls and indicators
 */
export const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  items,
  itemsPerSlide,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const slides = useMemo(() => {
    const chunks: Property[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunks.push(items.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [items, itemsPerSlide]);

  if (!items.length) return null;

  return (
    <div className="relative w-full h-[450px]">
      <Carousel
        indicators={slides.length > 1}
        slide={false}
        pauseOnHover={isMobile}
        className="h-full"
        leftControl={isMobile ? <></> : undefined}
        rightControl={isMobile ? <></> : undefined}
      >
        {slides.map((chunk, idx) => (
          <div key={idx} className="w-full px-1">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {chunk.map((card, i) => (
                <PropertyCard key={`${idx}_${i}`} {...card} />
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default PropertyCarousel;

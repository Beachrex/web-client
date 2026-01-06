'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

interface EmblaCarouselProps {
  images: string[];
  title: string;
}

/**
 * Embla Carousel component for PropertyCard
 * Used for both mobile and desktop views
 * This component is dynamically imported to reduce initial bundle size
 */
export const EmblaCarousel: React.FC<EmblaCarouselProps> = ({ images, title }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!images.length) return null;

  return (
    <div className="h-full w-full relative">
      <div className="embla h-full overflow-hidden">
        <div className="embla__viewport h-full" ref={emblaRef}>
          <div className="embla__container flex h-full touch-pan-y">
            {images.map((img, idx) => (
              <div key={idx} className="embla__slide relative min-w-full h-full">
                <Image
                  src={img}
                  alt={`${title} - Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 pointer-events-auto z-50">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shadow transition cursor-pointer ${
                idx === selectedIndex
                  ? 'bg-white'
                  : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmblaCarousel;


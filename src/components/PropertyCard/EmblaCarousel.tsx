'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React from 'react';

interface EmblaCarouselProps {
  images: string[];
  title: string;
}

/**
 * Embla Carousel component for PropertyCard mobile view
 * This component is dynamically imported to reduce initial bundle size
 */
export const EmblaCarousel: React.FC<EmblaCarouselProps> = ({ images, title }) => {
  const [emblaRef] = useEmblaCarousel({ loop: false });

  return (
    <div className="embla h-full overflow-hidden">
      <div className="embla__viewport h-full" ref={emblaRef}>
        <div className="embla__container flex h-full touch-pan-y">
          {images.map((img, idx) => (
            <div key={idx} className="embla__slide relative min-w-full h-full">
              <Image
                src={img}
                alt={title}
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
  );
};

export default EmblaCarousel;


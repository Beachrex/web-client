'use client';

import { Carousel, type CustomFlowbiteTheme } from 'flowbite-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PropertyCarouselProps {
  images: string[];
  title: string;
  carouselTheme?: CustomFlowbiteTheme['carousel'];
}

/**
 * Unified Carousel component that works for both mobile and desktop
 * - Mobile: Uses Embla-style behavior (swipe, hidden controls, visible indicators)
 * - Desktop: Uses Flowbite default (hover controls, indicators)
 */
export function PropertyCardCarousel({ images, title, carouselTheme }: PropertyCarouselProps) {
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

  if (!images.length) return null;

  return (
    <div className="h-full">
      <Carousel
        indicators={images.length > 1}
        slide={false}
        pauseOnHover={isMobile}
        theme={carouselTheme}
        className="h-full"
        leftControl={<></>}
        rightControl={<></>}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative h-full w-full">
            <Image
              src={img}
              alt={`${title} - Image ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading={idx === 0 ? 'eager' : 'lazy'}
              priority={idx === 0}
              quality={idx === 0 ? 85 : 75}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

'use client';

import { Carousel } from 'flowbite-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import AccommodationCard, {
  type AccommodationCardProps,
} from './AccommodationCard';

interface Props {
  items: AccommodationCardProps[];
}

export default function AccommodationFlowbiteCarousel({ items = [] }: Props) {
  // Dynamically calculate number of cards per slide based on viewport width
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= 1536)
        setItemsPerSlide(4); // 2xl: 4
      else if (w >= 1280)
        setItemsPerSlide(3); // xl: 3
      else if (w >= 640)
        setItemsPerSlide(2); // sm/md/lg: 2
      else setItemsPerSlide(1); // base: 1
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Split items into chunks per slide
  const slides = useMemo(() => {
    const chunks: AccommodationCardProps[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunks.push(items.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [items, itemsPerSlide]);

  // Measure height of one slide dynamically (no fixed height)
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

  return (
    <div>
      {/* Invisible measurer ensures the carousel has correct dynamic height */}
      <div className="invisible absolute left-0 top-0 -z-10 w-full">
        <div ref={measurementRef}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {(slides[0] ?? []).map((card, i) => (
              <AccommodationCard key={`measure_${i}`} {...card} />
            ))}
          </div>
        </div>
      </div>

      {/* Main carousel */}
      <div
        style={{ height: measuredHeight ? `${measuredHeight}px` : undefined }}
      >
        <Carousel
          indicators={false} // ⬅️ no dots at the bottom
          slide={false} // disable automatic sliding
          className="h-full" // stretch to measured height
          leftControl={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
              <HiChevronLeft className="h-5 w-5 text-gray-600" />
            </div>
          }
          rightControl={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
              <HiChevronRight className="h-5 w-5 text-gray-600" />
            </div>
          }
        >
          {slides.map((chunk, idx) => (
            <div key={idx} className="h-full px-0">
              <div className="grid h-full grid-cols-1 content-center gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {chunk.map((card, i) => (
                  <AccommodationCard key={`${idx}_${i}`} {...card} />
                ))}
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}

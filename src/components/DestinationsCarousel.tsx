'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { Carousel } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import DestinationCard from './DestinationCard';

interface DestinationsCarouselProps {
  items: Country[];
  title: string;
  countLabel?: string; // e.g. "Vse države (69)"
  badgeLabel?: string;
}

export default function DestinationsCarousel({
  items,
  title,
  countLabel,
  badgeLabel,
}: DestinationsCarouselProps) {
  // Keep slides to one row across breakpoints by matching itemsPerSlide to the grid cols
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  useEffect(() => {
    // Match Tailwind's default breakpoints
    const onResize = () => {
      const w = window.innerWidth;
      if (w >= 1280)
        setItemsPerSlide(5); // xl
      else if (w >= 1024)
        setItemsPerSlide(3); // lg
      else if (w >= 640)
        setItemsPerSlide(2); // sm
      else setItemsPerSlide(1); // base
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Chunk items based on the current itemsPerSlide
  const slides: Country[][] = [];
  for (let i = 0; i < items.length; i += itemsPerSlide) {
    slides.push(items.slice(i, i + itemsPerSlide));
  }

  return (
    <section className="bg-[#F5F5F5] py-12">
      <div className="container mx-auto">
        {/* Title row */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold text-[#0A2342] sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {countLabel && (
            <a
              href="#"
              className="text-sm font-medium text-[#0A2342] hover:underline"
            >
              {countLabel}
            </a>
          )}
        </div>

        {/* Flowbite Carousel needs an explicit height to render slides */}
        <div className="h-[340px] lg:h-[350px]">
          <Carousel
            className="h-full pb-8 [&>div>div>div:last-child]:!bottom-[-30px]"
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
            indicators
            slide={false}
          >
            {slides.map((chunk, i) => (
              <div key={i} className="h-full px-0">
                {/* Grid aligned with itemsPerSlide: 1/2/3/5 */}
                <div className="grid h-full grid-cols-1 content-center gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
                  {chunk.map((c) => (
                    <DestinationCard
                      key={c.code}
                      country={c}
                      badgeLabel={badgeLabel}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Carousel, type CustomFlowbiteTheme } from 'flowbite-react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// Swiper imports (mobile only)
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Props from API → PropertySection
export interface PropertyCardProps {
  image: string;            // main_image
  title: string;            // beach name
  location: string;         // city or region
  price: number;            // random for now
  rating: number;           // random for now
  reviews: number;          // random number
}

// Flowbite custom theme
const carouselTheme: CustomFlowbiteTheme['carousel'] = {
  indicators: {
    wrapper:
      'absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 pointer-events-auto z-50',
    base: 'h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/50 data-[active=true]:bg-white shadow cursor-pointer transition',
  },
};

export default function PropertyCard({
  image,
  title,
  location,
  price,
  rating,
}: PropertyCardProps) {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stopSwipePropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex h-[395px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg">

      {/* ---------- TOP IMAGE AREA ---------- */}
      <div className="relative grow overflow-hidden">

        {/* MOBILE SWIPER (only 1 image for now — no gallery yet) */}
        {isMobile ? (
          <div
            className="h-full"
            onTouchStart={stopSwipePropagation}
            onTouchMove={stopSwipePropagation}
            onTouchEnd={stopSwipePropagation}
            onMouseDown={stopSwipePropagation}
            onMouseMove={stopSwipePropagation}
            onMouseUp={stopSwipePropagation}
          >
            <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="h-full">
              <SwiperSlide>
                <div className="relative h-full w-full">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        ) : (
          /* DESKTOP FLOWBITE CAROUSEL */
          <Carousel
            theme={carouselTheme}
            indicators
            slide={false}
            leftControl={<></>}
            rightControl={<></>}
            className="h-full"
          >
            <div className="relative h-full w-full">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </Carousel>
        )}

        {/* ---------- TOP LEFT BADGES ---------- */}
        <div className="absolute left-2 top-2 flex gap-1">

          {/* Badge: Most visited */}
          <div className="flex items-center rounded-[12px] bg-white px-[8px] py-[2px]">
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              Most visited
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 rounded-[12px] bg-[#F5F5F5] px-[8px] py-[2px]">
            <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              {Number(rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>

        {/* ---------- TOP RIGHT HEART ---------- */}
        <div className="absolute right-2 top-2">
          <Heart size={22} className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]" />
        </div>

        {/* ---------- BOTTOM OVERLAY ---------- */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between">

          {/* Price tag */}
          <div className="pointer-events-auto flex h-[40px] items-center gap-1 rounded bg-[#008260] px-3 text-white">
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
              width={16}
              height={16}
            />
            <span className="text-[12px] font-medium">from {price} €</span>
          </div>

          {/* Location tag */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px]">
              <span className="text-[12px] font-bold text-white">
                {location}
              </span>
            </div>

            {/* Country flag placeholder (no API yet) */}
            <div className="h-[47px] w-[40px] overflow-hidden rounded-[6px] shadow-sm">
              <Image
                src="/images/propertycard/croatia-icon.png"
                alt="flag"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM INFO SECTION ---------- */}
      <div className="flex shrink-0 flex-col gap-[2px] rounded-b-[10px] bg-[#E5F2FB] px-4 py-3 lg:px-5 lg:py-4">

        {/* Title + location icon */}
        <div className="flex items-center justify-between">
          <h3 className="font-figtree text-[20px] font-bold tracking-tight text-[#0069AB]">
            {title}
          </h3>
          <div className="pr-[2px]">
            <Image
              src="/images/propertycard/location.png"
              alt="location icon"
              width={32}
              height={32}
            />
          </div>
        </div>

        {/* Small features (KEEP MOCK FOR NOW) */}
        <div className="flex items-center justify-between gap-x-4">
          <p className="flex-1 text-[12px] font-medium leading-[1.2rem] tracking-tight text-[#4D4D4D]">
            Sup • Diving • Windsurfing • Coffee • <span className="font-bold">Crowded</span>
          </p>

          <div className="flex shrink-0 gap-5 pr-[2px]">
            <Image
src="/images/propertycard/stones.png" alt="stones" width={26}
height={26} />
            <Image
src="/images/propertycard/family.png" alt="family" width={26}
height={26} />
            <Image
src="/images/propertycard/parking.png" alt="parking" width={26}
height={26} />
          </div>
        </div>
      </div>
    </div>
  );
}

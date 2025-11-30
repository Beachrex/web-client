'use client';

import { Carousel, type CustomFlowbiteTheme } from 'flowbite-react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// Swiper imports for mobile touch slider
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Flowbite custom theme for desktop indicator styling
const carouselTheme: CustomFlowbiteTheme['carousel'] = {
  indicators: {
    wrapper:
      'absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 pointer-events-auto z-50',
    base: 'h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/50 data-[active=true]:bg-white shadow cursor-pointer transition',
  },
};

// Temporary demo images (replace with dynamic CDN URLs later)
const cardImages = [
  '/images/propertycard/card-banner.jpg',
  '/images/banner/region-banner.jpg',
  '/images/propertycard/card-banner.jpg',
];

export function PropertyCard() {
  // Detect whether user is on a mobile device (< 640px)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Update mobile state on mount + on resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Stops swipe/touch/mouse events from bubbling up to the outer carousel.
   * This ensures that swiping inside the Swiper carousel does NOT trigger
   * the outer Flowbite carousel slide movement.
   */
  const stopSwipePropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex h-[395px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg">
      {/* ---------- TOP BANNER: IMAGE CAROUSEL AREA ---------- */}
      <div className="relative grow">
        {/* ----- MOBILE VERSION: SWIPER (touch-enabled slider) ----- */}
        {isMobile ? (
          <div
            className="h-full"
            // Prevent touch/drag events from affecting outer carousel
            onTouchStart={stopSwipePropagation}
            onTouchMove={stopSwipePropagation}
            onTouchEnd={stopSwipePropagation}
            onMouseDown={stopSwipePropagation}
            onMouseMove={stopSwipePropagation}
            onMouseUp={stopSwipePropagation}
          >
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="h-full"
            >
              {cardImages.map((src, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative h-full">
                    <Image
                      src={src}
                      alt={`Slide ${idx + 1}`}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          /* ----- DESKTOP/TABLET VERSION: FLOWBITE CAROUSEL ----- */
          <Carousel
            theme={carouselTheme}
            indicators
            slide={false}
            leftControl={<></>} // Hide arrows
            rightControl={<></>} // Hide arrows
            className="h-full"
          >
            {cardImages.map((src, idx) => (
              <div key={idx} className="relative h-full">
                <Image
                  src={src}
                  alt={`Slide ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))}
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

          {/* Badge: Rating */}
          <div className="flex items-center gap-1 rounded-[12px] bg-[#F5F5F5] px-[8px] py-[2px]">
            <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              4.9
            </span>
          </div>
        </div>

        {/* ---------- TOP RIGHT HEART ICON ---------- */}
        <div className="absolute right-2 top-2">
          <Heart
            size={22}
            className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* ---------- BOTTOM OVERLAY TAGS ---------- */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {/* Price tag */}
          <div className="pointer-events-auto flex h-[40px] items-center gap-1 rounded bg-[#008260] px-3 text-white">
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
              width={16}
              height={16}
            />
            <span className="text-[12px] font-medium">from 25 €</span>
          </div>

          {/* Orange location tag + flag */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px]">
              <span className="text-[12px] font-bold text-white">Baška</span>
            </div>
            <div className="h-[47px] w-[40px] overflow-hidden rounded-[6px] shadow-sm">
              <Image
                src="/images/propertycard/croatia-icon.png"
                alt="Croatia flag"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM INFORMATION SECTION ---------- */}
      <div className="flex shrink-0 flex-col gap-[2px] rounded-b-[10px] bg-[#E5F2FB] px-4 py-3 lg:px-5 lg:py-4">
        {/* Title + Location icon */}
        <div className="flex items-center justify-between">
          <h3 className="font-figtree text-[20px] font-bold tracking-tight text-[#0069AB]">
            Plaza Ladinka
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

        {/* Features and icons */}
        <div className="flex items-center justify-between gap-x-4">
          <p className="flex-1 text-[12px] font-medium leading-[1.2rem] tracking-tight text-[#4D4D4D]">
            Sup <span className="mx-[2px]">•</span> Diving
            <span className="mx-[2px]">•</span> Windsurfing
            <span className="mx-[2px]">•</span> Coffee
            <span className="mx-[2px]">•</span>
            <span className="font-bold">Crowded</span>
          </p>

          <div className="flex shrink-0 gap-5 pr-[2px]">
            <Image
              src="/images/propertycard/stones.png"
              alt="stones icon"
              width={26}
              height={26}
            />
            <Image
              src="/images/propertycard/family.png"
              alt="family icon"
              width={26}
              height={26}
            />
            <Image
              src="/images/propertycard/parking.png"
              alt="parking icon"
              width={26}
              height={26}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;

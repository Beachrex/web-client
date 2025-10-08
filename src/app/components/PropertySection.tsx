'use client';
import { Carousel } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import PropertyCard from './PropertyCard/PropertyCard';

interface Property {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: string;
  isFreeBreakfast?: boolean;
  isFreeCancellation?: boolean;
}

interface PropertySectionProps {
  title: string;
  totalCount?: number;
  properties: Property[];
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  totalCount = 124,
  properties,
}) => {
  const t = useTranslations('PropertySection');

  // Ustvarimo slide-e (5 kartic na slide)
  const createSlides = () => {
    const slides = [];
    const itemsPerSlide = 5;
    for (let i = 0; i < properties.length; i += itemsPerSlide) {
      slides.push(properties.slice(i, i + itemsPerSlide));
    }
    return slides;
  };

  const slides = createSlides();

  return (
    <section className="relative overflow-x-hidden bg-white py-10 sm:py-14 lg:py-20">
      {/* Background image - fixed to left edge */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[250px] bg-[url('/images/beach.png')] bg-contain bg-left-top bg-no-repeat opacity-10 sm:w-[300px] lg:w-[350px]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
          {/* Title */}
          <h2 className="font-figtree text-[22px] font-bold leading-[100%] text-[#222222] sm:text-[26px] lg:text-[30px]">
            {title}
          </h2>

          {/* Right link */}
          <a
            href="#"
            className="font-figtree text-[13px] font-bold leading-[100%] text-[#8D8D8D] underline underline-offset-[2px] hover:text-[#555] sm:text-[14px]"
          >
            {t('allBeachesLink', { count: totalCount })}
          </a>
        </div>

        {/* Carousel */}
        <div className="h-[430px] sm:h-[440px] lg:h-[460px]">
          <Carousel
            leftControl={
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 sm:h-10 sm:w-10">
                <HiChevronLeft className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
              </div>
            }
            rightControl={
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50 sm:h-10 sm:w-10">
                <HiChevronRight className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
              </div>
            }
            indicators={true}
            slide={false}
            className="pb-8"
          >
            {slides.map((slideProperties, slideIdx) => (
              <div key={`slide-${slideIdx}`} className="px-2 sm:px-4">
                <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8 2xl:gap-10">
                  {slideProperties.map((p) => (
                    <PropertyCard key={p.id} {...p} />
                  ))}
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

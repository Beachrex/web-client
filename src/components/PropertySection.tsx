'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
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

          {properties.map((p) => (
              <PropertyCard key={p.id} {...p} />
          ))}


      </div>
    </section>
  );
};

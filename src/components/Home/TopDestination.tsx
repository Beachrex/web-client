'use client';
import Image from 'next/image';
import React from 'react';
import { Carousel } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import { useCountries } from '@/hooks/useCountries';
import type { Country } from '@/lib/api-client/models/Country';
import type { Continent } from '@/lib/api-client/models/Continent';

interface Destination {
  nameKey: string;
  image: string;
  accomodationCount: number;
  priceKey: string;
  beachCount: number;
}

interface TopDestinationsSectionProps {
  countries?: Country[];
  continent?: Continent;
}

const TopDestinationsSection: React.FC<TopDestinationsSectionProps> = ({
  countries: propCountries,
  continent: _continent,
}) => {
  const t = useTranslations('HomePage');
  const tDestinations = useTranslations('Destinations');
  const { countries: hookCountries, loading, error } = useCountries();

  // Use prop countries if provided, otherwise fall back to hook
  const allDestinations = propCountries ?? hookCountries;

  // Create slides - each slide will show multiple cards based on screen size
  const createSlides = () => {
    const slides = [];
    const itemsPerSlide = 5; // Maximum items per slide (for XL screens)

    for (let i = 0; i < allDestinations.length; i += itemsPerSlide) {
      slides.push(allDestinations.slice(i, i + itemsPerSlide));
    }

    return slides;
  };

  const slides = createSlides();

  // Render destination card - works with both Country and Destination types
  const renderDestinationCard = (d: Country | Destination, idx: number) => {
    // Check if it's a Country object (from API) or Destination object (legacy)
    const isCountry = 'code' in d;

    const name = isCountry ? d.name : tDestinations((d as Destination).nameKey);
    const image = isCountry
      ? (d.image_path ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${d.image_path}` : '/images/spain.jpg')
      : (d as Destination).image;
    const beachCount = isCountry ? d.beaches_count : (d as Destination).beachCount;
    const accommodationCount = isCountry ? Math.floor(Math.random() * 50) + 10 : (d as Destination).accomodationCount;
    const priceText = isCountry ? tDestinations('priceFrom') : tDestinations((d as Destination).priceKey);

    return (
      <div
        key={`${name}-${idx}`}
        className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
      >
      {/* Image */}
      <div className="relative h-48 w-full sm:h-56 lg:h-48 xl:h-56">
        <Image
          src={image}
          alt={name ?? ''}
          fill
          className="object-cover"
        />

        {/* Badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0A2342] sm:text-sm">
          {t('seaExperiences')}
        </div>

        {/* Info row - Hidden on mobile, shown on larger screens */}
        <div className="absolute bottom-2 left-2 right-2 hidden gap-2 sm:flex">
          {/* Left info */}
          <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#008260] px-2 py-2 text-white">
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
              width={16}
              height={16}
            />
            <span className="text-xs font-medium">
              {accommodationCount} | {priceText}
            </span>
          </div>

          {/* Right info */}
          <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#0069AB] px-2 py-2 text-white">
            <Image
              src="/images/beach.png"
              alt="Beaches"
              width={16}
              height={16}
            />
            <span className="text-xs font-medium">
              {beachCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between bg-[#F8E2E2] p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/images/topdestination/country.png"
            alt="Country flag"
            width={24}
            height={24}
            className="sm:h-8 sm:w-8"
          />
          <span className="text-lg font-bold text-[#0A2342] sm:text-xl">{name}</span>
        </div>
        <Image
          src="/images/topdestination/icon.png"
          alt="More info"
          width={24}
          height={24}
          className="sm:h-8 sm:w-8"
        />
      </div>

      {/* Mobile info row - Shown only on mobile */}
      <div className="flex gap-2 bg-gray-50 p-3 sm:hidden">
        <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#008260] px-2 py-2 text-white">
          <Image
            src="/images/accomodation.png"
            alt="Accommodation"
            width={16}
            height={16}
          />
          <span className="text-xs font-medium">
            {accommodationCount} | {priceText}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#0069AB] px-2 py-2 text-white">
          <Image
            src="/images/beach.png"
            alt="Beaches"
            width={16}
            height={16}
          />
          <span className="text-xs font-medium">
            {t('beachesLabel2')} {beachCount}
          </span>
        </div>
      </div>
    </div>
    );
  };

  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center lg:mb-12">
          <h2 className="text-2xl font-bold text-[#0A2342] sm:text-3xl lg:text-4xl">
            {t('topDestinationsTitle')}
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-[#0A2342] hover:underline sm:text-base"
          >
            {loading ? t('loading') : t('allCountriesCount', { count: allDestinations.length })}
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="h-[350px] flex items-center justify-center">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 w-full rounded-lg mb-4" />
                  <div className="bg-gray-300 h-4 w-3/4 rounded mb-2" />
                  <div className="bg-gray-300 h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && allDestinations.length === 0 && (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading destinations: {error}</p>
              <p className="text-gray-600">Please try again later</p>
            </div>
          </div>
        )}

        {/* Flowbite Carousel */}
        {!loading && allDestinations.length > 0 && (
          <div className="h-[350px]">
            <Carousel
              leftControl={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors">
                  <HiChevronLeft className="h-5 w-5 text-gray-600" />
                </div>
              }
              rightControl={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors">
                  <HiChevronRight className="h-5 w-5 text-gray-600" />
                </div>
              }
              indicators={true}
              slide={false}
              className="pb-8"
            >
            {slides.map((slideDestinations, slideIdx) => (
              <div key={`slide-${slideIdx}`} className="px-0">
                {/* Responsive grid layout */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
                  {slideDestinations.map((dest, idx) => renderDestinationCard(dest, slideIdx * 5 + idx))}
                </div>
              </div>
            ))}
          </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopDestinationsSection;

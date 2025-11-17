'use client';

import type { Country } from '@/lib/api-client/types.gen';
import { Pagination } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';

interface RegionSearchBeachesProps {
  countries?: Country[];
  regionName: string;
}

const RegionSearchBeaches: React.FC<RegionSearchBeachesProps> = ({
  countries = [],
  regionName,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Transform countries to property format for display
  const allProperties =
    countries.length > 0
      ? countries.map((country) => ({
          id: country.code,
          image: country.image_path
            ? `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}${country.image_path}`
            : '/images/spain.jpg',
          title: country.full_name ?? country.name,
          location: `${country.name}, ${regionName}`,
          price: Math.floor(Math.random() * 200) + 50,
          originalPrice: Math.floor(Math.random() * 100) + 200,
          rating: 4.0 + Math.random() * 0.9,
          reviews: Math.floor(Math.random() * 300) + 50,
          discount: Math.floor(Math.random() * 25) + 10,
          isFreeBreakfast: Math.random() > 0.5,
          isFreeCancellation: Math.random() > 0.3,
          beaches_count: country.beaches_count,
        }))
      : Array.from({ length: 16 }, (_, i) => ({ id: i + 1 }));

  const itemsPerPage = 16;
  const totalPages = Math.ceil(allProperties.length / itemsPerPage);

  const paginatedProperties = allProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const t = useTranslations('RegionPage');

  return (
    <section className="relative bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Title */}
          <h2 className="text-left font-figtree text-[26px] font-bold leading-[100%] text-[#222222] sm:text-[28px] lg:text-[30px]">
            {t('browseBeachesTitle', { region: regionName })}
          </h2>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start lg:justify-end lg:gap-4">
            {/* Filter button (pink) */}
            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#FF2877] px-5 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#e02269]">
              <Image
                src="/images/filters.png"
                alt="Filter icon"
                width={20}
                height={20}
              />
              <span>{t('filterButton')}</span>
            </button>

            {/* Map button */}
            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78]">
              <Image
                src="/images/map.png"
                alt="Map icon"
                width={20}
                height={20}
              />
              <span>{t('mapButton')}</span>
            </button>

            {/* Display selector */}
            <div className="flex h-[40px] flex-wrap items-center justify-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="whitespace-nowrap font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              <div className="flex items-center gap-[10px]">
                <button>
                  <Image
                    src="/images/beachmedia/photo.png"
                    alt="photo"
                    width={24}
                    height={24}
                  />
                </button>
                <div className="h-[25px] w-[1px] bg-white" />
                <button>
                  <Image
                    src="/images/beachmedia/video-icon-white.png"
                    alt="video"
                    width={24}
                    height={24}
                  />
                </button>
                <div className="h-[25px] w-[1px] bg-white" />
                <button>
                  <Image
                    src="/images/beachmedia/360-degree-white.png"
                    alt="360"
                    width={24}
                    height={24}
                  />
                </button>
                <div className="h-[25px] w-[1px] bg-white" />
                <button>
                  <Image
                    src="/images/beachmedia/play-button-arrowhead-white.png"
                    alt="live"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>

            {/* Sort */}
            <select className="rounded-md border border-gray-300 bg-white px-4 py-2 font-figtree text-[14px] font-semibold text-[#4D4D4D]">
              <option>{t('sortPopular')}</option>
              <option>{t('sortNewest')}</option>
              <option>{t('sortTopRated')}</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProperties.map((p) => (
            <PropertyCard key={p.id} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            showIcons
          />
        </div>
      </div>
    </section>
  );
};

export default RegionSearchBeaches;

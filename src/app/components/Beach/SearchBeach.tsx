'use client';
import { Pagination } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react';
import PropertyCard from '../PropertyCard/PropertyCard';

const SearchBeach: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Testno: 50 kartic
  const allProperties = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
  }));

  const itemsPerPage = 16; // 4x4 grid
  const totalPages = Math.ceil(allProperties.length / itemsPerPage);

  const paginatedProperties = allProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const t = useTranslations('SearchBeach');

  return (
    <section className="relative bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Levi naslov */}
          <h2 className="text-left font-figtree text-[26px] font-bold leading-[100%] text-[#222222] sm:text-[28px] lg:text-[30px]">
            {t('title')}
          </h2>

          {/* Desni kontrolni del */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start lg:justify-end lg:gap-4">
            {/* Filter gumb */}
            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#5E1CA5] px-5 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#4b1489]">
              <Image
                src="/images/filters.png"
                alt="Filter icon"
                width={20}
                height={20}
              />
              <span>{t('filterButton')}</span>
            </button>

            {/* Zemljevid gumb */}
            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78]">
              <Image
                src="/images/map.png"
                alt="Map icon"
                width={20}
                height={20}
              />
              <span>{t('mapButton')}</span>
            </button>

            {/* Prikaz plaže container */}
            <div className="flex flex-wrap items-center justify-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="whitespace-nowrap font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>
              {/* Ikone */}
              <div className="flex items-center gap-[10px]">
                <Image
                  src="/images/beachmedia/photo.png"
                  alt="photo"
                  width={24}
                  height={24}
                />
                <div className="h-[25px] w-[1px] rotate-[-90deg] bg-[#4D4D4D]" />
                <Image
                  src="/images/beachmedia/video-icon.png"
                  alt="video"
                  width={24}
                  height={24}
                />
                <div className="h-[25px] w-[1px] rotate-[-90deg] bg-[#4D4D4D]" />
                <Image
                  src="/images/beachmedia/360-degree.png"
                  alt="360 view"
                  width={24}
                  height={24}
                />
                <div className="h-[25px] w-[1px] rotate-[-90deg] bg-[#4D4D4D]" />
                <Image
                  src="/images/beachmedia/play-button-arrowhead.png"
                  alt="live cam"
                  width={24}
                  height={24}
                />
              </div>
            </div>

            {/* Dropdown sort */}
            <select className="rounded-md border border-gray-300 bg-white px-4 py-2 font-figtree text-[14px] font-semibold text-[#4D4D4D] focus:outline-none focus:ring-2 focus:ring-[#5E1CA5]">
              <option>{t('sortPopular')}</option>
              <option>{t('sortNewest')}</option>
              <option>{t('sortTopRated')}</option>
            </select>
          </div>
        </div>

        {/* GRID kartic */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProperties.map((p) => (
            <PropertyCard key={p.id} />
          ))}
        </div>

        {/* PAGINATION */}
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            showIcons
            previousLabel={t('prevPage')}
            nextLabel={t('nextPage')}
            className="[&_li>a]:!rounded-md [&_li>a]:!bg-white [&_li>a]:!shadow [&_li>a]:hover:!bg-gray-100 [&_ul]:gap-1"
          />
        </div>
      </div>
    </section>
  );
};

export default SearchBeach;

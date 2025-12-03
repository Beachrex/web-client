'use client';

import { Pagination } from 'flowbite-react';
import { useTranslations, type TranslationValues } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { useAllBeaches } from '@/hooks/useBeaches';
import { buildCdnUrl } from '@/lib/utils/beach-images';

import type { PropertyCardProps } from './PropertyCard/PropertyCard';
import PropertyCard from './PropertyCard/PropertyCard';

interface DynamicSearchBeachesProps {
  translationNamespace: string;
  titleKey: string;
  titleParams?: TranslationValues;
  filterButtonColor: string;

  filters: Record<string, string | number | boolean | undefined>;
}

export default function DynamicSearchBeaches({
  translationNamespace,
  titleKey,
  titleParams,
  filterButtonColor,
  filters,
}: DynamicSearchBeachesProps) {
  const t = useTranslations(translationNamespace);

  // Fetch real beaches from API
  const { beaches, loading } = useAllBeaches(filters, true);

  // Pagination
  const itemsPerPage = 16;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(beaches.length / itemsPerPage);
  const paginatedBeaches = beaches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Transform beaches → PropertyCardProps
  const properties: PropertyCardProps[] = paginatedBeaches.map((b) => {
    const image = buildCdnUrl(b.main_image, 'list');
    if (!image) throw new Error(`Missing main_image for beach ${b.id}`);

    return {
      image,
      title: b.name ?? 'Unknown beach',
      location: b.city_slug ?? '',
      price: 0,
      rating: 0,
      reviews: 0,
    };
  });

  return (
    <section className="relative bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-left font-figtree text-[26px] font-bold leading-[100%] text-[#222] sm:text-[28px] lg:text-[30px]">
            {t(titleKey, titleParams)}
          </h2>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end lg:gap-4">
            <button
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md px-5 font-figtree text-[14px] font-bold text-white transition-colors"
              style={{ backgroundColor: filterButtonColor }}
            >
              <Image
src="/images/filters.png" alt="Filter icon" width={20}
height={20}
              />
              <span>{t('filterButton')}</span>
            </button>

            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-[14px] font-bold text-white hover:bg-[#2a4c78]">
              <Image
src="/images/map.png" alt="Map icon" width={20}
height={20}
              />
              <span>{t('mapButton')}</span>
            </button>

            {/* Display selector */}
            <div className="flex h-[40px] items-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              <div className="flex items-center gap-[10px]">
                <Image
src="/images/beachmedia/photo.png" width={24} height={24}
alt="photo"
                />
                <div className="h-[25px] w-[1px] bg-white" />
                <Image
src="/images/beachmedia/video-icon-white.png" width={24} height={24}
alt="video"
                />
                <div className="h-[25px] w-[1px] bg-white" />
                <Image
src="/images/beachmedia/360-degree-white.png" width={24} height={24}
alt="360"
                />
                <div className="h-[25px] w-[1px] bg-white" />
                <Image
src="/images/beachmedia/play-button-arrowhead-white.png" width={24} height={24}
alt="live cam"
                />
              </div>
            </div>

            <select className="rounded-md border border-gray-300 bg-white px-4 py-2 font-figtree text-[14px] font-semibold text-[#4D4D4D]">
              <option>{t('sortPopular')}</option>
              <option>{t('sortNewest')}</option>
              <option>{t('sortTopRated')}</option>
            </select>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && <p>Loading beaches…</p>}

          {!loading &&
            properties.map((p, i) => <PropertyCard key={`${p.title}-${i}`} {...p} />)}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      </div>
    </section>
  );
}

'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import type { Continent } from '@/lib/api-client/models/Continent';

interface SearchContinentProps {
  continent?: Continent;
  continentSlug?: string;
}

const SearchContinent: React.FC<SearchContinentProps> = ({
  continent,
  continentSlug: _continentSlug,
}) => {
  const t = useTranslations('HomePage');
  const tSearch = useTranslations('SearchContinent');

  return (
    <section className="container mx-auto justify-center bg-white py-16 sm:py-20">
        <div
          className="relative flex min-h-[300px] items-center justify-center rounded-[20px] bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hvar.jpg')",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 rounded-[20px] bg-black/40" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-8 py-12 text-center">
            {/* Title */}
            <h2 className="font-figtree text-[30px] leading-[100%] text-white">
              {continent ?
                tSearch('titleWithContinent', { continent: continent.name }) :
                tSearch('title')
              }
            </h2>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-sm font-bold text-white transition-colors hover:bg-[#2a4c78]">
                <Image
                  src="/images/map.png"
                  alt="Map icon"
                  width={20}
                  height={20}
                  className="sm:h-5 sm:w-5"
                />
                <span>{tSearch('viewBeachMap')}</span>
              </button>

              <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#008260] px-6 font-figtree text-sm font-bold text-white transition-colors hover:bg-[#006b4f]">
                <Image
                  src="/images/accomodation.png"
                  alt="Accommodation icon"
                  width={20}
                  height={20}
                />
                <span>
                  {t('browseAccommodationsButton') || 'Brskaj po nastanitvah'}
                </span>
              </button>
            </div>
          </div>
        </div>
    </section>
  );
};

export default SearchContinent;

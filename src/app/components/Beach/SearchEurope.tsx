'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

const SearchEurope: React.FC = () => {
  const t = useTranslations('HomePage'); // ali 'ContinentPage' če so prevodi tam
  const tSearch = useTranslations('SearchEurope');

  return (
    <section className="flex justify-center bg-white py-12 sm:py-16 lg:py-20">
      <div
        className="relative flex h-[275px] w-full max-w-[1726px] items-center justify-center rounded-[10px] bg-cover bg-center px-[40px] py-[60px] sm:px-[120px] sm:py-[73px] lg:px-[679px]"
        style={{
          backgroundImage: "url('/images/hvar.jpg')",
        }}
      >
        {/* Overlay (opcijsko, če želiš bolj kontrasten tekst) */}
        <div className="absolute inset-0 rounded-[10px] bg-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-10 text-center">
          {/* Title */}
          <h2 className="font-figtree text-[30px] font-bold leading-[100%] text-white">
            {tSearch('title')}
          </h2>

          {/* Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
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

export default SearchEurope;

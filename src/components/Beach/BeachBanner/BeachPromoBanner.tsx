'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

interface Props {
  onMapClick?: () => void;
  onSimilarClick?: () => void;
}

const BeachPromoBanner: React.FC<Props> = ({
  // Remove default empty functions; call with optional chaining
  onMapClick,
  onSimilarClick,
}) => {
  const t = useTranslations('BeachPromoBanner');

  return (
    <section className="container mx-auto my-12">
      <div className="relative overflow-hidden rounded-[12px]">
        {/* Background image */}
        <Image
          src="/images/beachpagepic.jpg"
          alt="Beach background"
          width={1920}
          height={600}
          className="h-[280px] w-full object-cover sm:h-[320px] lg:h-[380px]"
          priority
        />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <h2 className="font-figtree text-[30px] font-bold leading-[100%] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            {t('title')}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Map button */}
            <button
              type="button"
              onClick={() => onMapClick?.()}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78]"
            >
              <Image
                src="/images/map.png"
                alt="Map icon"
                width={20}
                height={20}
              />
              <span>{t('beachesMap')}</span>
            </button>

            {/* Similar beaches button */}
            <button
              type="button"
              onClick={() => onSimilarClick?.()}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md border border-[#1A3C68] bg-white px-6 font-figtree text-[14px] font-bold text-[#1A3C68] transition-colors hover:bg-[#f2f2f2]"
            >
              <Image
                src="/images/map-blue.png"
                alt="Map icon"
                width={20}
                height={20}
              />
              <span>{t('similarBeaches')}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeachPromoBanner;

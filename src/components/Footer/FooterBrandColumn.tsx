'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function FooterBrandColumn() {
  const t = useTranslations('Footer.brand');

  return (
    // full-height column layout
    <div className="flex h-full flex-col">
      {/* Logo always on top */}
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_CDN_ENDPOINT}js/assets/img/logo_dark.png`}
          alt="BeachRex logo"
          width={119}
          height={22}
          className="h-5 w-auto opacity-100 mix-blend-luminosity grayscale sm:h-6 lg:h-7"
          priority
        />
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center">
        <p className="max-w-sm text-[10px] leading-[14px] text-[#8D8D8D]">
          {t('desc')}
        </p>
      </div>

      {/* Button pinned to bottom */}
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-5 py-2.5 font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78] focus:outline-none focus:ring-0">
        <Image
src="/images/map.png" alt="Map icon" width={20}
height={20}
        />
        <span>{t('cta')}</span>
      </button>
    </div>
  );
}

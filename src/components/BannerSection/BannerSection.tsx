'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import InfoCardsSection from './InfoCardsSection';
import MapWidget from './MapWidget';
import TopBar from './TopBar';
import WeatherWidget from './WeatherWidget';
import type { Continent } from '@/lib/api-client/models/Continent';

interface BannerSectionProps {
  image: string; // background slika
  title: string; // npr. "Kvarner"
  categoryType?: string; // npr. "Regija", "Otok", "Kontinent"
  subtitle?: string; // opcijsko
  badges?: { label: string; color?: string; icon?: string }[]; // array badge-ov
  rightWidgets?: React.ReactNode; // vreme, mapa, ipd.
  children?: React.ReactNode; // dodatni custom content
  continent?: Continent; // continent data for TopBar
  accommodationCount?: number; // accommodation count for TopBar
}

const BannerSection: React.FC<BannerSectionProps> = ({
  image,
  title,
  continent,
  accommodationCount,
}) => {
  const t = useTranslations('BannerSection');

  // 🔹 Prevedene kartice
  const infoCards = [
    {
      title: t('cardHistoryTitle'),
      subtitle:
        'Krk is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
      image: '/images/banner/history.jpg',
    },
    {
      title: t('cardCuisineTitle'),
      subtitle:
        'Krk is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
      image: '/images/banner/cuisine.jpg',
    },
    {
      title: t('cardCultureTitle'),
      subtitle:
        'Krk is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
      image: '/images/banner/culture.jpg',
    },
    {
      title: t('cardSightsTitle'),
      subtitle:
        'Krk is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
      image: '/images/banner/sights.jpg',
    },
  ];

  // 🔹 Prevedeni badge-i
  const leftBadges = [
    {
      label: t('badgeFestival'),
      icon: '/images/banner/regions-icons/party.png',
    },
    { label: t('badgeWine'), icon: '/images/banner/regions-icons/wine.png' },
    { label: t('badgeLamb'), icon: '/images/banner/regions-icons/food.png' },
    {
      label: t('badgeFestival'),
      icon: '/images/banner/regions-icons/party.png',
    },
    { label: t('badgeWine'), icon: '/images/banner/regions-icons/wine.png' },
    { label: t('badgeLamb'), icon: '/images/banner/regions-icons/food.png' },
  ];

  const rightBadges = [
    {
      label: t('badgeFestival'),
      icon: '/images/banner/regions-icons/party.png',
    },
    { label: t('badgeWine'), icon: '/images/banner/regions-icons/wine.png' },
    { label: t('badgeLamb'), icon: '/images/banner/regions-icons/food.png' },
    {
      label: t('badgeFestival'),
      icon: '/images/banner/regions-icons/party.png',
    },
    { label: t('badgeWine'), icon: '/images/banner/regions-icons/wine.png' },
    { label: t('badgeLamb'), icon: '/images/banner/regions-icons/food.png' },
  ];

  return (
    <>
      <section
        className="relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px] bg-cover bg-center sm:h-[700px] lg:h-[798px]"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/10" />

        <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 lg:p-8">
          {/* Top bar */}
          <div>
            <TopBar
              continent={continent}
              accommodationCount={accommodationCount}
            />
          </div>

          <div className="flex flex-1 flex-col justify-center">
            {/* Naslovni blok */}
            <div className="relative">
              {/* Velik background title */}
              <span className="left-0 block font-figtree text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-bold leading-[100%] text-white opacity-30">
                {t('categoryLabel')}
              </span>

              {/* Manjši naslov Kvarner */}
              <span className="absolute bottom-0 left-[30px] sm:left-[50px] md:left-[80px] lg:left-[100px] font-figtree text-[40px] sm:text-[60px] md:text-[80px] lg:text-[100px] font-bold leading-[100%] text-white">
                {title}
              </span>
            </div>

            {/* Spodnji del */}
            <div className="mx-[20px] sm:mx-[50px] md:mx-[80px] lg:mx-[100px] mt-8 sm:mt-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-0">
              {/* Leva stran – badge-i */}
              <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[20px]">
                {/* Levi grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2 gap-[6px] sm:gap-[10px]">
                  {leftBadges.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-[4px] sm:gap-[8px] rounded-[14px] sm:rounded-[16px] bg-[#5E1CA5] px-[6px] sm:px-[10px] py-[2px] sm:py-[3px]"
                    >
                      <Image
                        src={b.icon}
                        alt={b.label}
                        width={16}
                        height={16}
                        className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]"
                      />
                      <span className="font-figtree text-[12px] sm:text-[16px] font-bold text-white">
                        {b.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Desni grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2 gap-[6px] sm:gap-[10px]">
                  {rightBadges.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-[4px] sm:gap-[8px] rounded-[14px] sm:rounded-[16px] bg-[#5E1CA5] px-[6px] sm:px-[10px] py-[2px] sm:py-[3px]"
                    >
                      <Image
                        src={b.icon}
                        alt={b.label}
                        width={16}
                        height={16}
                        className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]"
                      />
                      <span className="font-figtree text-[12px] sm:text-[16px] font-bold text-white">
                        {b.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desna stran – mapa + vreme */}
              <div className="flex gap-[6px] sm:gap-[10px] w-full lg:w-auto justify-center lg:justify-end">
                <MapWidget />
                <WeatherWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Right side floating buttons */}
        <div className="absolute right-0 top-1/2 z-20 flex translate-y-[-50%] flex-col">
          {/* Play / Beach button */}
          <button className="mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-variable-collection-temno-modro sm:h-[68.46px] sm:w-[71px]">
            <Image
              src="/images/map.png"
              alt="play beach"
              width={24}
              height={24}
              className="sm:h-[33px] sm:w-[33px]"
            />
          </button>

          {/* Filters button */}
          <button className="flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-variable-collection-temno-modro sm:h-[68.46px] sm:w-[71px]">
            <Image
              src="/images/filters.png"
              alt="filters"
              width={20}
              height={20}
              className="sm:h-[28px] sm:w-[28px]"
            />
          </button>
        </div>
      </section>

      {/* Info kartice */}
      <InfoCardsSection cards={infoCards} />
    </>
  );
};

export default BannerSection;

'use client';

import type { Continent } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import BottomBadges from './BottomBadges';
import InfoCardsSection from './InfoCardsSection';
import MapWidget from './MapWidget';
import TopBar from './TopBar';
import WeatherWidget from './WeatherWidget';

import type { PageVariant } from '../ui/pageVariants';
import {
  VARIANT_BG_CLASS,
  VARIANT_CATEGORY_LABEL_KEY,
} from '../ui/pageVariants';

interface BannerSectionProps {
  image: string;
  title: string;
  categoryType?: string;
  subtitle?: string;
  badges?: { label: string; color?: string; icon?: string }[];
  rightWidgets?: React.ReactNode;
  children?: React.ReactNode;
  continent?: Continent;
  accommodationCount?: number;
  /** continent | region | island | city | country */
  topBarVariant?: PageVariant;
  /** Explicit beach count for non-continent variants */
  beachCount?: number;
}

const BannerSection: React.FC<BannerSectionProps> = ({
  image,
  title,
  continent,
  accommodationCount,
  topBarVariant = 'continent',
  beachCount,
}) => {
  const t = useTranslations('BannerSection');
  const tRoutes = useTranslations('routes');

  const variant = topBarVariant;

  const variantBgClass = VARIANT_BG_CLASS[variant];
  const categoryLabelKey = VARIANT_CATEGORY_LABEL_KEY[variant];

  const floatingButtonColorClass = variantBgClass;

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

  const badges = [
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
        className={[
          'relative mx-auto h-[600px] min-h-[500px] w-full max-w-[1928px]',
          'overflow-hidden rounded-b-[10px] rounded-t-[10px]',
          'bg-cover bg-center sm:h-[700px] lg:h-[798px]',
        ].join(' ')}
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/10" />

        <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 lg:p-8">
          {/* Top bar */}
          <div>
            <TopBar
              variant={variant}
              continent={continent}
              accommodationCount={accommodationCount}
              title={title}
              beachCount={beachCount}
            />
          </div>

          <div className="flex flex-1 flex-col justify-center">
            {/* Title block */}
            <div className="relative">
              {/* Big background category label */}
              <span
                className={[
                  'left-0 block font-figtree font-bold leading-[100%] text-white opacity-30',
                  'text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px]',
                ].join(' ')}
              >
                {t(categoryLabelKey)}
              </span>

              {/* Foreground title (e.g. Kvarner, Krk, Baška) */}
              <span
                className={[
                  'absolute bottom-0 left-[30px] font-figtree font-bold leading-[100%] text-white',
                  'text-[40px] sm:left-[50px] sm:text-[60px]',
                  'md:left-[80px] md:text-[80px]',
                  'lg:left-[100px] lg:text-[100px]',
                ].join(' ')}
              >
                {title}
              </span>
            </div>

            <div
              className={[
                'mx-[20px] mt-8 flex flex-col items-start justify-between gap-6',
                'sm:mx-[50px] sm:mt-12 md:mx-[80px] lg:mx-[100px]',
                'lg:flex-row lg:items-end',
              ].join(' ')}
            >
              {/* Badges */}
              <div className="hidden min-w-0 flex-1 md:block">
                <BottomBadges badges={badges} variant={variant} />
              </div>

              {/* Widgets */}
              <div className="flex shrink-0 justify-center gap-[6px] sm:gap-[10px] lg:justify-end">
                <MapWidget />
                <WeatherWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Right side floating buttons */}
        <div className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col">
          {/* Map button */}
          <Link
            href={tRoutes('beachMap')}
            className={[
              'mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px]',
              'sm:h-[68.46px] sm:w-[71px]',
              'bg-variable-collection-temno-modro', //
            ].join(' ')}
          >
            <Image
              src="/images/common/map-icon.svg"
              alt="play beach"
              width={24}
              height={24}
              className="h-[24px] w-[24px] sm:h-[33px] sm:w-[33px]"
            />
          </Link>

          {/* Filters button */}
          <button
            type="button"
            className={[
              'flex h-12 w-12 items-center justify-center rounded-l-[10px]',
              'sm:h-[68.46px] sm:w-[71px]',
              floatingButtonColorClass,
            ].join(' ')}
          >
            <Image
              src="/images/common/white-filter.svg"
              alt="filters"
              width={20}
              height={20}
              className="h-[20px] w-[20px] sm:h-[28px] sm:w-[28px]"
            />
          </button>
        </div>
      </section>

      {/* Info cards */}
      <InfoCardsSection cards={infoCards} variant={variant} />
    </>
  );
};

export default BannerSection;

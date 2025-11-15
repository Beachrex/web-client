'use client';

import MapWidget from '@/components/BannerSection/MapWidget';
import WeatherWidget from '@/components/BannerSection/WeatherWidget';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import BeachTitleBlock from './BeachTitleBlock';
import BottomBadgesBeach from './BottomBadgesBeach';
import SeaTempWidget from './SeaTempWidget';
import TopBarBeach from './TopBarBeach';
import TopBarBeachRight from './TopBarBeachRight';

interface BeachBannerSectionProps {
  accommodationCount?: number;
  activityCount?: number;
}

export default function BeachBannerSection({
  accommodationCount,
  activityCount,
}: BeachBannerSectionProps) {
  const tRoutes = useTranslations('routes');

  const badges: {
    id: 'stony' | 'familyFriendly' | 'parking' | 'easyAccess' | 'windsurfing';
    icon: string;
  }[] = [
    { id: 'stony', icon: '/images/categories/stones-blue.png' },
    { id: 'familyFriendly', icon: '/images/categories/parents.png' },
    { id: 'parking', icon: '/images/categories/parking-blue.png' },
    { id: 'easyAccess', icon: '/images/categories/arrow-path.svg' },
    { id: 'windsurfing', icon: '/images/categories/windsurfing.png' },
  ];

  return (
    <section className="relative mx-auto mb-10 h-[600px] min-h-[500px] w-full max-w-[1928px] overflow-visible pb-40 sm:h-[700px] md:min-h-[400px] md:pb-48 lg:h-[798px]">
      {/* Background with rounded corners */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[10px] rounded-t-[10px]">
        <Image
          src="/images/propertycard/card-banner.jpg"
          alt="Beach banner"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      {/* Top bar stays at the top */}
      <div className="relative z-10 flex flex-row items-center justify-between p-4 sm:p-6 lg:p-8">
        {/* Left: naslov + counters */}
        <div className="flex flex-col">
          <TopBarBeach
            beachName="Plaža Haludovo"
            accommodationCount={accommodationCount}
            activityCount={activityCount}
          />
        </div>

        {/* Right: review / save / share */}
        <TopBarBeachRight />
      </div>

      {/* === Title + widgets anchored near bottom === */}
      <div className="absolute inset-x-0 bottom-[110px] z-20 sm:bottom-[120px] md:bottom-[130px]">
        <div className="grid grid-cols-1 gap-6 px-4 pr-16 sm:px-6 sm:pr-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:pr-[96px]">
          <BeachTitleBlock title="Plaža Haludovo" />

          <div className="flex justify-center gap-[6px] sm:gap-[10px] lg:justify-end">
            <MapWidget />
            <WeatherWidget />
            <SeaTempWidget tempC={8} />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 translate-y-1/2">
        <BottomBadgesBeach badges={badges} />
      </div>

      {/* Floating buttons */}
      <div className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col">
        <Link href={tRoutes('beachMap')} className="mb-2 flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-[#1A3C68] sm:h-[68.46px] sm:w-[71px]">
          <Image
            src="/images/map.png"
            alt="open beach map"
            width={24}
            height={24}
            className="sm:h-[33px] sm:w-[33px]"
          />
        </Link>
        <button className="flex h-12 w-12 items-center justify-center rounded-l-[10px] bg-[#008260] sm:h-[68.46px] sm:w-[71px]">
          <Image
            src="/images/accomodation.png"
            alt="filters"
            width={20}
            height={20}
            className="sm:h-[28px] sm:w-[28px]"
          />
        </button>
      </div>
    </section>
  );
}

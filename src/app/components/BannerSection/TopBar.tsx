'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import type { Continent } from '@/app/types/api';
import { continentCodeToKey, getContinentIcon } from '@/app/services/continentService';

interface TopBarProps {
  continent?: Continent;
  accommodationCount?: number;
}

const TopBar: React.FC<TopBarProps> = ({
  continent,
  accommodationCount = 0,
}) => {
  const t = useTranslations('TopBar');
  const tContinent = useTranslations('Continents');

  // Get continent key and icon
  const continentKey = continent ? continentCodeToKey[continent.code] : 'europe';
  const continentIcon = continent ? getContinentIcon(continentKey) : '/images/continents/evropa.png';
  const continentName = continent ? continent.name : tContinent('europe');
  const beachCount = continent ? continent.beaches_count : 0;

  return (
    <div className="flex h-[54px] items-center rounded-[10px]">
      {/* Kontinent ikona */}
      <div className="flex h-full w-[54px] items-center justify-center overflow-hidden rounded-l-[10px] bg-[#5E1CA5]">
        <Image
          src={continentIcon}
          alt={continentName}
          width={35}
          height={35}
          className="object-contain"
        />
      </div>

      {/* Besedilni del */}
      <div className="flex h-full items-center gap-[10px] rounded-r-[10px] bg-[#5E1CA5] px-[16px]">
        {/* Kontinent (bel pill) */}
        <span className="flex items-center justify-center gap-[7px] rounded-full bg-white px-[10px] py-[3px] font-figtree text-[20px] font-bold leading-[100%] text-[#5E1CA5]">
          {t('continentLabel')}
        </span>

        {/* Naziv kontinenta */}
        <span className="font-figtree text-[30px] font-bold leading-[100%] text-white">
          {continentName}
        </span>

        {/* Št. plaž */}
        <div className="flex h-[41px] items-center gap-[8px] rounded-[6px] bg-white px-[10px]">
          <Image
            src="/images/beach-black.png"
            alt={t('numBeachesLabel')}
            width={26}
            height={26}
          />
          <span className="font-figtree text-[14px] font-medium text-[#222222]">
            {t('numBeachesLabel')}
          </span>
          <span className="font-figtree text-[14px] font-bold text-[#5E1CA5]">
            {beachCount}
          </span>
        </div>

        {/* Št. nastanitev */}
        <div className="flex h-[41px] items-center gap-[8px] rounded-[6px] bg-white px-[10px]">
          <Image
            src="/images/accommodation-black.png"
            alt={t('numAccommodationsLabel')}
            width={26}
            height={26}
          />
          <span className="font-figtree text-[14px] font-medium text-[#222222]">
            {t('numAccommodationsLabel')}
          </span>
          <span className="font-figtree text-[14px] font-bold text-[#5E1CA5]">
            {accommodationCount}
          </span>
        </div>

        {/* Filter gumb */}
        <div className="flex h-[41px] w-[41px] items-center justify-center rounded-[6px] bg-white">
          <Image
            src="/images/banner/filter-purple.png"
            alt="filter"
            width={32}
            height={32}
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;

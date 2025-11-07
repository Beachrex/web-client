'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import { continentCodeToKey } from '@/lib/constants/mappings';
import { getContinentIcon } from '@/lib/utils/icons';
import type { Continent } from '@/lib/api-client/types.gen';

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
  const continentKey = continent?.code ? (continentCodeToKey[continent.code] ?? 'europe') : 'europe';
  const continentIcon = continent ? getContinentIcon(continentKey) : '/images/continents/evropa.png';
  const continentName = continent ? (continent.name ?? tContinent('europe')) : tContinent('europe');
  const beachCount = continent ? continent.beaches_count : 0;

  return (
    <div className="flex h-[54px] items-center rounded-[10px]">


      {/* Besedilni del */}
      <div className="flex h-full items-center gap-[6px] sm:gap-[10px] rounded-r-[10px] bg-[#5E1CA5] px-[8px] sm:px-[16px]">
        {/* Kontinent (bel pill) - Hidden on mobile */}
        <span className="hidden md:flex items-center justify-center gap-[7px] rounded-full bg-white px-[10px] py-[3px] font-figtree text-[20px] font-bold leading-[100%] text-[#5E1CA5]">
          {t('continentLabel')}
        </span>
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
        {/* Naziv kontinenta - Hidden on mobile */}
          <span className="hidden md:block font-figtree text-[30px] font-bold leading-[100%] text-white">
          {continentName ?? tContinent('europe')}
        </span>

        {/* Št. plaž */}
        <div className="flex h-[41px] items-center gap-[4px] sm:gap-[8px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
          <Image
            src="/images/beach-black.png"
            alt={t('numBeachesLabel')}
            width={26}
            height={26}
            className="w-[20px] h-[20px] sm:w-[26px] sm:h-[26px]"
          />
          <span className="hidden sm:block font-figtree text-[14px] font-medium text-[#222222]">
            {t('numBeachesLabel')}
          </span>
          <span className="font-figtree text-[12px] sm:text-[14px] font-bold text-[#5E1CA5]">
            {beachCount}
          </span>
        </div>

        {/* Št. nastanitev */}
        <div className="flex h-[41px] items-center gap-[4px] sm:gap-[8px] rounded-[6px] bg-white px-[6px] sm:px-[10px]">
          <Image
            src="/images/accommodation-black.png"
            alt={t('numAccommodationsLabel')}
            width={26}
            height={26}
            className="w-[20px] h-[20px] sm:w-[26px] sm:h-[26px]"
          />
          <span className="hidden sm:block font-figtree text-[14px] font-medium text-[#222222]">
            {t('numAccommodationsLabel')}
          </span>
          <span className="font-figtree text-[12px] sm:text-[14px] font-bold text-[#5E1CA5]">
            {accommodationCount}
          </span>
        </div>

        {/* Filter gumb */}
        <div className="flex h-[41px] w-[35px] sm:w-[41px] items-center justify-center rounded-[6px] bg-white">
          <Image
            src="/images/banner/filter-purple.png"
            alt="filter"
            width={32}
            height={32}
            className="w-[24px] h-[24px] sm:w-[32px] sm:h-[32px]"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;

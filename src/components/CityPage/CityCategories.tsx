'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const CityCategories: React.FC = () => {
  const t = useTranslations('TownPage');

  const categories = [
    {
      id: 'sandBeaches',
      icon: '/images/common/sand-castle.svg',
      labelKey: 'categories.sandBeaches',
    },
    {
      id: 'rockBeaches',
      icon: '/images/common/stones.svg',
      labelKey: 'categories.rockBeaches',
    },
    {
      id: 'grassBeaches',
      icon: '/images/common/grass.svg',
      labelKey: 'categories.grassBeaches',
    },
    {
      id: 'pool',
      icon: '/images/common/swimming-pool.svg',
      labelKey: 'categories.pool',
    },
    {
      id: 'naturalShade',
      icon: '/images/common/tree.svg',
      labelKey: 'categories.naturalShade',
    },
    {
      id: 'slides',
      icon: '/images/common/water-slide.svg',
      labelKey: 'categories.slides',
    },
    {
      id: 'playgroundBeaches',
      icon: '/images/common/slider.svg',
      labelKey: 'categories.playgroundBeaches',
    },
    {
      id: 'partyBeaches',
      icon: '/images/common/dance.svg',
      labelKey: 'categories.partyBeaches',
    },
    {
      id: 'barBeaches',
      icon: '/images/common/stall.svg',
      labelKey: 'categories.barBeaches',
    },
    {
      id: 'sportsCourt',
      icon: '/images/common/tennis-court.svg',
      labelKey: 'categories.sportsCourt',
    },
    {
      id: 'parkingNearby',
      icon: '/images/common/path.svg',
      labelKey: 'categories.parkingNearby',
    },
    {
      id: 'parkingOnBeach',
      icon: '/images/common/parking.svg',
      labelKey: 'categories.parkingOnBeach',
    },
    {
      id: 'camping',
      icon: '/images/common/van.svg',
      labelKey: 'categories.camping',
    },
    {
      id: 'dogFriendly',
      icon: '/images/common/pets.svg',
      labelKey: 'categories.dogFriendly',
    },
    {
      id: 'accessible',
      icon: '/images/common/disability.svg',
      labelKey: 'categories.accessible',
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-start gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex h-[100px] w-[100px] flex-col items-center justify-center gap-3 rounded-md border border-[#E7E7E7] bg-[#F5F5F5] p-2"
            >
              <Image
                src={c.icon}
                alt={t(c.labelKey)}
                width={32}
                height={32}
                className="h-[32px] w-[32px]"
              />
              <span className="max-w-[90px] break-words text-center font-figtree text-[14px] font-medium leading-[100%] text-[#4D4D4D]">
                {t(c.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityCategories;

'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

const CityCategories: React.FC = () => {
  const t = useTranslations('TownPage');

  const categories = [
    {
      id: 'sandBeaches',
      icon: '/images/categories/sand-castle.png',
      labelKey: 'categories.sandBeaches',
    },
    {
      id: 'rockBeaches',
      icon: '/images/categories/stones.png',
      labelKey: 'categories.rockBeaches',
    },
    {
      id: 'grassBeaches',
      icon: '/images/categories/grass-beach.png',
      labelKey: 'categories.grassBeaches',
    },
    {
      id: 'pool',
      icon: '/images/categories/swimming-pool.png',
      labelKey: 'categories.pool',
    },
    {
      id: 'naturalShade',
      icon: '/images/categories/tree.png',
      labelKey: 'categories.naturalShade',
    },
    {
      id: 'slides',
      icon: '/images/categories/water-slide.png',
      labelKey: 'categories.slides',
    },
    {
      id: 'playgroundBeaches',
      icon: '/images/categories/slider.png',
      labelKey: 'categories.playgroundBeaches',
    },
    {
      id: 'partyBeaches',
      icon: '/images/categories/dance.png',
      labelKey: 'categories.partyBeaches',
    },
    {
      id: 'barBeaches',
      icon: '/images/categories/stall.png',
      labelKey: 'categories.barBeaches',
    },
    {
      id: 'sportsCourt',
      icon: '/images/categories/tennis-court.png',
      labelKey: 'categories.sportsCourt',
    },
    {
      id: 'parkingNearby',
      icon: '/images/categories/path.png',
      labelKey: 'categories.parkingNearby',
    },
    {
      id: 'parkingOnBeach',
      icon: '/images/categories/parking.png',
      labelKey: 'categories.parkingOnBeach',
    },
    {
      id: 'camping',
      icon: '/images/categories/van.png',
      labelKey: 'categories.camping',
    },
    {
      id: 'dogFriendly',
      icon: '/images/categories/pets.png',
      labelKey: 'categories.dogFriendly',
    },
    {
      id: 'accessible',
      icon: '/images/categories/disability.png',
      labelKey: 'categories.accessible',
    },
  ];

  return (
    <section className="bg-white py-4 sm:py-6">
      <div className="container mx-auto">
        {/* FLEX namesto GRID – tesno skupaj, kot na drugem screenshotu */}
        <div className="flex flex-wrap items-start gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex h-[100px] w-[100px] flex-col items-center justify-center gap-1 rounded-md bg-[#E7E7E7] p-2"
            >
              <Image
                src={c.icon}
                alt={t(c.labelKey)}
                width={26}
                height={26}
                className="h-[26px] w-[26px]"
              />
              <span className="max-w-[90px] break-words text-center font-figtree text-[13px] font-medium leading-[100%] text-[#4D4D4D]">
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

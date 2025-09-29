'use client';
import React from 'react';
import Image from 'next/image';

const continents = [
  { name: 'Evropa', icon: '/images/continents/evropa.png' },
  { name: 'Afrika', icon: '/images/continents/africa.png' },
  { name: 'Azija', icon: '/images/continents/asia.png' },
  { name: 'Severna Amerika', icon: '/images/continents/north-america.png' },
  { name: 'Južna Amerika', icon: '/images/continents/south-america.png' },
  { name: 'Avstralija', icon: '/images/continents/australia.png' },
];

const HeroSection: React.FC = () => {
  return (
    <section
      className="relative mx-auto h-[798px] w-full max-w-[1928px] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Continents buttons */}
      {/* Continents buttons */}
      <div className="absolute left-[30px] top-[30px] z-10 flex h-[54px] gap-[9px]">
        {continents.map((c) => (
          <div
            key={c.name}
            className="flex h-[54px] cursor-default items-center gap-[16px] rounded-[10px] bg-[#5E1CA5] px-[12px] py-[9px]"
          >
            <Image
              src={c.icon}
              alt={c.name}
              width={35}
              height={35}
              className="opacity-100"
            />
            <span className="font-figtree text-[20px] font-bold leading-[24px] text-white">
              {c.name}
            </span>
          </div>
        ))}
      </div>

      <div className="font-damion absolute left-[102px] top-[345px] h-[220px] w-[746px] text-[120px] font-normal leading-[110px] tracking-[0] text-white">
        <span className="block">Vse skrbi so</span>
        <span className="block">manjše na plaži!</span>
      </div>

      {/* Stats */}
      <div className="absolute bottom-[80px] left-[102px] z-10 flex gap-[80px] text-white">
        {/* 1. Plaže */}
        <div className="flex items-center gap-4">
          <Image
            src="/images/beach.png"
            alt="beach"
            width={60}
            height={60}
          />
          <div className="flex flex-col">
            <span className="text-[32px] font-bold">+1500</span>
            <span className="text-[16px] font-normal">
              plaž za raziskovanje
            </span>
          </div>
        </div>

        {/* 2. Države */}
        <div className="flex items-center gap-4">
          <Image
src="/images/map.png" alt="map" width={60}
height={60}
          />
          <div className="flex flex-col">
            <span className="text-[32px] font-bold">+250</span>
            <span className="text-[16px] font-normal">plažnih držav</span>
          </div>
        </div>

        {/* 3. Namestitve */}
        <div className="flex items-center gap-4">
          <Image
            src="/images/accomodation.png"
            alt="accommodation"
            width={60}
            height={60}
          />
          <div className="flex flex-col">
            <span className="text-[32px] font-bold">+6250</span>
            <span className="text-[16px] font-normal">namestitev ob plaži</span>
          </div>
        </div>
      </div>

      {/* Right side floating buttons */}
      <div className="absolute right-0 top-1/2 z-20 flex translate-y-[-50%] flex-col">
        {/* Play / Beach button */}
        <button className="mb-2 flex h-[68.46px] w-[71px] items-center justify-center rounded-l-[10px] bg-variable-collection-temno-modro">
          <Image
            src="/images/map.png"
            alt="play beach"
            width={33}
            height={33}
          />
        </button>

        {/* Filters button */}
        <button className="flex h-[68.46px] w-[71px] items-center justify-center rounded-l-[10px] bg-variable-collection-temno-modro">
          <Image
            src="/images/filters.png"
            alt="filters"
            width={28}
            height={28}
          />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;

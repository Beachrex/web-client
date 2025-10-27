'use client';
import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Commented out unused dynamic import to fix lint warning
// const HomeWorldMap = dynamic(
//   () => import("@/app/components/Map/HomeWorldMap"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-100">
//         <div className="text-gray-600">Loading map...</div>
//       </div>
//     ),
//   },
// );

const WorldMapSection: React.FC = () => {
  const t = useTranslations('HomePage');

  return (
      <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto">
              <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 xl:gap-20">
                  {/* Text Content */}
                  <div className="flex flex-col gap-6 lg:w-1/3 lg:gap-8">
                      {/* Title */}
                      <h2 className="text-2xl font-bold leading-tight text-[#003366] sm:text-3xl lg:text-4xl">
                          {t('worldMapTitle')}
                      </h2>

                      {/* Content */}
                      <p className="text-sm leading-relaxed text-[#4D4D4D] sm:text-base lg:text-lg">
                          {t('worldMapDescription')}
                      </p>

                      {/* Button */}
                      <button className="font-figtree flex w-full sm:w-auto sm:max-w-[220px] items-center justify-center gap-2 rounded-md bg-variable-collection-temno-modro px-5 py-2.5 text-sm text-white shadow transition hover:bg-[#162f4f]">
                          <Image
                              src="/images/map.png"
                              alt="map icon"
                              width={20}
                              height={20}
                          />
                          {t('viewBeachMapButton')}
                      </button>
                  </div>

                  {/* Images Grid */}
                  <div className="lg:w-2/3">
                      <div className="relative aspect-[16/9] lg:aspect-[2/1] w-full">
                          <Image
                              src="/images/worldmap.png"
                              alt="World map"
                              fill
                              className="object-contain"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </section>
  );
};

export default WorldMapSection;

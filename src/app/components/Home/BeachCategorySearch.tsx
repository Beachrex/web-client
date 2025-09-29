'use client';
import { Button } from 'flowbite-react';
import Image from 'next/image';
import React, { useState } from 'react';


interface CategoryItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
}

const BeachCategorySearch: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Beach categories with icons (Figma)
  const categories: CategoryItem[] = [
    {
      id: 'pescene',
      icon: '/images/categories/sand-castle.png',
      label: 'Peščene plaže',
    },
    {
      id: 'kamene',
      icon: '/images/categories/stones.png',
      label: 'Kamnite plaže',
    },
    {
      id: 'travnate',
      icon: '/images/categories/grass-beach.png',
      label: 'Travnate plaže',
    },
    {
      id: 'bazen',
      icon: '/images/categories/swimming-pool.png',
      label: 'Bazen',
    },
    {
      id: 'naravna-senca',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'tobogani',
      icon: '/images/categories/water-slide.png',
      label: 'Tobogani',
    },
    {
      id: 'plaze-z-igrali',
      icon: '/images/categories/slider.png',
      label: 'Plaže z igrali',
    },
    {
      id: 'plaze-za-zabavo',
      icon: '/images/categories/dance.png',
      label: 'Plaže za zabavo',
    },
    {
      id: 'plaze-z-barom',
      icon: '/images/categories/stall.png',
      label: 'Plaže z barom',
    },
    {
      id: 'z-sportnim',
      icon: '/images/categories/tennis-court.png',
      label: 'Z športnim igriščem',
    },
    {
      id: 'plaze-s-parking',
      icon: '/images/categories/parking.png',
      label: 'Plaže s parkiriščem',
    },
    {
      id: 'parking-blizu',
      icon: '/images/categories/path.png',
      label: 'Parkirišče blizu',
    },
    {
      id: 'avtokamp',
      icon: '/images/categories/van.png',
      label: 'Avtokamp ob plaži',
    },
    {
      id: 'primerne-za-pse',
      icon: '/images/categories/pets.png',
      label: 'Primerne za pse',
    },
    {
      id: 'primerne-za-invalide',
      icon: '/images/categories/disability.png',
      label: 'Primerne za invalide',
    },
    {
      id: 'naravna-senca2',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'naravna-senca3',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'naravna-senca4',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'naravna-senca5',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'naravna-senca6',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'naravna-senca7',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
    {
      id: 'naravna-senca8',
      icon: '/images/categories/tree.png',
      label: 'Naravna senca',
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const CategoryButton: React.FC<{ category: CategoryItem }> = ({
    category,
  }) => (
    <button
      onClick={() => toggleCategory(category.id)}
      className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded border
                  border-[#E0E0E0] bg-[#F5F5F5] p-1 transition-all duration-200
                  sm:gap-2 sm:p-2 md:gap-3 md:p-3 lg:gap-[10px] lg:p-[8px_3px] ${
        selectedCategories.includes(category.id)
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'text-[#4D4D4D]'
      }`}
    >
      {/* Ikona (slika) */}
      <Image
        src={category.icon}
        alt={category.label}
        width={32}
        height={32}
        className="h-4 w-4 object-contain sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8"
      />
      {/* Label */}
      <div
className="text-center text-[7px] font-medium leading-tight
                      sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[12px]
                      sm:leading-tight lg:leading-[100%]"
      >
        {category.label}
      </div>
    </button>
  );

  return (
          <section className="py-12 sm:py-16 lg:py-20">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
                  <div
className="rounded-lg bg-variable-collection-temno-modro text-center
                               px-4 py-8 sm:px-8 sm:py-12 lg:px-16 lg:py-16 xl:px-24"
                  >

                          <h2 className="mb-6 font-[Figtree] text-[30px] font-bold leading-[100%] text-white">
                              Poišči plažo po svojem okusu
                          </h2>
                          <p className="text-slate-300 mx-auto max-w-4xl font-[Figtree] text-[14px] font-normal leading-[24px] mb-8">
                              Iščeš popolno plažo? Uporabi napredne filtre in hitro najdi
                              idealno lokacijo! Brskaj glede na tip plaže, vrsto peska,
                              dostopnost, priljubljenost, aktivnosti, infrastrukturo in še več.
                              Ne glede na to, ali si želiš mirnega kotička za sprostitev ali
                              živahne plaže s številnimi vodnimi športi, boš zlahka našel tisto,
                              kar ti najbolj ustreza.
                          </p>
                      {/* Category Grid */}
                      {/* Top Row */}
                      <div
className="mb-4 grid grid-cols-4 gap-2 sm:mb-6 sm:grid-cols-5 sm:gap-3
                                   md:grid-cols-6 md:gap-4 lg:grid-cols-8 lg:gap-5
                                   xl:grid-cols-10 xl:gap-6 2xl:grid-cols-11"
                      >
                          {categories.map((category) => (
                              <CategoryButton key={category.id} category={category} />
                          ))}
                      </div>

                      {/* Advanced Filters Button */}
                      <div className="flex justify-center">
                          <Button className="flex items-center justify-center gap-3 rounded-md border border-[#E0E0E0] bg-white px-4 py-2 text-sm font-bold text-[#4D4D4D] transition-colors duration-200 hover:bg-gray-50 sm:gap-4 sm:px-5 sm:py-3 sm:text-base lg:gap-5 lg:px-6">
                              <Image
                                  src="/images/filters-blue.png"
                                  alt="Filtri"
                                  width={20}
                                  height={20}
                                  className="h-4 w-4 object-contain sm:h-5 sm:w-5 mr-1 sm:mr-2"
                              />
                              Prikaži napredne filtre
                          </Button>
                      </div>
                      {/* Selected Categories Display */}
                      {selectedCategories.length > 0 && (
                          <div className="mt-8 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                              <h3 className="mb-2 font-semibold text-white">
                                  Izbrane kategorije:
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                  {selectedCategories.map((categoryId) => {
                                      const category = [
                                          ...categories,
                                      ].find((c) => c.id === categoryId);
                                      return category ? (
                                          <span
                                              key={categoryId}
                                              className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white"
                                          >
                      <Image
                          src={category.icon}
                          alt={category.label}
                          width={16}
                          height={16}
                      />
                                              {category.label}
                                              <button
                                                  onClick={() => toggleCategory(categoryId)}
                                                  className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-xs hover:bg-blue-600"
                                              >
                        ×
                      </button>
                    </span>
                                      ) : null;
                                  })}
                              </div>
                          </div>
                      )}


                  </div>


                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6 xl:gap-8 mt-10">
                          {/* Morske plaže */}
                          <button
                              className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
                              style={{ backgroundColor: '#0069AB' }}
                          >
                              <Image
                                  src="/images/categories/sea-beaches.jpg"
                                  alt="Morske plaže background"
                                  fill
                                  className="object-cover opacity-10"
                              />
                              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                  src="/images/categories/sunset.png"
                  alt="Sunset icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              Morske plaže
            </span>
                          </button>

                          {/* Plaže ob jezeru */}
                          <button
                              className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
                              style={{ backgroundColor: '#4CC07E' }}
                          >
                              <Image
                                  src="/images/categories/lake-beaches.jpg"
                                  alt="Plaže ob jezeru background"
                                  fill
                                  className="object-cover opacity-10"
                              />
                              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                  src="/images/categories/gozd.png"
                  alt="Forest icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              Plaže ob jezeru
            </span>
                          </button>

                          {/* Plaže ob reki */}
                          <button
                              className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
                              style={{ backgroundColor: '#4CC07E' }}
                          >
                              <Image
                                  src="/images/categories/river-beaches.jpg"
                                  alt="Plaže ob reki background"
                                  fill
                                  className="object-cover opacity-10"
                              />
                              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                  src="/images/categories/reka.png"
                  alt="River icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              Plaže ob reki
            </span>
                          </button>

                          {/* Zunanji bazeni */}
                          <button
                              className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
                              style={{ backgroundColor: '#42D4F4' }}
                          >
                              <Image
                                  src="/images/categories/bazen.jpg"
                                  alt="Zunanji bazeni background"
                                  fill
                                  className="object-cover opacity-10"
                              />
                              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                  src="/images/categories/reka.png"
                  alt="Pool icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              Zunanji bazeni
            </span>
                          </button>

                          {/* Pokriti bazeni, terme */}
                          <button
                              className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-105 sm:h-24 sm:px-6 sm:py-4 sm:text-base lg:h-[100px] lg:px-8 lg:text-lg"
                              style={{ backgroundColor: '#42D4F4' }}
                          >
                              <Image
                                  src="/images/categories/indoor-pool.jpg"
                                  alt="Pokriti bazeni background"
                                  fill
                                  className="object-cover opacity-10"
                              />
                              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
              <Image
                  src="/images/categories/reka.png"
                  alt="Indoor pool icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7 lg:h-8 lg:w-8"
              />
              Pokriti bazeni, terme
            </span>
                          </button>
                      </div>


              </div>
          </section>
  );
};

export default BeachCategorySearch;

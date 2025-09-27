"use client";
import { Button } from "flowbite-react";
import Image from "next/image";
import React, { useState } from "react";

interface CategoryItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
}

const BeachCategorySearch: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Beach categories with icons (Figma)
  const topRowCategories: CategoryItem[] = [
    {
      id: "pescene",
      icon: "/images/categories/sand-castle 1.png",
      label: "Peščene plaže",
    },
    {
      id: "kamene",
      icon: "/images/categories/stones.png",
      label: "Kamnite plaže",
    },
    {
      id: "travnate",
      icon: "/images/categories/grass (2) 1.png",
      label: "Travnate plaže",
    },
    {
      id: "bazen",
      icon: "/images/categories/swimming-pool (3) 1.png",
      label: "Bazen",
    },
    {
      id: "naravna-senca",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "tobogani",
      icon: "/images/categories/water-slide 1.png",
      label: "Tobogani",
    },
    {
      id: "plaze-z-igrali",
      icon: "/images/categories/slider 1.png",
      label: "Plaže z igrali",
    },
    {
      id: "plaze-za-zabavo",
      icon: "/images/categories/dance 1.png",
      label: "Plaže za zabavo",
    },
    {
      id: "plaze-z-barom",
      icon: "/images/categories/stall 1.png",
      label: "Plaže z barom",
    },
    {
      id: "z-sportnim",
      icon: "/images/categories/tennis-court 1.png",
      label: "Z športnim igriščem",
    },
    {
      id: "plaze-s-parking",
      icon: "/images/categories/parking (2) 1.png",
      label: "Plaže s parkiriščem",
    },
  ];

  const bottomRowCategories: CategoryItem[] = [
    {
      id: "parking-blizu",
      icon: "/images/categories/path (3) 1.png",
      label: "Parkirišče blizu",
    },
    {
      id: "avtokamp",
      icon: "/images/categories/van (3) 1.png",
      label: "Avtokamp ob plaži",
    },
    {
      id: "primerne-za-pse",
      icon: "/images/categories/pets 1.png",
      label: "Primerne za pse",
    },
    {
      id: "primerne-za-invalide",
      icon: "/images/categories/disability 1.png",
      label: "Primerne za invalide",
    },
    {
      id: "naravna-senca2",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "naravna-senca3",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "naravna-senca4",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "naravna-senca5",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "naravna-senca6",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "naravna-senca7",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
    },
    {
      id: "naravna-senca8",
      icon: "/images/categories/tree (1) 1.png",
      label: "Naravna senca",
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
      className={`flex h-[100px] w-[100px] flex-col items-center justify-center gap-[10px] rounded-[4px] border border-[#E0E0E0] bg-[#F5F5F5] p-[8px_3px] transition-all duration-200 ${
        selectedCategories.includes(category.id)
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "text-[#4D4D4D]"
      } `}
    >
      {/* Ikona (slika) */}
      <Image
        src={category.icon}
        alt={category.label}
        width={32}
        height={32}
        className="object-contain"
      />
      {/* Label */}
      <div className="h-[34px] w-[70px] text-center font-[Figtree] text-[14px] font-medium leading-[100%]">
        {category.label}
      </div>
    </button>
  );

  return (
    <section>
      <div className="mx-auto w-[1716px] rounded-[10px] bg-variable-collection-temno-modro px-[176px] py-[89px]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-6 font-[Figtree] text-[30px] font-bold leading-[100%] text-white">
              Poišči plažo po svojem okusu
            </h2>
            <p className="text-slate-300 mx-auto max-w-4xl font-[Figtree] text-[14px] font-normal leading-[24px]">
              Iščeš popolno plažo? Uporabi napredne filtre in hitro najdi
              idealno lokacijo! Brskaj glede na tip plaže, vrsto peska,
              dostopnost, priljubljenost, aktivnosti, infrastrukturo in še več.
              Ne glede na to, ali si želiš mirnega kotička za sprostitev ali
              živahne plaže s številnimi vodnimi športi, boš zlahka našel tisto,
              kar ti najbolj ustreza.
            </p>
          </div>

          {/* Category Grid */}
          <div className="mb-8 rounded-2xl bg-variable-collection-temno-modro p-8">
            {/* Top Row */}
            <div className="mb-6 grid grid-cols-2 gap-[26px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
              {topRowCategories.map((category) => (
                <CategoryButton key={category.id} category={category} />
              ))}
            </div>

            {/* Bottom Row */}
            <div className="mb-8 grid grid-cols-2 gap-[26px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
              {bottomRowCategories.map((category) => (
                <CategoryButton key={category.id} category={category} />
              ))}
            </div>

            {/* Advanced Filters Button */}
            <div className="flex justify-center">
              <Button className="flex h-[41px] items-center justify-center gap-[20px] rounded-[6px] border border-[#E0E0E0] bg-white px-[20px] py-[11px] font-[Figtree] text-[14px] font-bold leading-[100%] text-[#4D4D4D] transition-colors duration-200">
                <Image
                  src="/images/filters.png"
                  alt="Filtri"
                  width={20}
                  height={20}
                  className="object-contain"
                />
                Prikaži napredne filtre
              </Button>
            </div>
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
                    ...topRowCategories,
                    ...bottomRowCategories,
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
      </div>

      {/* Quick Filter Buttons (veliki) */}
      <div className="mx-auto mt-[110px] flex w-[1720px] justify-between gap-[26px] px-[101px]">
        {/* Morske plaže */}
        <button
          className="relative flex h-[100px] w-[323px] items-center justify-center overflow-hidden rounded-[10px] px-[53px] py-[27px] font-[Figtree] text-[16px] font-bold leading-[100%] text-white"
          style={{ backgroundColor: "#0069AB" }}
        >
          <img
            src="/images/categories/morskeplaze.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
          <span className="relative z-10 flex items-center gap-[8px]">
            <img
              src="/images/categories/sunset.png"
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
            Morske plaže
          </span>
        </button>

        {/* Plaže ob jezeru */}
        <button
          className="relative flex h-[100px] w-[323px] items-center justify-center overflow-hidden rounded-[10px] px-[53px] py-[27px] font-[Figtree] text-[16px] font-bold leading-[100%] text-white"
          style={{ backgroundColor: "#4CC07E" }}
        >
          <img
            src="/images/categories/plazaobjezeru.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
          <span className="relative z-10 flex items-center gap-[8px]">
            <img
              src="/images/categories/gozd.png"
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
            Plaže ob jezeru
          </span>
        </button>

        {/* Plaže ob reki */}
        <button
          className="relative flex h-[100px] w-[323px] items-center justify-center overflow-hidden rounded-[10px] px-[53px] py-[27px] font-[Figtree] text-[16px] font-bold leading-[100%] text-white"
          style={{ backgroundColor: "#4CC07E" }}
        >
          <img
            src="/images/categories/plazeobreki.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
          <span className="relative z-10 flex items-center gap-[8px]">
            <img
              src="/images/categories/reka.png"
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
            Plaže ob reki
          </span>
        </button>

        {/* Zunanji bazeni */}
        <button
          className="relative flex h-[100px] w-[323px] items-center justify-center overflow-hidden rounded-[10px] px-[53px] py-[27px] font-[Figtree] text-[16px] font-bold leading-[100%] text-white"
          style={{ backgroundColor: "#42D4F4" }}
        >
          <img
            src="/images/categories/bazen.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
          <span className="relative z-10 flex items-center gap-[8px]">
            <img
              src="/images/categories/reka.png"
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
            Zunanji bazeni
          </span>
        </button>

        {/* Pokriti bazeni, terme */}
        <button
          className="relative flex h-[100px] w-[323px] items-center justify-center overflow-hidden rounded-[10px] px-[53px] py-[27px] font-[Figtree] text-[16px] font-bold leading-[100%] text-white"
          style={{ backgroundColor: "#42D4F4" }}
        >
          <img
            src="/images/categories/pokritibazen.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-10"
          />
          <span className="relative z-10 flex items-center gap-[8px]">
            <img
              src="/images/categories/reka.png"
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
            Pokriti bazeni, terme
          </span>
        </button>
      </div>
    </section>
  );
};

export default BeachCategorySearch;

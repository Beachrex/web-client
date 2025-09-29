"use client";
// Removed unused imports to fix lint warnings
// import { useTranslations } from "next-intl";
// import dynamic from "next/dynamic";
import React from "react";
import Image from "next/image";

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
  // Commented out unused translation hook to fix lint warning
  // const t = useTranslations("HomePage");

  return (
    <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 flex flex-col lg:flex-row lg:justify-between items-center gap-8 lg:gap-12">
      {/* Levi blok (tekst + gumb) */}
      <div className="flex flex-col gap-6 lg:gap-10 w-full lg:w-auto lg:max-w-md xl:max-w-lg">
        {/* Naslov */}
        <h2 className="font-figtree text-2xl md:text-3xl lg:text-[30px] font-bold leading-tight lg:leading-[30px] text-variable-collection-temno-modro">
          Brskaj po zemljevidu z več kot 1500 plažami
        </h2>

        {/* Opis */}
        <p className="font-figtree text-base md:text-lg lg:text-[17px] font-normal leading-relaxed lg:leading-[24px] text-[#4D4D4D]">
          Odkrij najlepše plaže po svetu s pomočjo interaktivnega zemljevida, ki
          vsebuje več kot 1500 čudovitih lokacij. Ne glede na to, ali iščeš
          peščene rajske obale, skrite zalive ali priljubljene destinacije za
          deskanje, boš našel popolno plažo zase. Preveri opise, ocene in
          fotografije ter načrtuj svojo naslednjo sanjsko avanturo ob morju!
        </p>

        {/* Gumb */}
        <button className="font-figtree flex w-full sm:w-auto sm:max-w-[220px] items-center justify-center gap-2 rounded-md bg-variable-collection-temno-modro px-5 py-2.5 text-sm text-white shadow transition hover:bg-[#162f4f]">
          <Image
            src="/images/map.png"
            alt="map icon"
            width={20}
            height={20}
          />
          Poglej zemljevid plaž
        </button>
      </div>

      <div className="relative w-full lg:flex-1 max-w-2xl lg:max-w-none overflow-hidden">
        <div className="relative aspect-[16/9] lg:aspect-[2/1] w-full">
          <Image
            src="/images/worldmap.png"
            alt="World map"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default WorldMapSection;

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
    <section className="relative mx-auto mt-[80px] flex h-[569px] w-[1718px] justify-between">
      {/* Levi blok (tekst + gumb) */}
      <div className="flex h-[336px] w-[409px] flex-col gap-[40px]">
        {/* Naslov */}
        <h2 className="font-figtree h-[72px] w-[360px] text-[30px] font-bold leading-[30px] text-variable-collection-temno-modro">
          Brskaj po zemljevidu z več kot 1500 plažami
        </h2>

        {/* Opis */}
        <p className="font-figtree text-[17px] font-normal leading-[24px] text-[#4D4D4D]">
          Odkrij najlepše plaže po svetu s pomočjo interaktivnega zemljevida, ki
          vsebuje več kot 1500 čudovitih lokacij. Ne glede na to, ali iščeš
          peščene rajske obale, skrite zalive ali priljubljene destinacije za
          deskanje, boš našel popolno plažo zase. Preveri opise, ocene in
          fotografije ter načrtuj svojo naslednjo sanjsko avanturo ob morju!
        </p>

        {/* Gumb */}
        <button className="font-figtree flex w-[220px] items-center gap-2 rounded-md bg-variable-collection-temno-modro px-5 py-2.5 text-[14px]  text-white shadow transition hover:bg-[#162f4f]">
          <Image
            src="/images/map.png"
            alt="map icon"
            width={20}
            height={20}
          />
          Poglej zemljevid plaž
        </button>
      </div>

      <div className="relative h-[569px] w-[1127px] overflow-hidden">
        <Image
          src="/images/worldmap.png"
          alt="World map"
          fill
          className="object-cover"
        />
      </div>
    </section>
  );
};

export default WorldMapSection;

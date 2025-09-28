"use client";
import Image from "next/image";
import React from "react";

const TestimonialsSection: React.FC = () => {
  return (
    <section className="w-full bg-white">
      {/* 1. vrstica slik */}
      <div className="container mx-auto mt-[110px] flex max-w-[1724px] gap-[26px] px-4">
        <div className="relative h-[275px] w-[849px] overflow-hidden rounded-[10px]">
          <Image
            src="/images/testimonial/best.jpg"
            alt="Najlepših plaž"
            fill
            className="object-cover"
          />

          {/* Overlay box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[116px] w-[368px] flex-col items-center justify-center gap-[40px]">
              {/* Naslov */}
              <h3 className="font-figtree text-center text-[30px] font-bold leading-none text-white">
                100 najlepših plaž na svetu
              </h3>

              {/* Gumb */}
              <button className="flex items-center gap-[20px] rounded-[6px] bg-[#1A3C68] px-[20px] py-[11px] text-[14px] font-bold text-white">
                <Image
                  src="/images/map.png"
                  alt="Map icon"
                  width={26}
                  height={26}
                />
                <span>Zemljevid plaž</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[275px] w-[849px] overflow-hidden rounded-[10px]">
          <Image
            src="/images/testimonial/discover.jpg"
            alt="Odkrij plaže"
            fill
            className="object-cover"
          />

          {/* Overlay box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[116px] w-[450px] flex-col items-center justify-center gap-[40px]">
              {/* Naslov */}
              <h3 className="font-figtree text-center text-[30px] font-bold leading-none text-white">
                Odkrij plažne zgodbe in nasvete
              </h3>

              {/* Gumb */}
              <button
                className="flex items-center gap-[8px] rounded-[6px] bg-[#F5F5F5] px-[20px] py-[11px] text-[14px] font-bold text-[#4D4D4D]"
                style={{ width: "167px", height: "41px" }}
              >
                <Image
                  src="/images/blog.png"
                  alt="Blog icon"
                  width={20}
                  height={20}
                />
                <span>Brskaj po blogu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. vrstica slik */}
      <div className="container mx-auto mt-[25px] flex max-w-[1724px] gap-[26px] px-4">
        <div className="relative h-[275px] w-[849px] overflow-hidden rounded-[10px]">
          <Image
            src="/images/testimonial/relax.jpg"
            alt="Odpočijte si"
            fill
            className="object-cover"
          />

          {/* Overlay box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[116px] w-[450px] flex-col items-center justify-center gap-[40px]">
              {/* Naslov */}
              <h3 className="font-figtree text-center text-[30px] font-bold leading-none text-white">
                Odpočijte si v udobni nastanitvi
              </h3>

              {/* Gumb */}
              <button
                className="flex items-center gap-[8px] rounded-[6px] bg-[#008260] px-[20px] py-[11px] text-[14px] font-bold text-white"
                style={{ width: "206px", height: "41px" }}
              >
                <Image
                  src="/images/accomodation.png"
                  alt="Accomodation icon"
                  width={20}
                  height={20}
                />
                <span>Brskaj po nastanitvah</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[275px] w-[849px] overflow-hidden rounded-[10px]">
          <Image
            src="/images/testimonial/taste.jpg"
            alt="Odkrij plažo po svojem okusu"
            fill
            className="object-cover"
          />

          {/* Overlay box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[116px] w-[450px] flex-col items-center justify-center gap-[40px]">
              {/* Naslov */}
              <h3 className="font-figtree text-center text-[30px] font-bold leading-none text-white">
                Odkrij plažo po svojem okusu
              </h3>

              {/* Gumb (identičen prvi sliki) */}
              <button className="flex items-center gap-[20px] rounded-[6px] bg-[#1A3C68] px-[20px] py-[11px] text-[14px] font-bold text-white">
                <Image
                  src="/images/map.png"
                  alt="Map icon"
                  width={26}
                  height={26}
                />
                <span>Zemljevid plaž</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[100px] text-center">
        <h2 className="font-[Damion] text-[60px] font-normal leading-none text-variable-collection-temno-modro">
          Raziskuj, sanjaj, odkrivaj rajske plaže!
        </h2>
      </div>
    </section>
  );
};

export default TestimonialsSection;

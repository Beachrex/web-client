"use client";
import Image from "next/image";
import React from "react";

const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* First row */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Best beaches card */}
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-72 lg:h-80">
            <Image
              src="/images/testimonial/best.jpg"
              alt="Najlepših plaž"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Overlay content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <h3 className="mb-4 text-xl font-bold leading-tight text-white sm:mb-6 sm:text-2xl lg:text-3xl">
                  100 najlepših plaž na svetu
                </h3>
                <button className="inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2a4c78] sm:gap-3 sm:px-5 sm:py-3 sm:text-base">
                  <Image
                    src="/images/map.png"
                    alt="Map icon"
                    width={20}
                    height={20}
                    className="sm:h-6 sm:w-6"
                  />
                  <span>Zemljevid plaž</span>
                </button>
              </div>
            </div>
          </div>

          {/* Discover stories card */}
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-72 lg:h-80">
            <Image
              src="/images/testimonial/discover.jpg"
              alt="Odkrij plaže"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Overlay content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <h3 className="mb-4 text-xl font-bold leading-tight text-white sm:mb-6 sm:text-2xl lg:text-3xl">
                  Odkrij plažne zgodbe in nasvete
                </h3>
                <button className="inline-flex items-center gap-2 rounded-md bg-[#F5F5F5] px-4 py-2 text-sm font-bold text-[#4D4D4D] transition-colors hover:bg-white sm:gap-3 sm:px-5 sm:py-3 sm:text-base">
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

        {/* Second row */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8">
          {/* Relax accommodation card */}
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-72 lg:h-80">
            <Image
              src="/images/testimonial/relax.jpg"
              alt="Odpočijte si"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Overlay content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <h3 className="mb-4 text-xl font-bold leading-tight text-white sm:mb-6 sm:text-2xl lg:text-3xl">
                  Odpočijte si v udobni nastanitvi
                </h3>
                <button className="inline-flex items-center gap-2 rounded-md bg-[#008260] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#006b4f] sm:gap-3 sm:px-5 sm:py-3 sm:text-base">
                  <Image
                    src="/images/accomodation.png"
                    alt="Accommodation icon"
                    width={20}
                    height={20}
                  />
                  <span>Brskaj po nastanitvah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Discover by taste card */}
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-72 lg:h-80">
            <Image
              src="/images/testimonial/taste.jpg"
              alt="Odkrij plažo po svojem okusu"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* Overlay content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <h3 className="mb-4 text-xl font-bold leading-tight text-white sm:mb-6 sm:text-2xl lg:text-3xl">
                  Odkrij plažo po svojem okusu
                </h3>
                <button className="inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2a4c78] sm:gap-3 sm:px-5 sm:py-3 sm:text-base">
                  <Image
                    src="/images/map.png"
                    alt="Map icon"
                    width={20}
                    height={20}
                    className="sm:h-6 sm:w-6"
                  />
                  <span>Zemljevid plaž</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-12 text-center sm:mt-16 lg:mt-20">
          <h2 className="text-3xl font-normal leading-tight text-variable-collection-temno-modro sm:text-4xl lg:text-5xl xl:text-6xl" style={{ fontFamily: 'Damion, cursive' }}>
            Raziskuj, sanjaj, odkrivaj rajske plaže!
          </h2>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

"use client";
import Image from "next/image";
import React from "react";

interface Destination {
  name: string;
  image: string;
  accomodationCount: number;
  price: string;
  beachCount: number;
}

const destinations: Destination[] = [
  {
    name: "Hrvaška",
    image: "/images/topdestination/croatia.jpg",
    accomodationCount: 5,
    price: "od 25€",
    beachCount: 112,
  },
  {
    name: "Italija",
    image: "/images/topdestination/italy.jpg",
    accomodationCount: 5,
    price: "od 25€",
    beachCount: 112,
  },
  {
    name: "Španija",
    image: "/images/topdestination/spain.jpg",
    accomodationCount: 5,
    price: "od 25€",
    beachCount: 112,
  },
  {
    name: "Grčija",
    image: "/images/topdestination/greece.jpg",
    accomodationCount: 5,
    price: "od 25€",
    beachCount: 112,
  },
  {
    name: "Portugalska",
    image: "/images/topdestination/portugal.jpg",
    accomodationCount: 5,
    price: "od 25€",
    beachCount: 112,
  },
];

const TopDestinationsSection: React.FC = () => {
  const allDestinations = [...destinations];

  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center lg:mb-12">
          <h2 className="text-2xl font-bold text-[#0A2342] sm:text-3xl lg:text-4xl">
            Najlepše obalne destinacije sveta
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-[#0A2342] hover:underline sm:text-base"
          >
            Vse države &gt;
          </a>
        </div>

        {/* Destinations grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
          {allDestinations.map((d, idx) => (
            <div
              key={`${d.name}-${idx}`}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative h-48 w-full sm:h-56 lg:h-48 xl:h-56">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="object-cover"
                />

                {/* Badge */}
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0A2342] sm:text-sm">
                  Morska doživetja
                </div>

                {/* Info row - Hidden on mobile, shown on larger screens */}
                <div className="absolute bottom-2 left-2 right-2 hidden gap-2 sm:flex">
                  {/* Left info */}
                  <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#008260] px-2 py-2 text-white">
                    <Image
                      src="/images/accomodation.png"
                      alt="Accommodation"
                      width={16}
                      height={16}
                    />
                    <span className="text-xs font-medium">
                      {d.accomodationCount} | {d.price}
                    </span>
                  </div>

                  {/* Right info */}
                  <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#0069AB] px-2 py-2 text-white">
                    <Image
                      src="/images/beach.png"
                      alt="Beaches"
                      width={16}
                      height={16}
                    />
                    <span className="text-xs font-medium">
                      {d.beachCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between bg-[#F8E2E2] p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/topdestination/country.png"
                    alt="Country flag"
                    width={24}
                    height={24}
                    className="sm:h-8 sm:w-8"
                  />
                  <span className="text-lg font-bold text-[#0A2342] sm:text-xl">{d.name}</span>
                </div>
                <Image
                  src="/images/topdestination/icon.png"
                  alt="More info"
                  width={24}
                  height={24}
                  className="sm:h-8 sm:w-8"
                />
              </div>

              {/* Mobile info row - Shown only on mobile */}
              <div className="flex gap-2 bg-gray-50 p-3 sm:hidden">
                <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#008260] px-2 py-2 text-white">
                  <Image
                    src="/images/accomodation.png"
                    alt="Accommodation"
                    width={16}
                    height={16}
                  />
                  <span className="text-xs font-medium">
                    {d.accomodationCount} | {d.price}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-1 rounded bg-[#0069AB] px-2 py-2 text-white">
                  <Image
                    src="/images/beach.png"
                    alt="Beaches"
                    width={16}
                    height={16}
                  />
                  <span className="text-xs font-medium">
                    Plaže: {d.beachCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopDestinationsSection;

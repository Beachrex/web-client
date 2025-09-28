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
    <section className="relative h-[541px] w-[1920px] bg-[#F5F5F5]">
      <div className="absolute left-[100px] right-[100px] top-[100px] h-[367px]">
        {/* Header */}
        <h2 className="absolute left-0 top-0 text-[30px] font-bold text-[#0A2342]">
          Najlepše obalne destinacije sveta
        </h2>
        <a
          href="#"
          className="absolute right-[100px] top-0 text-[16px] font-medium text-[#0A2342] hover:underline"
        >
          Vse države &gt;
        </a>

        {/* Destinations grid */}

        <div className="mt-[60px] flex h-[307px] w-full gap-[20px]">
          {allDestinations.map((d, idx) => (
            <div
              key={`${d.name}-${idx}`}
              className="h-[307px] w-[265px] shrink-0 overflow-hidden rounded-[10px] bg-white shadow"
            >
              {/* Image */}
              <div className="relative h-[240px] w-full">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="rounded-t-[10px] object-cover"
                />

                {/* Badge */}
                <div className="absolute left-[12px] top-[13px] rounded-[16px] bg-white/80 px-3 py-1 text-sm font-medium text-[#0A2342]">
                  Morska doživetja
                </div>

                {/* Info row */}
                <div className="absolute bottom-[10px] left-[10px] flex items-center gap-[8px]">
                  {/* Left info */}
                  <div className="flex h-[41px] w-[115px] items-center justify-center gap-[10px] rounded-[6px] bg-[#008260] px-3 text-white">
                    <Image
                      src="/images/accomodation.png"
                      alt="Accomodation"
                      width={20}
                      height={20}
                    />
                    <span className="text-[14px] font-medium leading-[17px]">
                      5
                    </span>
                    <span className="text-[14px] font-medium leading-[17px]">
                      |
                    </span>
                    <span className="text-[14px] font-semibold leading-[17px]">
                      od 25€
                    </span>
                  </div>

                  {/* Right info */}
                  <div className="flex h-[41px] w-[115px] items-center justify-center gap-[10px] rounded-[6px] bg-[#0069AB] px-3 text-white">
                    <Image
                      src="/images/beach.png"
                      alt="Beaches"
                      width={26}
                      height={26}
                    />
                    <span className="text-[14px] font-medium leading-[17px]">
                      Plaže:
                    </span>
                    <span className="text-[14px] font-medium leading-[17px]">
                      112
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex h-[67px] w-full items-center justify-between rounded-b-[10px] bg-[#F8E2E2] px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/topdestination/country.png"
                    alt="drzava"
                    width={32}
                    height={32}
                  />
                  <span className="text-[20px] font-bold">{d.name}</span>
                </div>
                <Image
                  src="/images/topdestination/icon.png"
                  alt="ikona"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopDestinationsSection;

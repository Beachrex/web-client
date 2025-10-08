'use client';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';

export function PropertyCard() {
  return (
    <div className="w-[289px] max-w-[289px] overflow-hidden rounded-[10px] bg-white shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg">
      {/* Top banner */}
      <div
        className="relative h-[196px] w-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/propertycard/card-banner.jpg')",
        }}
      >
        {/* Top left badges */}
        <div className="absolute left-2 top-2 flex gap-1">
          {/* Najbolj obiskano */}
          <div className="flex items-center rounded-[12px] bg-white px-[8px] py-[2px]">
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              Najbolj obiskano
            </span>
          </div>

          {/* Ocena */}
          <div className="flex items-center gap-1 rounded-[12px] bg-[#F5F5F5] px-[8px] py-[2px]">
            <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              4.9
            </span>
          </div>
        </div>

        {/* Top right heart */}
        <div className="absolute right-2 top-2">
          <Heart
            size={22}
            className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {/* Green tag */}
          <div className="flex items-center gap-1 rounded bg-[#008260] px-2 py-[3px] text-white">
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
              width={14}
              height={14}
            />
            <span className="text-[10px] font-medium">od 25 €</span>
          </div>

          {/* Orange tag with flag */}
          <div className="flex items-center gap-1 rounded-[8px] bg-[#FF8000] px-[8px] py-[6px]">
            <span className="text-[12px] font-bold text-white">Baška</span>
            <Image
              src="/images/propertycard/croatia-icon.png"
              alt="Croatia flag"
              width={28}
              height={28}
            />
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-[2px] rounded-b-[10px] bg-[#E5F2FB] px-3 py-2">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h3 className="font-figtree text-[16px] font-bold text-[#0069AB]">
            Plaza Ladinka
          </h3>
          <Image
            src="/images/propertycard/location.png"
            alt="location"
            width={24}
            height={24}
          />
        </div>

        {/* Content row */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium leading-4 text-[#4D4D4D]">
            Sup <span className="mx-1">•</span> Diving{' '}
            <span className="mx-1">•</span> Windsurfing
            <span className="mx-1">•</span> Coffee{' '}
            <span className="mx-1">•</span>
            <span className="font-bold">Crowded</span>
          </p>

          {/* Right icons */}
          <div className="flex gap-1">
            <Image
              src="/images/propertycard/stones.png"
              alt="stones"
              width={20}
              height={20}
            />
            <Image
              src="/images/propertycard/family.png"
              alt="family"
              width={20}
              height={20}
            />
            <Image
              src="/images/propertycard/parking.png"
              alt="parking"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;

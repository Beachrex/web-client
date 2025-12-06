'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { Carousel, type CustomFlowbiteTheme } from 'flowbite-react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';

import { useIsMobile } from '@/hooks/useIsMobile';
import { buildCdnUrl } from '@/lib/utils/beach-images';

export interface PropertyCardProps {
  image: string;                 // fallback single image
  galleryImages?: string[];      // gallery array (optional)
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  isMostVisited?: boolean;
  countryCode?: string;
}

/* Flowbite carousel theme for desktop */
const carouselTheme: CustomFlowbiteTheme['carousel'] = {
  indicators: {
    wrapper:
      'absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 pointer-events-auto z-50',
    base: 'h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/50 data-[active=true]:bg-white shadow cursor-pointer transition',
  },
};

export default function PropertyCard({
  image,
  galleryImages = [],
  title,
  location,
  price,
  rating,
  isMostVisited,
  countryCode,
}: PropertyCardProps) {
  const { isMobile, ready } = useIsMobile();

  /* Final list of images to display */
  const imagesToShow = galleryImages.length > 0 ? galleryImages : [image];

  /* Embla carousel (mobile only) */
  const [emblaRef] = useEmblaCarousel({ loop: false });

  /* Flag image via CDN */
  const flagUrl = countryCode
    ? buildCdnUrl(`img/flag/${countryCode.toLowerCase()}.svg`, 'icon')
    : null;

  /* Avoid hydration mismatch */
  if (!ready) {
    return (
      <div className="flex h-[395px] w-full flex-col overflow-hidden rounded-[10px] bg-gray-200 animate-pulse shadow-md" />
    );
  }

  return (
    <div className="flex h-[395px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg">

      {/* --------------------- TOP IMAGE SECTION --------------------- */}
      <div className="relative grow overflow-hidden">

        {/* ---------- MOBILE: EMBLA CAROUSEL (NO DOTS) ---------- */}
        {isMobile ? (
          <div className="embla h-full overflow-hidden">
            <div className="embla__viewport h-full" ref={emblaRef}>
              <div className="embla__container flex h-full touch-pan-y">
                {imagesToShow.map((img, idx) => (
                  <div
                    key={idx}
                    className="embla__slide relative min-w-full flex-[0_0_100%] h-full"
                  >
                    <Image
                      src={img}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ---------- DESKTOP: FLOWBITE CAROUSEL WITH DOTS ---------- */
          <Carousel
            theme={carouselTheme}
            indicators
            slide={false}
            leftControl={<></>}
            rightControl={<></>}
            className="h-full"
          >
            {imagesToShow.map((img, idx) => (
              <div key={idx} className="relative h-full w-full">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ))}
          </Carousel>
        )}

        {/* ---------- TOP LEFT BADGES ---------- */}
        <div className="absolute left-2 top-2 flex gap-1">
          {isMostVisited && (
            <div className="flex items-center gap-1 rounded-[12px] bg-[#F5F5F5] px-[8px] py-[2px]">
              <span className="text-[10px] font-semibold text-[#4D4D4D]">
                Most visited
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-[12px] bg-[#F5F5F5] px-[8px] py-[2px]">
            <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
            <span className="text-[10px] font-semibold text-[#4D4D4D]">
              {Number(rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>

        {/* ---------- HEART ICON ---------- */}
        <div className="absolute right-2 top-2">
          <Heart
            size={22}
            className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* ---------- BOTTOM OVERLAY (PRICE + LOCATION) ---------- */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between">

          {/* Price tag */}
          <div className="pointer-events-auto flex h-[40px] items-center gap-1 rounded bg-[#008260] px-3 text-white">
            <Image
              src="/images/accomodation.png"
              alt="Accommodation"
              width={16}
              height={16}
            />
            <span className="text-[12px] font-medium">from {price} €</span>
          </div>

          {/* Location tag + flag */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px]">
              <span className="text-[12px] font-bold text-white">
                {location}
              </span>
            </div>

            <div className="h-[41px] w-[42px] overflow-hidden rounded-[6px] shadow-sm">
              <Image
                src={flagUrl ?? '/images/propertycard/default-flag.png'}
                alt="flag"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --------------------- BOTTOM INFO SECTION --------------------- */}
      <div className="flex shrink-0 flex-col gap-[2px] rounded-b-[10px] bg-[#E5F2FB] px-4 py-3 lg:px-5 lg:py-4">

        <div className="flex items-center justify-between">
          <h3 className="font-figtree text-[20px] font-bold tracking-tight text-[#0069AB]">
            {title}
          </h3>

          <div className="pr-[2px]">
            <Image
              src="/images/propertycard/location.png"
              alt="location icon"
              width={32}
              height={32}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <p className="flex-1 text-[12px] font-medium leading-[1.2rem] tracking-tight text-[#4D4D4D]">
            Sup • Diving • Windsurfing • Coffee •{' '}
            <span className="font-bold">Crowded</span>
          </p>

          <div className="flex shrink-0 gap-5 pr-[2px]">
            <Image
src="/images/propertycard/stones.png" width={26} height={26}
alt="stones"
            />
            <Image
src="/images/propertycard/family.png" width={26} height={26}
alt="family"
            />
            <Image
src="/images/propertycard/parking.png" width={26} height={26}
alt="parking"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { Carousel, type CustomFlowbiteTheme } from 'flowbite-react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { PropertyMediaContext } from '../PropertySection';

export interface PropertyCardProps {
  image: string;
  galleryImages?: string[];

  sphereThumbnail?: string;
  sphereTourUrl?: string;

  videoEmbedUrl?: string;

  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  isMostVisited?: boolean;
  countryCode?: string;
}

const carouselTheme: CustomFlowbiteTheme['carousel'] = {
  indicators: {
    wrapper:
      'absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 pointer-events-auto z-50',
    base: 'h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-white/50 data-[active=true]:bg-white shadow transition cursor-pointer',
  },
};

export default function PropertyCard({
  image,
  galleryImages = [],
  sphereThumbnail,
  sphereTourUrl,
  videoEmbedUrl,
  title,
  location,
  price,
  rating,
  isMostVisited,
  countryCode,
}: PropertyCardProps) {
  const { isMobile, ready } = useIsMobile();

  const { mediaMode, openSphere, openVideo } =
    React.useContext(PropertyMediaContext);

  /**
   * IMAGES TO SHOW
   * -------------------------------
   * - gallery mode → galleryImages
   * - sphere mode → sphereThumbnail (fallback = image)
   * - video mode → still show main image (no thumbnails needed)
   */
  const imagesToShow =
    mediaMode === 'sphere' && sphereThumbnail
      ? [sphereThumbnail]
      : mediaMode === 'video' && videoEmbedUrl
      ? [image] // keep same image, do NOT add thumbnails
      : galleryImages.length > 0
      ? galleryImages
      : [image];

  const [emblaRef] = useEmblaCarousel({ loop: false });

  const flagUrl = countryCode
    ? buildCdnUrl(`img/flag/${countryCode.toLowerCase()}.svg`, 'icon')
    : null;

  if (!ready) {
    return (
      <div className="flex h-[395px] w-full rounded-[10px] bg-gray-200 animate-pulse shadow-md" />
    );
  }

  /**
   * CARD CLICK HANDLER
   * ------------------------------------
   * - gallery: do nothing
   * - sphere: open fullscreen sphere viewer
   * - video: open fullscreen YT video
   */
  const handleClick = () => {
    if (mediaMode === 'sphere' && sphereTourUrl) {
      openSphere(sphereTourUrl);
      return;
    }
    if (mediaMode === 'video' && videoEmbedUrl) {
      openVideo(videoEmbedUrl);
      return;
    }
  };

  return (
    <div
      className="flex h-[395px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md hover:-translate-y-[3px] hover:shadow-lg transition-all duration-300"
      onClick={handleClick}
      style={{ cursor: mediaMode !== 'gallery' ? 'pointer' : 'default' }}
    >
      <div className="relative grow overflow-hidden">

        {/* MOBILE EMBLA */}
        {isMobile ? (
          <div className="embla h-full overflow-hidden">
            <div className="embla__viewport h-full" ref={emblaRef}>
              <div className="embla__container flex h-full touch-pan-y">
                {imagesToShow.map((img, idx) => (
                  <div
                    key={idx}
                    className="embla__slide relative min-w-full h-full"
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
          /* DESKTOP FLOWBITE CAROUSEL */
          <Carousel
            indicators
            slide={false}
            theme={carouselTheme}
            className="h-full"
            leftControl={<></>}
            rightControl={<></>}
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

        {/* BADGES */}
        <div className="absolute left-2 top-2 flex gap-1">
          {isMostVisited && (
            <div className="px-[8px] py-[2px] bg-[#F5F5F5] rounded-[12px] flex items-center gap-1">
              <span className="text-[10px] text-[#4D4D4D] font-semibold">
                Most visited
              </span>
            </div>
          )}

          <div className="px-[8px] py-[2px] bg-[#F5F5F5] rounded-[12px] flex items-center gap-1">
            <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
            <span className="text-[10px] text-[#4D4D4D] font-semibold">
              {Number(rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>

        {/* HEART ICON */}
        <div className="absolute right-2 top-2">
          <Heart
            size={22}
            className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* BOTTOM LABELS */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none">
          <div className="pointer-events-auto flex h-[40px] items-center gap-1 bg-[#008260] text-white px-3 rounded">
            <Image
              src="/images/accomodation.png"
              alt="acc"
              width={16}
              height={16}
            />
            <span className="text-[12px] font-medium">from {price} €</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px]">
              <span className="text-[12px] font-bold text-white">
                {location}
              </span>
            </div>

            <div className="h-[40px] w-[50px] overflow-hidden rounded-[6px]">
              <Image
                src={flagUrl ?? '/images/propertycard/default-flag.png'}
                width={50}
                height={40}
                alt="flag"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM DETAILS */}
      <div className="bg-[#E5F2FB] px-4 py-3 lg:px-5 lg:py-4 rounded-b-[10px] flex flex-col gap-[2px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[#0069AB] text-[20px] font-bold">{title}</h3>
          <div className="pr-[2px]">
            <Image
              src="/images/propertycard/location.png"
              alt="location"
              width={32}
              height={32}
            />
          </div>
        </div>

        <div className="flex justify-between items-center gap-x-4">
          <p className="text-[#4D4D4D] text-[12px] leading-[1.2rem] font-medium flex-1">
            Sup • Diving • Windsurfing • Coffee •{' '}
            <span className="font-bold">Crowded</span>
          </p>

          <div className="flex shrink-0 gap-5 pr-[2px]">
            <Image
              src="/images/propertycard/stones.png"
              width={26}
              height={26}
              alt="stones"
            />
            <Image
              src="/images/propertycard/family.png"
              width={26}
              height={26}
              alt="family"
            />
            <Image
              src="/images/propertycard/parking.png"
              width={26}
              height={26}
              alt="parking"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

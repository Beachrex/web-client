'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { Carousel, type CustomFlowbiteTheme } from 'flowbite-react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { PropertyMediaContext } from '../PropertySection';


function extractLookrUrl(html: string | null | undefined): string | null {
  if (!html) return null;

  // 1. Unescape \" → "
  const unescaped = html.replace(/\\"/g, '"');

  // 2. Extract href
  const match = /href\s*=\s*"([^"]+)"/i.exec(unescaped);

  return match?.[1] ?? null;
}


export interface PropertyCardProps {
  webcamEmbed?: string | null;

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
    webcamEmbed,

}: PropertyCardProps) {

  const { isMobile, ready } = useIsMobile();

  const { mediaMode } = React.useContext(PropertyMediaContext);

const [sphereActive, setSphereActive] = React.useState(false);


/* reset when switching media mode */
React.useEffect(() => {
  if (mediaMode !== 'sphere') {
    setSphereActive(false);
  }
}, [mediaMode]);


const webcamUrl = React.useMemo(
  () => extractLookrUrl(webcamEmbed),
  [webcamEmbed]
);

  /**
   * IMAGES TO SHOW
   */
  const imagesToShow =
  mediaMode === 'sphere' && sphereThumbnail
    ? [sphereThumbnail]
    : mediaMode === 'video' && videoEmbedUrl
    ? [image]
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
   * NO POPUPS ANYMORE
   * CARD CLICK DOES NOTHING IN SPHERE/VIDEO MODE
   */
const handleClick = () => {
  // Intentionally left empty
};


  return (
    <div
      className="flex h-[395px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md hover:-translate-y-[3px] hover:shadow-lg transition-all duration-300"
      onClick={handleClick}
      style={{ cursor: 'default' }}
    >
      <div className="relative grow overflow-hidden">

      {/* MEDIA DISPLAY */}
{mediaMode === 'webcam' ? (
  webcamUrl ? (
    <div className="relative h-full w-full">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* OPEN WEBCAM IN NEW TAB */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.open(webcamUrl, '_blank', 'noopener,noreferrer');
        }}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        <div className="flex items-center gap-3 rounded-full bg-black/60 px-6 py-4 backdrop-blur-sm hover:bg-black/70 transition">
          <span className="text-white text-[18px] font-bold">
            Webcam
          </span>
        </div>
      </button>
    </div>
  ) : (
    /* NO WEBCAM */
    <div className="relative h-full w-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Image
          src="/images/beachmedia/video-icon-white.png"
          alt="No webcam available"
          width={32}
          height={32}
          className="opacity-40"
        />
        <span className="text-[13px] font-semibold">
          No webcam available
        </span>
      </div>
    </div>
  )
) : mediaMode === 'sphere' ? (
  sphereTourUrl ? (
    <div className="relative h-full w-full">
      {!sphereActive ? (
        <>
          {/* THUMBNAIL */}
          <Image
            src={sphereThumbnail ?? image}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
          />

          {/* 360 BUTTON OVERLAY – CENTER */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSphereActive(true);
            }}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 rounded-full bg-black/60 px-6 py-4 backdrop-blur-sm hover:bg-black/70 transition">
              <span className="text-white text-[18px] font-bold">
                360°
              </span>
            </div>
          </button>
        </>
      ) : (
        <iframe
          src={sphereTourUrl}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  ) : (

    <div className="relative h-full w-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Image
          src="/images/beachmedia/360-degree.svg"
          alt="No 360 available"
          width={32}
          height={32}
          className="opacity-40"
        />
        <span className="text-[13px] font-semibold">
          No 360° view available
        </span>
      </div>
    </div>
  )
) : mediaMode === 'video' ? (
  videoEmbedUrl ? (
    <div className="relative h-full w-full">
      <iframe
        src={videoEmbedUrl}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  ) : (
    /* NO VIDEO */
    <div className="relative h-full w-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Image
          src="/images/beachmedia/play-button-arrowhead-white.png"
          alt="No video available"
          width={32}
          height={32}
          className="opacity-40"
        />
        <span className="text-[13px] font-semibold">
          No video available
        </span>
      </div>
    </div>
  )

) : isMobile ? (
  /* MOBILE CAROUSEL */
  <div className="embla h-full overflow-hidden">
    <div className="embla__viewport h-full" ref={emblaRef}>
      <div className="embla__container flex h-full touch-pan-y">
        {imagesToShow.map((img, idx) => (
          <div key={idx} className="embla__slide relative min-w-full h-full">
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
  /* DESKTOP CAROUSEL */
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


     {mediaMode !== 'sphere' && mediaMode !== 'video' && (
  <>
    {/* BADGES */}
    <div className="absolute left-2 top-2 flex gap-1 z-20">
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
    <div className="absolute right-2 top-2 z-20">
      <Heart
        size={22}
        className="text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
      />
    </div>
  </>
)}

{/* BOTTOM LABELS */}


{mediaMode !== 'sphere' && mediaMode !== 'video' && (
  <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none z-20">
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
        <span className="text-[12px] font-bold text-white">{location}</span>
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
)}
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


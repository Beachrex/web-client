

'use client';

import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronRight as ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import PropertyCard from './PropertyCard/PropertyCard';

export interface Property {
  beachUrl?: string;
  webcamEmbed?: string | null;
  id: string;
  image: string;
  galleryImages: string[];

  sphereThumbnail?: string;
  sphereTourUrl?: string;

  videoEmbedUrl?: string;

  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: string;
  isFreeBreakfast?: boolean;
  isFreeCancellation?: boolean;
  isMostVisited?: boolean;
  countryCode?: string;
}

interface PropertySectionProps {
  title: string;
  totalCount?: number;
  properties: Property[];
  headerRight?: React.ReactNode;
}

interface PropertyCarouselProps {
  items: Property[];
}

/* -----------------------------------------------------
   CONTEXT za mediaMode (gallery | sphere | video)
------------------------------------------------------ */
const noop = () => undefined;


export const PropertyMediaContext = React.createContext({
  mediaMode: 'gallery' as 'gallery' | 'sphere' | 'video' | 'webcam',
  openSphere: (_url: string) => noop(),
  openVideo: (_url: string) => noop(),
});


/* -----------------------------------------------------
   EMBLA CAROUSEL
------------------------------------------------------ */
function PropertyEmblaCarousel({ items = [] }: PropertyCarouselProps) {
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1536) setItemsPerSlide(4);
      else if (w >= 1280) setItemsPerSlide(3);
      else if (w >= 640) setItemsPerSlide(2);
      else setItemsPerSlide(1);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const slides = useMemo(() => {
    const chunks: Property[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunks.push(items.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [items, itemsPerSlide]);

  const [emblaRef, embla] = useEmblaCarousel({
    dragFree: false,
    loop: false,
    watchDrag: false,
  });

  const scrollPrev = () => embla?.scrollPrev();
  const scrollNext = () => embla?.scrollNext();

  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((chunk, idx) => (
            <div key={idx} className="embla__slide flex-shrink-0 w-full px-1">
              <div className="grid grid-cols-1 h-full gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {chunk.map((card, i) => (
                  <PropertyCard key={`${idx}_${i}`} {...card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARROWS */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}

/* -----------------------------------------------------
   PROPERTY SECTION
------------------------------------------------------ */
export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  totalCount = 124,
  properties,
  headerRight,
}) => {
  const t = useTranslations('PropertySection');

 const [mediaMode, setMediaMode] =
  useState<'gallery' | 'sphere' | 'video' | 'webcam'>('gallery');
const hasAnyWebcam = React.useMemo(
  () => properties.some((p) => Boolean(p.webcamEmbed)),
  [properties]
);


  return (
    <section className="relative overflow-x-hidden bg-white py-10 sm:py-14 lg:py-20">
      <div className="pointer-events-none absolute left-0 top-1/2 -z-10 -translate-y-1/2">
        <div className="relative h-[400px] w-[250px] opacity-70 sm:w-[300px] lg:w-[350px]">
          <Image
            src="/images/propertycard/beach-gray.png"
            alt="decor beach"
            width={400}
            height={400}
            className="h-full w-full object-contain object-left"
            priority
          />
        </div>
      </div>

      <div className="container relative z-10 mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-6">
          <h2 className="font-figtree text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#222222]">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-[16px]">
            {/* DISPLAY TOGGLE */}
            <div className="flex items-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              <div className="flex items-center gap-[10px]">

                {/* GALLERY */}
                <button
                  onClick={() => setMediaMode('gallery')}
                  className={`relative p-1 rounded-[6px] transition-all duration-150 ${
                    mediaMode === 'gallery'
                      ? 'bg-[#D9EBF6] shadow-inner'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src="/images/beachmedia/photo.png"
                    width={24}
                    height={24}
                    alt="gallery"
                  />
                  {mediaMode === 'gallery' && (
                    <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
                  )}
                </button>

                <div className="h-[25px] w-[1px] bg-white" />


  {/* VIDEO */}
                <button
                  onClick={() =>
                    setMediaMode((m) => (m === 'video' ? 'gallery' : 'video'))
                  }
                  className={`relative p-1 rounded-[6px] transition-all duration-150 ${
                    mediaMode === 'video'
                      ? 'bg-[#D9EBF6] shadow-inner'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src="/images/beachmedia/play-button-arrowhead-white.png"
                    width={24}
                    height={24}
                    alt="video"
                  />
                  {mediaMode === 'video' && (
                    <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
                  )}
                </button>

                <div className="h-[25px] w-[1px] bg-white" />

                {/* SPHERE */}
                <button
                  onClick={() =>
                    setMediaMode((m) => (m === 'sphere' ? 'gallery' : 'sphere'))
                  }
                  className={`relative p-1 rounded-[6px] transition-all duration-150 ${
                    mediaMode === 'sphere'
                      ? 'bg-[#D9EBF6] shadow-inner'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src="/images/beachmedia/360-degree-white.png"
                    width={24}
                    height={24}
                    alt="360"
                  />
                  {mediaMode === 'sphere' && (
                    <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
                  )}
                </button>

                <div className="h-[25px] w-[1px] bg-white" />


  {/* WEBCAM */}
{hasAnyWebcam ? (
  <button
    onClick={() =>
      setMediaMode((m) => (m === 'webcam' ? 'gallery' : 'webcam'))
    }
    className={`relative p-1 rounded-[6px] transition-all duration-150 ${
      mediaMode === 'webcam'
        ? 'bg-[#D9EBF6] shadow-inner'
        : 'opacity-60 hover:opacity-100'
    }`}
  >
    <Image
      src="/images/beachmedia/video-icon-white.png"
      width={24}
      height={24}
      alt="webcam"
    />
    {mediaMode === 'webcam' && (
      <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
    )}
  </button>
) : (
  <div className="opacity-40 cursor-not-allowed p-1">
    <Image
      src="/images/beachmedia/video-icon-white.png"
      width={24}
      height={24}
      alt="webcam"
    />
  </div>
)}


              </div>
            </div>

            {headerRight ?? (
              <a
                href="#"
                className="flex items-center gap-1 font-figtree text-[14px] font-bold text-[#8D8D8D] underline hover:text-[#555]"
              >
                {t('allBeachesLink', { count: totalCount })}
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* CARDS */}
       <PropertyMediaContext.Provider
  value={{
    mediaMode,
    openSphere: noop,
    openVideo: noop,
  }}
       >

          <PropertyEmblaCarousel items={properties} />
        </PropertyMediaContext.Provider>
      </div>
    </section>
  );
};

export default PropertySection;


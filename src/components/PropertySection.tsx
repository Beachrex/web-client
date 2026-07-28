

'use client';

import {
  ChevronRight as ArrowRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard/PropertyCard';

// Dynamically import PropertyCarousel to reduce initial bundle size
const PropertyCarousel = dynamic(
  () => import('./PropertySection/PropertyCarousel'),
  {
    loading: () => (
      <div className="flex h-[395px] w-full items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    ),
    ssr: false,
  }
);

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
  locationUrl?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: string;
  isFreeBreakfast?: boolean;
  isFreeCancellation?: boolean;
  isMostVisited?: boolean;
  countryCode?: string;

  /** Up to 4 descriptive tags from the API (sporting activities, culinary, natural conditions) */
  tags?: string[];
}

interface PropertySectionProps {
  title: string;
  totalCount?: number;
  properties: Property[];
  headerRight?: React.ReactNode;
  controlsBelowHeader?: React.ReactNode;

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
   WRAPPER FOR EMBLA CAROUSEL (with responsive itemsPerSlide)
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

  if (!items.length) return null;

  return <PropertyCarousel items={items} itemsPerSlide={itemsPerSlide} />;
}

/* -----------------------------------------------------
   PROPERTY SECTION
------------------------------------------------------ */
export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  totalCount = 124,
  properties,
  controlsBelowHeader,
}) => {
  const t = useTranslations('PropertySection');
 const [expanded, setExpanded] = useState(false);
 const c = useTranslations('Common');

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

          {controlsBelowHeader && (
  <div className="flex justify-end">
    {controlsBelowHeader}
  </div>
)}

            <button
  type="button"
  onClick={() => setExpanded((v) => !v)}
  className="flex items-center gap-1 font-figtree text-[14px] font-bold text-[#8D8D8D] underline hover:text-[#555]"
            >
  {expanded
    ? c('showLess')
    : t('allBeachesLink', { count: totalCount })}

  <ArrowRight
    className={`h-4 w-4 transition-transform ${
      expanded ? 'rotate-90' : ''
    }`}
  />
</button>

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

          {expanded ? (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {properties.map((p) => (
      <PropertyCard key={p.id} {...p} />
    ))}
  </div>
) : (
  <PropertyEmblaCarousel items={properties} />
)}

        </PropertyMediaContext.Provider>
      </div>
    </section>
  );
};

export default PropertySection;


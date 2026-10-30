

'use client';

import type { BeachCardFeatures } from '@/lib/utils/beach-badges';
import {
  ChevronRight as ArrowRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard/PropertyCard';
import BeachViewToggle, { type BeachMediaMode } from './BeachViewToggle';
import { useBeachEmbedded } from './Beach/BeachEmbedContext';

// Dynamically import PropertyCarousel to reduce initial bundle size
const PropertyCarousel = dynamic(
  () => import('./PropertySection/PropertyCarousel'),
  {
    loading: () => (
      <div className="flex h-[295px] w-full items-center justify-center">
        <div className="animate-pulse text-gray-400" />
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
  features?: BeachCardFeatures | null;
  /** Distance from the current beach in km ("Nearby beaches"); the card shows it when set */
  distanceKm?: number | null;
  /** Beach coordinates: the card's map pin centers the map on them */
  latitude?: string | number | null;
  longitude?: string | number | null;
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
  mediaMode: 'gallery' as BeachMediaMode,
  openSphere: (_url: string) => noop(),
  openVideo: (_url: string) => noop(),
});


/* -----------------------------------------------------
   WRAPPER FOR EMBLA CAROUSEL (with responsive itemsPerSlide)
------------------------------------------------------ */
function PropertyEmblaCarousel({ items = [] }: PropertyCarouselProps) {
  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  // Inside the beach map panel (≤ 720px) at most two cards fit, whatever the window width.
  const embedded = useBeachEmbedded();

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (embedded) setItemsPerSlide(w >= 640 ? 2 : 1);
      else if (w >= 1536) setItemsPerSlide(4);
      else if (w >= 1280) setItemsPerSlide(3);
      else if (w >= 640) setItemsPerSlide(2);
      else setItemsPerSlide(1);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [embedded]);

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
  headerRight,
  controlsBelowHeader,
}) => {
  const t = useTranslations('PropertySection');
  const embedded = useBeachEmbedded();
 const [expanded, setExpanded] = useState(false);
 const c = useTranslations('Common');

 const [mediaMode, setMediaMode] = useState<BeachMediaMode>('gallery');
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
            alt=""
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
            <BeachViewToggle mode={mediaMode} onChange={setMediaMode} webcamAvailable={hasAnyWebcam} />

          {controlsBelowHeader && (
  <div className="flex justify-end">
    {controlsBelowHeader}
  </div>
)}

            {/* Place pages pass the real total ("All beaches (43)", a link to the full list). Without it the
                button expands this carousel; its count is the number of cards (dev 2026-10-28: the Toscana page
                showed "All beaches (20)" for a region with 43). */}
            {headerRight ?? (
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

          {expanded ? (
  <div className={embedded ? 'grid gap-6 sm:grid-cols-2' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
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


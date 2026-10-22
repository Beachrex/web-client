'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { cancelPrefetch, debouncedPrefetch, prefetchBeachDetails } from '@/lib/prefetch-utils';
import { resolveBadgeIcon } from '@/lib/utils/beach-badge-icons';
import { buildCardFeatureIcons, type BeachCardFeatures } from '@/lib/utils/beach-badges';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { parseWebcamUrl, windyIdFromPageUrl } from '@/lib/utils/webcam';
import WebcamModal from '@/components/Beach/WebcamModal';
import { useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef } from 'react';
import { FEATURES } from '@/lib/constants/features';
import { FavoriteButton } from '../Favorites/FavoriteButton';
import { PropertyMediaContext } from '../PropertySection';

// Performance logging
const ENABLE_PERF_LOGGING = false;
let propertyCardRenderCount = 0;

const moduleLoadStart = performance.now();

// Dynamically import EmblaCarousel to reduce initial bundle size
const EmblaCarousel = dynamic(
  () => import('./EmblaCarousel'),
  {
    loading: () => (
      <div className="relative h-full w-full flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-400" />
      </div>
    ),
    ssr: false,
  }
);

// Log when module finishes loading
if (ENABLE_PERF_LOGGING) {
  console.log(`✅ [PropertyCard Module] Loaded in ${(performance.now() - moduleLoadStart).toFixed(2)}ms`);
}


export interface PropertyCardProps {
  /** Beach id (string, as in `Property`); enables the favorites heart. */
  id?: string;
  webcamEmbed?: string | null;
  beachUrl?: string;
  beachSlug?: string; // Add beach slug for prefetching
  image: string;
  galleryImages?: string[];

  sphereThumbnail?: string;
  sphereTourUrl?: string;

  videoEmbedUrl?: string;

  title: string;
  location: string;
  locationUrl?: string;
  price: number;
  rating: number;
  reviews: number;
  isMostVisited?: boolean;
  countryCode?: string;
  onLocationClick?: () => void;

  /** Up to 4 descriptive tags from the API (sporting activities, culinary, natural conditions) */
  tags?: string[];

  /** Beach type, family and parking from the API (QA #45) */
  features?: BeachCardFeatures | null;
}

const PropertyCard = React.memo(function PropertyCard({
  id,
  beachUrl,
  beachSlug,
  image,
  galleryImages = [],
  sphereThumbnail,
  sphereTourUrl,
  videoEmbedUrl,
  title,
  location,
  locationUrl,
  price,
  rating,
  isMostVisited,
  countryCode,
  webcamEmbed,
  onLocationClick,
  tags,
  features,
}: PropertyCardProps) {
  const renderStartTime = useRef(performance.now());
  const currentRenderCount = useRef(++propertyCardRenderCount);

  // Performance: Log render (only first 10)
  if (ENABLE_PERF_LOGGING && currentRenderCount.current <= 10) {
    console.log(`🏖️ [PropertyCard] RENDER #${currentRenderCount.current}`, { title });
  }

  // Performance: Log when component mounts/completes
  useEffect(() => {
    if (ENABLE_PERF_LOGGING && currentRenderCount.current <= 10) {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(`✅ [PropertyCard] #${currentRenderCount.current} MOUNTED in ${renderTime.toFixed(2)}ms`, { title });
    }
  }, [title]);

  const t = useTranslations('PropertyCard');
  const tBadges = useTranslations('BottomBadgesBeach');
  const featureIcons = React.useMemo(() => buildCardFeatureIcons(features), [features]);
  const queryClient = useQueryClient();

  const { ready } = useIsMobile();

  const { mediaMode } = React.useContext(PropertyMediaContext);

const [sphereActive, setSphereActive] = React.useState(false);
const cardRef = React.useRef<HTMLDivElement>(null);


/* reset when switching media mode */
React.useEffect(() => {
  if (mediaMode !== 'sphere') {
    setSphereActive(false);
  }
}, [mediaMode]);


const webcamUrl = React.useMemo(
  () => parseWebcamUrl(webcamEmbed),
  [webcamEmbed]
);
// Owner 2026-10-22: a verified Windy webcam plays in a popup on our page; only an old pasted link opens a new tab.
const windyId = React.useMemo(() => windyIdFromPageUrl(webcamUrl), [webcamUrl]);
const [webcamOpen, setWebcamOpen] = React.useState(false);
const closeWebcam = React.useCallback(() => setWebcamOpen(false), []);

  /**
   * IMAGES TO SHOW
   * Show gallery images immediately (no lazy loading)
   */
  const imagesToShow = React.useMemo(() => {
    if (mediaMode === 'sphere' && sphereThumbnail) {
      return [sphereThumbnail];
    }
    if (mediaMode === 'video' && videoEmbedUrl) {
      return [image];
    }

    // Show gallery images if they exist, otherwise main image
    if (galleryImages.length > 0) {
      return galleryImages;
    }

    return [image];
  }, [mediaMode, sphereThumbnail, videoEmbedUrl, galleryImages, image]);

  // Memoize event handlers to prevent recreation on every render
  const handleWebcamClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (windyId) {
      setWebcamOpen(true);
    } else if (webcamUrl) {
      window.open(webcamUrl, '_blank', 'noopener,noreferrer');
    }
  }, [webcamUrl, windyId]);

  const handleSphereClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSphereActive(true);
  }, []);


  const handleLocationClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLocationClick?.();
  }, [onLocationClick]);

  /**
   * Prefetch beach details on hover to improve perceived performance
   */
  const handleMouseEnter = useCallback(() => {
    if (!beachSlug) return;

    debouncedPrefetch(async () => {
      await prefetchBeachDetails(queryClient, beachSlug);
    });
  }, [queryClient, beachSlug]);

  /**
   * Cancel prefetch if user moves mouse away quickly
   */
  const handleMouseLeave = useCallback(() => {
    cancelPrefetch();
  }, []);

  const flagUrl = countryCode
    ? buildCdnUrl(`img/flag/${countryCode.toLowerCase()}.svg`, 'icon')
    : null;

  if (!ready) {
    return (
      <div className="flex h-[295px] w-full rounded-[10px] bg-gray-200 animate-pulse shadow-md" />
    );
  }

  return (
    <div
      ref={cardRef}
      className="flex h-[295px] w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-md hover:-translate-y-[3px] hover:shadow-lg transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {webcamOpen && windyId ? (
        <WebcamModal windyId={windyId} beachName={title} onClose={closeWebcam} />
      ) : null}
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
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
      />

      {/* OPEN WEBCAM (popup for Windy, new tab for an old pasted link) */}
      <button
        type="button"
        onClick={handleWebcamClick}
        aria-haspopup={windyId ? 'dialog' : undefined}
        className="absolute inset-0 z-30 flex items-center justify-center"
      >
        <div className="flex items-center gap-3 rounded-full bg-black/60 px-6 py-4 backdrop-blur-sm hover:bg-black/70 transition">
          <span className="text-white text-[18px] font-bold">
            {t('webcamLabel')}
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
          alt={t('noWebcam')}
          width={32}
          height={32}
          className="opacity-40"
        />
        <span className="text-[13px] font-semibold">
          {t('noWebcam')}
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
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />

          {/* 360 BUTTON OVERLAY – CENTER */}
          <button
            type="button"
            onClick={handleSphereClick}
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
          alt={t('no360')}
          width={32}
          height={32}
          className="opacity-40"
        />
        <span className="text-[13px] font-semibold">
          {t('no360')}
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
          alt={t('noVideo')}
          width={32}
          height={32}
          className="opacity-40"
        />
        <span className="text-[13px] font-semibold">
          {t('noVideo')}
        </span>
      </div>
    </div>
  )
) : (
  /* CAROUSEL - Uses Embla for both mobile and desktop */
  <EmblaCarousel images={imagesToShow} title={title} />
)}
     {/* BADGES - only show when not sphere/video mode */}
     {mediaMode !== 'sphere' && mediaMode !== 'video' && (
  <>
    {/* BADGES */}
    <div className="absolute left-2 top-2 flex gap-1 z-20">
      {isMostVisited && (
        <div className="px-[8px] py-[2px] bg-[#F5F5F5] rounded-[12px] flex items-center gap-1">
          <span className="text-[10px] text-[#4D4D4D] font-semibold">
            {t('mostVisited')}
          </span>
        </div>
      )}

      {/* No rating source yet (every card had 0.0, owner 2026-10-09): the star shows only a real rating. */}
      {Number(rating) > 0 && (
        <div className="px-[8px] py-[2px] bg-[#F5F5F5] rounded-[12px] flex items-center gap-1">
          <Star size={14} className="text-[#FFD700]" fill="#FFD700" />
          <span className="text-[10px] text-[#4D4D4D] font-semibold">
            {Number(rating).toFixed(1)}
          </span>
        </div>
      )}
    </div>

    {/* FAVORITES HEART */}
    {FEATURES.favorites && Number(id) > 0 && (
      <div className="absolute right-1 top-1 z-20">
        <FavoriteButton beachId={Number(id)} />
      </div>
    )}
  </>
)}

{/* BOTTOM LABELS */}


{mediaMode !== 'sphere' && mediaMode !== 'video' && (
  <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none z-20">
    {/* Accommodation price: hidden until accommodation pricing exists (FEATURES.accommodation). */}
    {FEATURES.accommodation && (
      <div className="pointer-events-auto flex h-[40px] items-center gap-1 bg-[#008260] text-white px-3 rounded">
        <Image
          src="/images/accomodation.png"
          alt=""
          width={16}
          height={16}
        />
        <span className="text-[12px] font-medium">{t('priceFrom', { price })}</span>
      </div>
    )}

    <div className="pointer-events-auto ml-auto flex items-center gap-2">
      {locationUrl ? (
        <Link
          href={locationUrl}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px] transition-colors hover:bg-[#e67300] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="text-[12px] font-bold text-white">{location}</span>
        </Link>
      ) : (
        <div className="flex h-[40px] items-center justify-center rounded-[8px] bg-[#FF8000] px-[12px]">
          <span className="text-[12px] font-bold text-white">{location}</span>
        </div>
      )}

      <div className="h-[40px] w-[50px] overflow-hidden rounded-[6px]">
        <Image
          src={flagUrl ?? '/images/propertycard/default-flag.png'}
          width={50}
          height={40}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </div>
)}
      </div>

      {/* BOTTOM DETAILS */}
      <div className="relative z-30 pointer-events-auto bg-[#E5F2FB] px-4 py-3 lg:px-5 lg:py-4 rounded-b-[10px] flex flex-col gap-[2px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[#0069AB] text-[20px] font-bold">
  {beachUrl ? (
    <Link
      href={beachUrl}
      className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3C68] rounded"
    >
      {title}
    </Link>
  ) : (
    title
  )}
</h3>

       <button
  type="button"
  onClick={handleLocationClick}
  className="pr-[2px] hover:scale-105 transition-transform cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8000] focus-visible:ring-offset-2 rounded"
  aria-label={t('showOnMap', { title })}
       >
  <Image
    src="/images/propertycard/location.png"
    alt=""
    width={32}
    height={32}
  />
</button>

        </div>

        <div className="flex justify-between items-center gap-x-4">
          {tags && tags.length > 0 ? (
            <p className="text-[#4D4D4D] text-[12px] leading-[1.2rem] font-medium flex-1">
              {tags.join(' • ')}
            </p>
          ) : (
            <p className="text-[#4D4D4D] text-[12px] leading-[1.2rem] font-medium flex-1" />
          )}

          <div className="flex shrink-0 gap-5 pr-[2px]">
            {featureIcons.map((f) => {
              const label = f.labelKey ? tBadges(`badges.${f.labelKey}`) : (f.label ?? '');
              return (
                <Image
                  key={f.key}
                  src={resolveBadgeIcon(f.icon)}
                  width={26}
                  height={26}
                  className="h-[26px] w-[26px] object-contain"
                  alt={label}
                  title={label}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.id === nextProps.id &&
    prevProps.beachUrl === nextProps.beachUrl &&
    prevProps.beachSlug === nextProps.beachSlug &&
    prevProps.image === nextProps.image &&
    prevProps.title === nextProps.title &&
    prevProps.location === nextProps.location &&
    prevProps.price === nextProps.price &&
    prevProps.rating === nextProps.rating &&
    prevProps.isMostVisited === nextProps.isMostVisited &&
    prevProps.countryCode === nextProps.countryCode &&
    prevProps.galleryImages?.length === nextProps.galleryImages?.length &&
    prevProps.sphereTourUrl === nextProps.sphereTourUrl &&
    prevProps.videoEmbedUrl === nextProps.videoEmbedUrl &&
    prevProps.webcamEmbed === nextProps.webcamEmbed &&
    prevProps.tags?.join(',') === nextProps.tags?.join(',') &&
    JSON.stringify(prevProps.features ?? null) === JSON.stringify(nextProps.features ?? null)
  );
});

export default PropertyCard;


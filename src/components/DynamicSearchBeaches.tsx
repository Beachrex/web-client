'use client';

import { Pagination } from 'flowbite-react';
import { useTranslations, type TranslationValues } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { useAllBeaches } from '@/hooks/useBeaches';
import { buildCdnUrl } from '@/lib/utils/beach-images';

// ⭐ Import global media context used by PropertyCard
import { PropertyMediaContext } from '@/components/PropertySection';

import type { PropertyCardProps } from './PropertyCard/PropertyCard';
import PropertyCard from './PropertyCard/PropertyCard';

/* -------------------------------------------------------------
   BUILD GALLERY
-------------------------------------------------------------- */
interface GalleryItem {
  url?: string;
  order?: number | null;
}

interface BeachMediaInput {
  media?: {
    gallery?: { url?: string; order?: number | null }[];
    spheres_360?: { tour_url?: string }[];
    embeds?: { video_url?: string | null } | null;
  };
}


function buildGallery(beach: BeachMediaInput) {
  const gallery = beach.media?.gallery ?? [];

  return gallery
    .filter((img): img is GalleryItem & { url: string } => typeof img.url === 'string')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 5)
    .map((img) => buildCdnUrl(img.url, 'gallery'))
    .filter((u): u is string => Boolean(u));
}

interface DynamicSearchBeachesProps {
  translationNamespace: string;
  titleKey: string;
  titleParams?: TranslationValues;
  filterButtonColor: string;

  filters: Record<string, string | number | boolean | undefined>;
}

export default function DynamicSearchBeaches({
  translationNamespace,
  titleKey,
  titleParams,
  filterButtonColor,
  filters,
}: DynamicSearchBeachesProps) {
  const t = useTranslations(translationNamespace);

  // Fetch beaches
  const { beaches, loading } = useAllBeaches(filters, true);

  // Pagination
  const itemsPerPage = 16;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(beaches.length / itemsPerPage);
  const paginatedBeaches = beaches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* -------------------------------------------------------------
     TRANSFORM BEACH → PROPERTY CARD
  -------------------------------------------------------------- */
  const properties: PropertyCardProps[] = paginatedBeaches.map((b) => {
    const mainImage = buildCdnUrl(b.main_image, 'list');
    const galleryImages = buildGallery(b);

    if (!mainImage) throw new Error(`Missing main_image for beach ${b.id}`);

    // 360 support
    const sphere = b.media?.spheres_360?.[0] ?? null;
    const sphereTourUrl = sphere
      ? `${process.env.NEXT_PUBLIC_CDN_ASSETS}${sphere.tour_url}`
      : undefined;

    // video support
 const rawVideo = b.media?.embeds?.video_url ?? null;

const videoEmbedUrl = rawVideo?.includes('youtu')
  ? rawVideo
      .replace('youtu.be/', 'www.youtube.com/embed/')
      .replace('watch?v=', 'embed/')
  : undefined;


    return {
      image: mainImage,
      galleryImages,

      sphereThumbnail: sphere ? mainImage : undefined,
      sphereTourUrl,

      videoEmbedUrl,

      title: b.name ?? 'Unknown beach',
      location: b.city_slug ?? '',
      price: 0,
      rating: 0,
      reviews: 0,
      countryCode: b.country_code,
    };
  });

  /* -------------------------------------------------------------
     ⭐ MEDIA MODE (gallery | sphere | video)
  -------------------------------------------------------------- */
  const [mediaMode, setMediaMode] = useState<'gallery' | 'sphere' | 'video'>('gallery');

  const [activeSphereUrl, setActiveSphereUrl] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  return (
    <section className="relative bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-left font-figtree text-[26px] font-bold leading-[100%] text-[#222] sm:text-[28px] lg:text-[30px]">
            {t(titleKey, titleParams)}
          </h2>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end lg:gap-4">
            <button
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md px-5 font-figtree text-[14px] font-bold text-white transition-colors"
              style={{ backgroundColor: filterButtonColor }}
            >
              <Image
                src="/images/filters.png"
                alt="Filter icon"
                width={20}
                height={20}
              />
              <span>{t('filterButton')}</span>
            </button>

            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-figtree text-[14px] font-bold text-white hover:bg-[#2a4c78]">
              <Image
                src="/images/map.png"
                alt="Map icon"
                width={20}
                height={20}
              />
              <span>{t('mapButton')}</span>
            </button>

            {/* Display selector */}
            <div className="flex h-[40px] items-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]">
              <span className="font-figtree text-[14px] font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              <div className="flex items-center gap-[10px]">
           {/* GALLERY */}
<button
  onClick={() => setMediaMode('gallery')}
  className={`relative p-1 rounded-[6px] transition-all duration-150
    ${mediaMode === 'gallery'
      ? 'bg-[#D9EBF6] shadow-inner'
      : 'opacity-60 hover:opacity-100'
    }`}
>
  <Image
    src="/images/beachmedia/photo.png"
    width={24}
    height={24}
    alt="photo"
  />

  {mediaMode === 'gallery' && (
    <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
  )}
</button>

<div className="h-[25px] w-[1px] bg-white" />

{/* VIDEO */}
<button
  onClick={() => setMediaMode(m => m === 'video' ? 'gallery' : 'video')}
  className={`relative p-1 rounded-[6px] transition-all duration-150
    ${mediaMode === 'video'
      ? 'bg-[#D9EBF6] shadow-inner'
      : 'opacity-60 hover:opacity-100'
    }`}
>
  <Image
    src="/images/beachmedia/video-icon-white.png"
    width={24}
    height={24}
    alt="video"
  />

  {mediaMode === 'video' && (
    <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
  )}
</button>

<div className="h-[25px] w-[1px] bg-white" />

{/* 360 */}
<button
  onClick={() => setMediaMode(m => m === 'sphere' ? 'gallery' : 'sphere')}
  className={`relative p-1 rounded-[6px] transition-all duration-150
    ${mediaMode === 'sphere'
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

{/* LIVE CAM – NON-INTERACTIVE */}
<div
  className="opacity-60 cursor-not-allowed p-1"
>
  <Image
    src="/images/beachmedia/play-button-arrowhead-white.png"
    width={24}
    height={24}
    alt="live cam"
  />
</div>

              </div>
            </div>

            <select className="rounded-md border border-gray-300 bg-white px-4 py-2 font-figtree text-[14px] font-semibold text-[#4D4D4D]">
              <option>{t('sortPopular')}</option>
              <option>{t('sortNewest')}</option>
              <option>{t('sortTopRated')}</option>
            </select>
          </div>
        </div>

        {/* ⭐ WRAP CARDS IN PROVIDER */}
        <PropertyMediaContext.Provider
          value={{
            mediaMode,
            openSphere: (url) => setActiveSphereUrl(url),
            openVideo: (url) => setActiveVideoUrl(url),
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && <p>Loading beaches…</p>}

            {!loading &&
              properties.map((p, i) => (
                <PropertyCard key={`${p.title}-${i}`} {...p} />
              ))}
          </div>
        </PropertyMediaContext.Provider>

        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      </div>

      {/* ⭐ FULLSCREEN 360 VIEWER */}
      {activeSphereUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <button
            onClick={() => setActiveSphereUrl(null)}
            className="absolute right-4 top-4 text-white text-2xl"
          >
            ✕
          </button>

          <iframe
            src={activeSphereUrl}
            className="w-[90vw] h-[80vh] border-0 rounded-xl"
            allowFullScreen
          />
        </div>
      )}

      {/* ⭐ FULLSCREEN VIDEO VIEWER */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <button
            onClick={() => setActiveVideoUrl(null)}
            className="absolute right-4 top-4 text-white text-2xl"
          >
            ✕
          </button>

          <div className="relative w-full max-w-4xl pt-[56.25%]">
            <iframe
              src={activeVideoUrl}
              className="absolute inset-0 w-full h-full rounded-xl border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}

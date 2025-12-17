'use client';

import { Pagination } from 'flowbite-react';
import { useTranslations, type TranslationValues } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useAllBeaches } from '@/hooks/useBeaches';
import { buildCdnUrl } from '@/lib/utils/beach-images';

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

  /* -------------------------------------------------------------
     MEDIA MODE (gallery | sphere | video)
-------------------------------------------------------------- */
const [mediaMode, setMediaMode] = useState<
  'gallery' | 'sphere' | 'video' | 'webcam'
>('gallery');


  // Reset page when switching display mode
  useEffect(() => {
    setCurrentPage(1);
  }, [mediaMode, beaches]);

  /* -------------------------------------------------------------
     TRANSFORM BEACH → PROPERTY CARD
-------------------------------------------------------------- */
  const properties: PropertyCardProps[] = beaches.map((b) => {
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
    const videoEmbedUrl =
      rawVideo?.includes('youtu')
        ? rawVideo
            .replace('youtu.be/', 'www.youtube.com/embed/')
            .replace('watch?v=', 'embed/')
        : undefined;

        // webcam support
const webcamEmbed = b.media?.embeds?.webcam ?? null;


    return {
      image: mainImage,
      galleryImages,
      sphereThumbnail: sphere ? mainImage : undefined,
      sphereTourUrl,
      videoEmbedUrl,
      webcamEmbed,
      title: b.name ?? 'Unknown beach',
      location: b.city_slug ?? '',
      price: 0,
      rating: 0,
      reviews: 0,
      countryCode: b.country_code,
    };
  });

const hasAnyWebcam = properties.some(p => Boolean(p.webcamEmbed));


  /* -------------------------------------------------------------
      FILTER PROPERTIES BASED ON MEDIA MODE
-------------------------------------------------------------- */
const filteredProperties = properties.filter((p) => {
  if (mediaMode === 'sphere') return Boolean(p.sphereTourUrl);
  if (mediaMode === 'video') return Boolean(p.videoEmbedUrl);
  if (mediaMode === 'webcam') return Boolean(p.webcamEmbed);
  return true;
});


  /* -------------------------------------------------------------
     PAGINATE AFTER FILTERING
-------------------------------------------------------------- */
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginatedItems = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="relative bg-[#F5F5F5] py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-left font-figtree text-[26px] font-bold text-[#222] sm:text-[28px] lg:text-[30px]">
            {t(titleKey, titleParams)}
          </h2>

          {/* Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:gap-4">

            {/* FILTER BTN */}
            <button
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md px-5 font-bold text-white"
              style={{ backgroundColor: filterButtonColor }}
            >
              <Image
src="/images/filters.png" width={20} height={20}
alt=""
              />
              <span>{t('filterButton')}</span>
            </button>

            {/* MAP BTN */}
            <button className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md bg-[#1A3C68] px-6 font-bold text-white hover:bg-[#2a4c78]">
              <Image
src="/images/map.png" width={20} height={20}
alt=""
              />
              <span>{t('mapButton')}</span>
            </button>

            {/* DISPLAY MODE */}
            <div className="flex h-[40px] items-center gap-[10px] bg-[#E7E7E7] rounded-[6px] px-[8px] py-[6px]">
              <span className="font-semibold text-[#4D4D4D]">
                {t('displayLabel')}
              </span>

              <div className="flex items-center gap-[10px]">

                {/* GALLERY */}
               <button
  onClick={() => setMediaMode('gallery')}
  className={`relative p-1 rounded-[6px] transition
    ${mediaMode === 'gallery'
      ? 'bg-[#D9EBF6]'
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


             {/* WEBCAM */}
{hasAnyWebcam ? (
  <button
    onClick={() =>
      setMediaMode(m => (m === 'webcam' ? 'gallery' : 'webcam'))
    }
    className={`relative p-1 rounded-[6px] transition
      ${mediaMode === 'webcam'
        ? 'bg-[#D9EBF6]'
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


 <div className="h-[25px] w-[1px] bg-white" />
                {/* SPHERE */}
             <button
  onClick={() => setMediaMode(m => (m === 'sphere' ? 'gallery' : 'sphere'))}
  className={`relative p-1 rounded-[6px] transition
    ${mediaMode === 'sphere'
      ? 'bg-[#D9EBF6]'
      : 'opacity-60 hover:opacity-100'
    }`}
             >
  <Image
    src="/images/beachmedia/360-degree-white.png"
    width={24}
    height={24}
    alt="sphere"
  />

  {mediaMode === 'sphere' && (
    <span className="absolute left-0 right-0 -bottom-[3px] mx-auto h-[2px] w-[14px] bg-[#1A3C68] rounded-full" />
  )}
</button>


                <div className="h-[25px] w-[1px] bg-white" />


  {/* VIDEO — real video */}
           <button
  onClick={() => setMediaMode(m => (m === 'video' ? 'gallery' : 'video'))}
  className={`relative p-1 rounded-[6px] transition
    ${mediaMode === 'video'
      ? 'bg-[#D9EBF6]'
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


              </div>
            </div>

            {/* Sort dropdown */}
            <select className="rounded-md border px-4 py-2 bg-white font-semibold">
              <option>{t('sortPopular')}</option>
              <option>{t('sortNewest')}</option>
              <option>{t('sortTopRated')}</option>
            </select>
          </div>
        </div>

        {/* CARDS WRAPPED IN CONTEXT */}
        <PropertyMediaContext.Provider
          value={{
            mediaMode,
           openSphere: () => undefined,
openVideo: () => undefined,
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && <p>Loading beaches…</p>}

            {!loading &&
              paginatedItems.map((p, i) => (
                <PropertyCard key={`${p.title}-${i}`} {...p} />
              ))}

            {!loading && paginatedItems.length === 0 && (
              <p className="text-gray-500">No beaches available for this view.</p>
            )}
          </div>
        </PropertyMediaContext.Provider>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showIcons
            />
          </div>
        )}
      </div>
    </section>
  );
}

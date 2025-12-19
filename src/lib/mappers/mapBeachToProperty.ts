// src/lib/mappers/mapBeachToProperty.ts

import type { Property } from '@/components/PropertySection';
import { buildCdnUrl } from '@/lib/utils/beach-images';

/* ------------------------------------------------------------------
 * Minimal input types for mapper (NO any, NO API coupling)
 * ------------------------------------------------------------------ */

interface BeachMediaGalleryItem {
  url?: string | null;
  order?: number | null;
}

interface BeachMediaSphere {
  tour_url?: string | null;
}

interface BeachMediaEmbeds {
  video_url?: string | null;
  webcam?: string | null;
}

interface BeachMedia {
  gallery?: BeachMediaGalleryItem[] | null;
  spheres_360?: BeachMediaSphere[] | null;
  embeds?: BeachMediaEmbeds | null;
}

interface BeachLike {
  id?: string | number | null;
  name?: string | null;
  main_image?: string | null;

  country_code?: string | null;
  city_slug?: string | null;
  region_slug?: string | null;

  media?: BeachMedia | null;
}

/* ------------------------------------------------------------------
 * Mapper
 * ------------------------------------------------------------------ */

/**
 * Maps raw beach-like API object into PropertySection-compatible object.
 * Centralizes all media handling (gallery, sphere, video, webcam).
 */
export function mapBeachToProperty(
  beach: BeachLike | null | undefined,
  options?: {
    mostVisitedSet?: Set<string | number>;
    locationFallback?: string;
  },
): Property | null {
  if (!beach) return null;

  /* ---------------------------
   * MAIN IMAGE (required)
   * --------------------------- */
  const mainImage = buildCdnUrl(beach.main_image ?? null, 'list');
  if (!mainImage) return null;

  /* ---------------------------
   * GALLERY IMAGES (max 5)
   * --------------------------- */
  const galleryImages =
    beach.media?.gallery
      ?.filter(
        (img): img is { url: string; order?: number | null } =>
          typeof img?.url === 'string',
      )
      ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      ?.slice(0, 5)
      ?.map((img) => buildCdnUrl(img.url, 'gallery'))
      ?.filter((url): url is string => Boolean(url)) ?? [];

  /* ---------------------------
   * 360° SPHERE
   * --------------------------- */
  const sphere = beach.media?.spheres_360?.[0];

  const sphereThumbnail =
    typeof sphere?.tour_url === 'string' ? mainImage : undefined;

  const sphereTourUrl =
    typeof sphere?.tour_url === 'string'
      ? `${process.env.NEXT_PUBLIC_CDN_ASSETS}${sphere.tour_url}`
      : undefined;

  /* ---------------------------
   * VIDEO (YouTube embed)
   * --------------------------- */
  const rawVideo = beach.media?.embeds?.video_url;

  const videoEmbedUrl =
    typeof rawVideo === 'string'
      ? rawVideo
          .replace('youtu.be/', 'www.youtube.com/embed/')
          .replace('watch?v=', 'embed/')
      : undefined;

  /* ---------------------------
   * WEBCAM
   * --------------------------- */
  const webcamEmbed =
    typeof beach.media?.embeds?.webcam === 'string'
      ? beach.media.embeds.webcam
      : undefined;

  /* ---------------------------
   * LOCATION LABEL
   * --------------------------- */
  const location =
    typeof beach.city_slug === 'string'
      ? beach.city_slug
      : typeof beach.region_slug === 'string'
      ? beach.region_slug
      : options?.locationFallback ?? '';

  /* ---------------------------
   * MOST VISITED FLAG
   * --------------------------- */
  const isMostVisited =
    Boolean(
      options?.mostVisitedSet &&
        beach.id != null &&
        options.mostVisitedSet.has(beach.id),
    );

  /* ---------------------------
   * FINAL PROPERTY OBJECT
   * --------------------------- */
  return {
    id: String(beach.id),
    image: mainImage,
    galleryImages,

    sphereThumbnail,
    sphereTourUrl,

    videoEmbedUrl,
    webcamEmbed,

    title: beach.name ?? 'Unknown beach',
    location,

    price: 0,
    rating: 0,
    reviews: 0,

    isMostVisited,
    countryCode:
      typeof beach.country_code === 'string'
        ? beach.country_code
        : undefined,
  };
}

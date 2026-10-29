// src/lib/mappers/mapBeachToProperty.ts

import type { Property } from '@/components/PropertySection';
import { buildCdnUrl, buildSphereTourUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildCityUrlFromSchema } from '@/lib/utils/beach-urls';
import type { BeachCardFeatures } from '@/lib/utils/beach-badges';
import { buildBeachVideoUrl } from '@/lib/utils/beach-video';
import { webcamLink } from '@/lib/utils/webcam';
import { parseDistanceKm } from '@/lib/utils/distance';

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
  windy_webcam_id?: number | null;
}

interface BeachMedia {
  gallery?: BeachMediaGalleryItem[] | null;
  spheres_360?: BeachMediaSphere[] | null;
  videos?: { url?: string | null; is_primary?: boolean | null }[] | null;
  embeds?: BeachMediaEmbeds | null;
}

export interface BeachLike {
  id?: string | number | null;
  name?: string | null;
  slug?: string | null;

  continent_slug?: string | null;
  country_slug?: string | null;
  region_slug?: string | null;
  island_slug?: string | null;
  city_slug?: string | null;

  city_name?: string | null;
  country_name?: string | null;

  country_code?: string | null;
  main_image?: string | null;

  media?: BeachMedia | null;

  /** Up to 4 tag strings returned by the API (sporting, culinary, natural conditions) */
  tags?: string[] | null;
  features?: BeachCardFeatures | null;

  /** Distance from the search point, sent by the spatial endpoints (within-radius, nearest) */
  distance_km?: number | string | null;
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
    locale?: string;
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
   * OPTIMIZATION: Return raw URLs, build CDN URLs lazily in component
   * --------------------------- */
  const galleryRawUrls =
    beach.media?.gallery
      ?.filter(
        (img): img is { url: string; order?: number | null } =>
          typeof img?.url === 'string',
      )
      ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      ?.slice(0, 5)
      ?.map((img) => img.url) ?? [];

  // Build CDN URLs for gallery (will be used for lazy loading)
  const galleryImages = galleryRawUrls
    .map((url) => buildCdnUrl(url, 'gallery'))
    .filter((url): url is string => Boolean(url));

  /* ---------------------------
   * 360° SPHERE
   * --------------------------- */
  const sphere = beach.media?.spheres_360?.[0];

  const sphereThumbnail =
    typeof sphere?.tour_url === 'string' ? mainImage : undefined;

  // Use buildSphereTourUrl to handle special characters in paths (č, š, ž, etc.)
  const sphereTourUrl = buildSphereTourUrl(sphere?.tour_url) ?? undefined;

  /* ---------------------------
   * VIDEO (YouTube embed)
   * --------------------------- */
  const videoEmbedUrl =
    buildBeachVideoUrl(beach.media?.embeds?.video_url, beach.media?.videos) ?? undefined;

  /* ---------------------------
   * WEBCAM
   * --------------------------- */
  // Only a link the card can open counts as "has webcam" (TASK-006: the verified Windy webcam).
  const webcamEmbed = webcamLink(beach.media?.embeds) ?? undefined;

  /* ---------------------------
   * LOCATION LABEL
   * --------------------------- */
  const location =
    typeof beach.city_name === 'string' && beach.city_name
      ? beach.city_name
      : typeof beach.country_name === 'string' && beach.country_name
      ? beach.country_name
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
   * BEACH URL (only when locale is known)
   * --------------------------- */
  const beachUrl = options?.locale
    ? buildBeachUrlFromSchema(
        {
          slug: beach.slug ?? undefined,
          continent_slug: beach.continent_slug,
          country_slug: beach.country_slug,
          region_slug: beach.region_slug,
          island_slug: beach.island_slug,
          city_slug: beach.city_slug,
        },
        options.locale,
      )
    : null;

  /* ---------------------------
   * CITY PAGE URL (only when locale is known)
   * --------------------------- */
  const locationUrl = options?.locale
    ? buildCityUrlFromSchema(
        {
          continent_slug: beach.continent_slug,
          country_slug: beach.country_slug,
          region_slug: beach.region_slug,
          island_slug: beach.island_slug,
          city_slug: beach.city_slug,
        },
        options.locale,
      )
    : null;

  /* ---------------------------
   * FINAL PROPERTY OBJECT
   * --------------------------- */
  /* ---------------------------
   * TAGS (sporting activities, culinary, natural conditions — max 4, from API)
   * --------------------------- */
  const tags =
    Array.isArray(beach.tags) && beach.tags.length > 0
      ? beach.tags.filter((t): t is string => typeof t === 'string')
      : undefined;

  return {
    id: String(beach.id),
    ...(beachUrl ? { beachUrl } : {}),
    image: mainImage,
    galleryImages,

    sphereThumbnail,
    sphereTourUrl,

    videoEmbedUrl,
    webcamEmbed,

    title: beach.name ?? 'Unknown beach',
    location,
    ...(locationUrl ? { locationUrl } : {}),

    price: 0,
    rating: 0,
    reviews: 0,

    isMostVisited,
    countryCode:
      typeof beach.country_code === 'string'
        ? beach.country_code
        : undefined,

    tags,
    features: beach.features ?? null,
    distanceKm: parseDistanceKm(beach.distance_km),
  };
}

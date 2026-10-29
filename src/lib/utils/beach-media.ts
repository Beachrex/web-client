import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildCdnUrl, buildSphereTourUrl } from '@/lib/utils/beach-images';
import { buildBeachVideoUrl } from '@/lib/utils/beach-video';
import { parseWindyWebcams, type WindyWebcam } from '@/lib/utils/webcam';

/** Media a beach can show in the popup (beach page and the homepage example, TASK-008). */
export type BeachMediaKind = 'gallery' | 'video' | 'sphere' | 'live';

export interface BeachMediaSources {
  /** Full-size gallery images (banner CDN size), in API order. */
  galleryImages: string[];
  /** Gallery thumbnails (gallery CDN size), in API order. */
  galleryThumbs: string[];
  videoEmbedUrl: string | null;
  /** True when the video is an uploaded file (mp4 …), played with <video>; false for YouTube embeds. */
  videoIsFile: boolean;
  /** krpano tour, or — when the tour was never generated — our 360° viewer with the panorama photo. */
  sphereTourUrl: string | null;
  sphereThumb: string | null;
  webcams: WindyWebcam[];
}

const FALLBACK_IMAGE = '/images/beachmedia/beach-gallery.jpg';

/** Self-hosted Pannellum 2.5.6 standalone viewer (MIT, public/vendor/pannellum-2.5.6). */
export const PANORAMA_VIEWER_PATH = '/vendor/pannellum-2.5.6/pannellum.htm';

/**
 * Owner 2026-10-29 (Plage du Port Vieux): a beach can have the 360° panorama photo but no generated krpano tour
 * (API `tour_url` null). Then the panorama opens in Pannellum. `autoRotate` is degrees per second.
 */
export function panoramaViewerUrl(panoramaImageUrl: string): string {
  return `${PANORAMA_VIEWER_PATH}#panorama=${encodeURIComponent(panoramaImageUrl)}&autoLoad=true&autoRotate=-2`;
}

const VIDEO_FILE = /\.(mp4|m4v|mov|webm|ogv)(\?|#|$)/i;

/** Everything the media popup needs from beach details. Pure: no React, no fetch. */
export function getBeachMediaSources(beach: BeachDetailsSchema): BeachMediaSources {
  const gallery = beach.media?.gallery ?? [];
  const spheres = beach.media?.spheres_360 ?? [];

  const galleryImages: string[] = [];
  const galleryThumbs: string[] = [];
  for (const img of gallery) {
    const large = buildCdnUrl(img.url ?? img.thumbnail_url, 'banner');
    const thumb = buildCdnUrl(img.thumbnail_url ?? img.url, 'gallery');
    if (large && thumb) {
      galleryImages.push(large);
      galleryThumbs.push(thumb);
    }
  }

  const sphere = spheres[0];
  const tourUrl = sphere ? buildSphereTourUrl(sphere.tour_url) : null;
  const panorama = sphere && !tourUrl ? buildCdnUrl(sphere.url ?? sphere.thumbnail_url, 'banner') : null;
  const sphereTourUrl = tourUrl ?? (panorama ? panoramaViewerUrl(panorama) : null);
  const videoEmbedUrl = buildBeachVideoUrl(beach.embeds?.video_url, beach.media?.videos ?? []);

  return {
    galleryImages,
    galleryThumbs,
    videoEmbedUrl,
    videoIsFile: videoEmbedUrl !== null && VIDEO_FILE.test(videoEmbedUrl),
    sphereTourUrl,
    sphereThumb: sphereTourUrl
      ? buildCdnUrl(spheres[0]?.thumbnail_url ?? spheres[0]?.url, 'gallery')
      : null,
    webcams: parseWindyWebcams((beach as { webcams?: unknown }).webcams),
  };
}

export interface ShowcaseCard {
  kind: BeachMediaKind;
  /** Card background: a different photo of the same beach per card where possible. */
  image: string;
}

/**
 * Homepage example (TASK-008): one card per media type the beach really has, in a fixed order.
 * Backgrounds rotate through the beach's own photos so the four cards read as one beach.
 */
export function showcaseCards(sources: BeachMediaSources): ShowcaseCard[] {
  const thumbs = sources.galleryThumbs;
  const photo = (i: number): string => thumbs[i] ?? thumbs[0] ?? sources.sphereThumb ?? FALLBACK_IMAGE;

  const cards: ShowcaseCard[] = [];
  if (thumbs.length > 0) cards.push({ kind: 'gallery', image: photo(0) });
  if (sources.videoEmbedUrl) cards.push({ kind: 'video', image: photo(1) });
  if (sources.sphereTourUrl) cards.push({ kind: 'sphere', image: sources.sphereThumb ?? photo(2) });
  if (sources.webcams.length > 0) cards.push({ kind: 'live', image: photo(thumbs.length > 3 ? 3 : 2) });
  return cards;
}

/** `beach_views.config.showcase_beach_id` → positive integer id, else null. Admin stores strings. */
export function parseShowcaseBeachId(config: unknown): number | null {
  if (!config || typeof config !== 'object') return null;
  const raw = (config as Record<string, unknown>).showcase_beach_id;
  const id = typeof raw === 'string' ? Number(raw.trim()) : raw;
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null;
}

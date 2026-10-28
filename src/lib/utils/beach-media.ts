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
  sphereTourUrl: string | null;
  sphereThumb: string | null;
  webcams: WindyWebcam[];
}

const FALLBACK_IMAGE = '/images/beachmedia/beach-gallery.jpg';

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

  const sphereTourUrl = spheres.length > 0 ? buildSphereTourUrl(spheres[0]?.tour_url) : null;

  return {
    galleryImages,
    galleryThumbs,
    videoEmbedUrl: buildBeachVideoUrl(beach.embeds?.video_url, beach.media?.videos ?? []),
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

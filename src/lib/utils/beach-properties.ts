import type { Property } from '@/components/PropertySection';
import type { BeachSchema } from '@/lib/api-client/types.gen';
import { hasMainImage, withMainImage } from '@/lib/utils/beach-cards';
import { buildCdnUrl, buildSphereTourUrl } from '@/lib/utils/beach-images';
import { buildBeachUrlFromSchema, buildCityUrlFromSchema } from '@/lib/utils/beach-urls';
import { buildBeachVideoUrl } from '@/lib/utils/beach-video';
import { webcamLink } from '@/lib/utils/webcam';

/** Up to 5 gallery images in their admin order. */
function buildGallery(beach: BeachSchema): string[] {
  return (beach.media?.gallery ?? [])
    .filter((img): img is typeof img & { url: string } => typeof img.url === 'string')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 5)
    .map((img) => buildCdnUrl(img.url, 'list'))
    .filter((url): url is string => Boolean(url));
}

/** Up to 4 descriptive tags from the API ("Swimming • Snorkeling • …"); none → no tag line. */
export function cardTags(beach: Pick<BeachSchema, 'tags'>): string[] | undefined {
  const tags = (beach.tags ?? []).filter((t): t is string => typeof t === 'string' && t.trim() !== '');
  return tags.length ? tags : undefined;
}

/**
 * Beach list item (most-visited API) → card for `PropertySection`, with the same media rules as
 * the beach page: gallery, 360° sphere, video (embed or uploaded) and webcam.
 * Beaches without a main image are skipped: next/image throws on a missing src (QA #55).
 */
export function beachesToProperties(beaches: BeachSchema[], locale: string): Property[] {
  return beaches.map(withMainImage).filter(hasMainImage).map((beach) => {
    const mainImage = buildCdnUrl(beach.main_image, 'list')!;
    const sphere = beach.media?.spheres_360?.[0] ?? null;

    return {
      id: String(beach.id),
      beachUrl: buildBeachUrlFromSchema(beach, locale) ?? undefined,
      image: mainImage,
      galleryImages: buildGallery(beach),
      sphereThumbnail: sphere ? mainImage : undefined,
      sphereTourUrl: buildSphereTourUrl(sphere?.tour_url) ?? undefined,
      videoEmbedUrl: buildBeachVideoUrl(beach.media?.embeds?.video_url ?? null, beach.media?.videos) ?? undefined,
      webcamEmbed: webcamLink(beach.media?.embeds),
      features: beach.features ?? null,
      title: beach.name ?? '',
      location: beach.city_name ?? beach.country_name ?? '',
      locationUrl: buildCityUrlFromSchema(beach, locale) ?? undefined,
      price: 0,
      rating: 0,
      reviews: 0,
      countryCode: beach.country_code,
      tags: cardTags(beach),
    };
  });
}

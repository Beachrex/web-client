import { buildCdnUrl } from '@/lib/utils/beach-images';

interface HeroMedia {
  url?: string | null;
  collection?: string | null;
  is_primary?: boolean | null;
}

/**
 * Home hero background from `first-page-content` (`hero_banner`): the `background_image` collection, else the
 * primary media, else the first. Used on the server (so the image is in the initial HTML and preloaded) and in
 * the client hero.
 */
export function heroBackgroundUrl(media: HeroMedia[] | null | undefined): string {
  if (!media || media.length === 0) return '';
  const bg = media.find((m) => m.collection === 'background_image') ?? media.find((m) => m.is_primary) ?? media[0];
  return bg?.url ? (buildCdnUrl(bg.url, 'hero') ?? '') : '';
}

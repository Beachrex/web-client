import type { ImageLoaderProps } from 'next/image';

/**
 * Global `next/image` loader (next.config.js `images.loaderFile`). Performance, owner 2026-10-29.
 *
 * Images are resized by Imagor (`https://s3.beachrex.com/unsafe/fit-in/WxH/[filters:…/]path`), not by Next.
 * Before, `images.unoptimized` sent every image at its endpoint size (hero 2800 px JPEG, cards 800 px JPEG) to
 * every device. Now `next/image` builds a `srcset`, and for each width this loader asks Imagor for that width as
 * WebP. The width never exceeds the endpoint's own size, so no image gets larger than before.
 *
 * Any other source (files in `public/`, direct Spaces assets, SVG icons) is returned unchanged.
 */

/**
 * Groups: `…/unsafe/` base, endpoint box width and height, existing filters (may contain `/` inside
 * parentheses), image path.
 */
const IMAGOR_URL = /^(https?:\/\/[^/]+\/unsafe\/)fit-in\/(\d+)x(\d+)\/(?:filters:((?:[^/()]|\([^)]*\))*)\/)?(.+)$/;

const DEFAULT_QUALITY = 75;

export default function imagorLoader({ src, width, quality }: ImageLoaderProps): string {
  const match = IMAGOR_URL.exec(src);
  if (!match) return src;

  const [, base, boxW, boxH, existing, path] = match;
  const max = Math.max(Number(boxW), Number(boxH));
  const size = Math.min(width, max);
  // Keep other filters (e.g. the mobile-photo watermark); format and quality are set here.
  const kept = (existing ?? '')
    .replace(/(^|:)(format|quality)\([^)]*\)/g, '')
    .replace(/^:+/, '');
  const filters = ['format(webp)', `quality(${quality ?? DEFAULT_QUALITY})`, kept].filter(Boolean).join(':');

  return `${base}fit-in/${size}x${size}/filters:${filters}/${path}`;
}

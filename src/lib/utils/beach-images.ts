import { env } from '@/env';
import type { MediaItem } from '@/lib/api-client/types.gen';

/**
 * Encode a single path segment only when it contains non-ASCII characters.
 * This avoids double-encoding already percent-encoded segments.
 */
function encodePathSegment(segment: string): string {
  if (!segment) return segment;

  // Fast path: already pure ASCII, nothing to encode
  if (/^[\u0000-\u007F]*$/.test(segment)) {
    return segment;
  }

  // Normalize to NFD so characters like "č" become "c" + combining caron,
  // then percent-encode the bytes. This matches how objects are stored in the CDN
  // (e.g. 'brač' -> 'brac%CC%8C').
  return encodeURIComponent(segment.normalize('NFD'));
}

/**
 * Encode only the non-ASCII characters in a CDN image path while preserving
 * path separators and already-encoded segments.
 *
 * Example:
 *   '/public/img/beaches/hr-37-o-brač/hr-37-o-brač-sl10.jpg'
 * becomes
 *   '/public/img/beaches/hr-37-o-bra%C4%8D/hr-37-o-bra%C4%8D-sl10.jpg'
 */
export function encodeCdnImagePath(path: string): string {
  if (!path) return path;

  const queryIndex = path.search(/[?#]/);
  let main = path;
  let suffix = '';

  if (queryIndex !== -1) {
    main = path.slice(0, queryIndex);
    suffix = path.slice(queryIndex);
  }

  const encoded = main
    .split('/')
    .map(segment => encodePathSegment(segment))
    .join('/');

  return encoded + suffix;
}

/**
 * Build full CDN URL for beach images
 *
 * Beach images have two path patterns:
 * - 'img/beaches/' for web uploads
 * - 'img/beaches_mobile/' for mobile app uploads
 *
 * @param folderName - Beach folder name (e.g., 'hr-102-o-pag')
 * @param filename - Image filename (e.g., 'hr-102-o-pag-sl4.jpg')
 * @param mobileUpload - Whether image was uploaded from mobile app
 * @returns Full CDN URL
 */
export function buildBeachImageUrl(
  folderName: string | null | undefined,
  filename: string | null | undefined,
  mobileUpload = false
): string | null {
  if (!folderName || !filename) {
    return null;
  }

  const basePath = mobileUpload ? 'img/beaches_mobile' : 'img/beaches';

  const safeFolder = encodePathSegment(folderName);
  const safeFilename = encodePathSegment(filename);

  return `${env.NEXT_PUBLIC_CDN_TEASER}${basePath}/${safeFolder}/${safeFilename}`;
}

/**
 * Get the main beach image URL from media gallery
 * First tries to find image with is_primary=true, otherwise returns first image
 *
 * @param gallery - Array of media items from API
 * @param folderName - Beach folder name
 * @param mobileUpload - Whether image was uploaded from mobile app
 * @returns Full CDN URL or null if no images available
 */
export function getMainBeachImage(
  gallery: MediaItem[] | undefined,
  folderName: string | null | undefined,
  mobileUpload = false
): string | null {
  if (!gallery || gallery.length === 0) {
    return null;
  }

  // First, try to find the primary image
  const primaryImage = gallery.find(img => img.is_primary === true);

  // If primary image exists, use it; otherwise use first image
  const selectedImage = primaryImage ?? gallery[0];

  if (!selectedImage?.file_name) {
    return null;
  }

  return buildBeachImageUrl(folderName, selectedImage.file_name, mobileUpload);
}

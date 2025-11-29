import { env } from '@/env';
import type { MediaItem } from '@/lib/api-client/types.gen';

/**
 * CDN endpoint types for different image sizes and use cases
 */
export type CdnEndpointType = 'teaser' | 'large' | 'assets';

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
 * Get the appropriate CDN endpoint based on the endpoint type
 *
 * @param type - CDN endpoint type
 * @returns CDN endpoint URL
 */
export function getCdnEndpoint(type: CdnEndpointType = 'teaser'): string {
  switch (type) {
    case 'large':
      return env.NEXT_PUBLIC_CDN_LARGE;
    case 'assets':
      return env.NEXT_PUBLIC_CDN_ASSETS;
    case 'teaser':
    default:
      return env.NEXT_PUBLIC_CDN_TEASER;
  }
}

/**
 * Determine the appropriate CDN endpoint type based on the image path
 *
 * Rules:
 * - Icons, videos, SVGs, and non-compressible formats → 'assets'
 * - Banner images, hero images, large backgrounds → 'large'
 * - List items, carousels, thumbnails, gallery images → 'teaser' (default)
 *
 * @param path - Image path
 * @param context - Optional context hint ('banner', 'hero', 'icon', 'video', 'list', 'carousel')
 * @returns CDN endpoint type
 */
export function determineCdnEndpointType(
  path: string | null | undefined,
  context?: 'banner' | 'hero' | 'icon' | 'video' | 'list' | 'carousel' | 'gallery'
): CdnEndpointType {
  if (!path) return 'teaser';

  const lowerPath = path.toLowerCase();

  // Context-based determination (highest priority)
  if (context === 'banner' || context === 'hero') {
    return 'large';
  }
  if (context === 'icon' || context === 'video') {
    return 'assets';
  }

  // Path-based determination
  // Icons and non-compressible formats
  if (
    lowerPath.includes('/icons/') ||
    lowerPath.includes('/icon/') ||
    lowerPath.endsWith('.svg') ||
    lowerPath.endsWith('.gif') ||
    lowerPath.includes('/videos/') ||
    lowerPath.includes('/video/')
  ) {
    return 'assets';
  }

  // Banner and hero images
  if (
    lowerPath.includes('/banner') ||
    lowerPath.includes('/hero') ||
    lowerPath.includes('background')
  ) {
    return 'large';
  }

  // Default to teaser for lists, carousels, galleries, and general images
  return 'teaser';
}

/**
 * Build full CDN URL with automatic endpoint selection
 *
 * @param path - Relative image path from API
 * @param context - Optional context hint for endpoint selection
 * @returns Full CDN URL or null if path is invalid
 */
export function buildCdnUrl(
  path: string | null | undefined,
  context?: 'banner' | 'hero' | 'icon' | 'video' | 'list' | 'carousel' | 'gallery'
): string | null {
  if (!path) return null;

  const endpointType = determineCdnEndpointType(path, context);
  const endpoint = getCdnEndpoint(endpointType);
  const encodedPath = encodeCdnImagePath(path);

  return `${endpoint}${encodedPath}`;
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
 * @param context - Optional context hint for endpoint selection (default: 'list')
 * @returns Full CDN URL
 */
export function buildBeachImageUrl(
  folderName: string | null | undefined,
  filename: string | null | undefined,
  mobileUpload = false,
  context: 'banner' | 'hero' | 'list' | 'carousel' | 'gallery' = 'list'
): string | null {
  if (!folderName || !filename) {
    return null;
  }

  const basePath = mobileUpload ? 'img/beaches_mobile' : 'img/beaches';
  const safeFolder = encodePathSegment(folderName);
  const safeFilename = encodePathSegment(filename);
  const path = `${basePath}/${safeFolder}/${safeFilename}`;

  return buildCdnUrl(path, context);
}

/**
 * Get the main beach image URL from media gallery
 * First tries to find image with is_primary=true, otherwise returns first image
 *
 * @param gallery - Array of media items from API
 * @param folderName - Beach folder name
 * @param mobileUpload - Whether image was uploaded from mobile app
 * @param context - Optional context hint for endpoint selection (default: 'list')
 * @returns Full CDN URL or null if no images available
 */
export function getMainBeachImage(
  gallery: MediaItem[] | undefined,
  folderName: string | null | undefined,
  mobileUpload = false,
  context: 'banner' | 'hero' | 'list' | 'carousel' | 'gallery' = 'list'
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

  return buildBeachImageUrl(folderName, selectedImage.file_name, mobileUpload, context);
}

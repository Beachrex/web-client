import { env } from '@/env';
import type { MediaItem } from '@/lib/api-client/types.gen';

/**
 * CDN endpoint types for different image sizes and use cases
 */
export type CdnEndpointType = 'teaser' | 'large' | 'assets';

/**
 * Percent-encode non-ASCII path segments. Since TASK-002 every storage key is
 * ASCII, so this only keeps a stray non-ASCII path a valid URL (it will 404).
 */
function encodePath(path: string): string {
  if (/^[\x00-\x7F]*$/.test(path)) return path;
  return path
    .split('/')
    .map((segment) => (/^[\x00-\x7F]*$/.test(segment) ? segment : encodeURIComponent(segment)))
    .join('/');
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
 * Every image goes through Imagor. Storage keys are ASCII since TASK-002 (the old
 * non-ASCII keys were deleted), so there is no direct Spaces bypass any more.
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

  return `${endpoint}${encodePath(path)}`;
}

/**
 * Build full CDN URL for 360° sphere tour HTML files
 *
 * @param tourUrl - Relative tour URL from API (e.g., 'img/beaches/hr-4-o-ciovo/vtour/tour.html')
 * @returns Full CDN URL
 */
export function buildSphereTourUrl(tourUrl: string | null | undefined): string | null {
  if (!tourUrl) return null;

  // Always use 'assets' endpoint for tour HTML files
  return buildCdnUrl(tourUrl, 'icon');
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
  const path = `${basePath}/${folderName}/${filename}`;

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

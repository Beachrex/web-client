import { env } from '@/env';
import type { MediaItem } from '@/lib/api-client/types.gen';

/**
 * CDN endpoint types for different image sizes and use cases
 */
export type CdnEndpointType = 'teaser' | 'large' | 'assets';

/**
 * Check if path contains non-ASCII characters (special characters like č, š, ž)
 */
function hasNonAsciiCharacters(path: string): boolean {
  return !/^[\x00-\x7F]*$/.test(path);
}

/**
 * Encode path segment with NFD normalization for DigitalOcean Spaces compatibility
 */
function encodePathSegment(segment: string): string {
  if (!segment) return segment;

  // Fast path: already pure ASCII, nothing to encode
  if (/^[\u0000-\u007F]*$/.test(segment)) {
    return segment;
  }

  // Use NFD normalization (decomposed form) to match how files are stored on DigitalOcean Spaces
  // This ensures 'č' becomes 'c' + combining caron (U+0063 + U+030C)
  return encodeURIComponent(segment.normalize('NFD'));
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
 * For images with special characters (č, š, ž, etc.), uses direct DigitalOcean Spaces URL
 * to bypass Imagor (which doesn't handle UTF-8 paths correctly).
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

  // If path contains special characters, use direct DigitalOcean Spaces URL
  // Imagor doesn't handle UTF-8 paths correctly, so we bypass it
  if (hasNonAsciiCharacters(path)) {
    const segments = path.split('/');
    const encodedSegments = segments.map(encodePathSegment);
    const encodedPath = encodedSegments.join('/');

    return `${env.NEXT_PUBLIC_CDN_ASSETS}${encodedPath}`;
  }

  // For ASCII-only paths, use Imagor optimization
  const endpointType = determineCdnEndpointType(path, context);
  const endpoint = getCdnEndpoint(endpointType);

  return `${endpoint}${path}`;
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

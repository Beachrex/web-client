import { env } from '@/env';
import type { MediaItem } from '@/lib/api-client/types.gen';

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
  return `${env.NEXT_PUBLIC_CDN_ENDPOINT}/${basePath}/${folderName}/${filename}`;
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


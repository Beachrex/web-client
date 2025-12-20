import type { MetadataRoute } from 'next';
import { env } from '@/env';

/**
 * Sitemap Index
 *
 * This is the main sitemap that references all other sitemaps.
 * It follows the sitemap index protocol to organize large numbers of URLs.
 *
 * Sitemaps included:
 * - /sitemap/static.xml - Static pages (homepage, beaches listing, etc.) - 84 URLs
 * - /sitemap/beaches.xml - Individual beach pages - ~34,230 URLs
 * - /sitemap/countries.xml - Country pages (future)
 * - /sitemap/regions.xml - Region pages (future)
 * - /sitemap/cities.xml - City pages (future)
 * - /sitemap/islands.xml - Island pages (future)
 *
 * Total URLs: ~34,314 URLs (and growing)
 */

const baseUrl = env.NEXT_PUBLIC_BASE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/sitemap/static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/beaches.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/countries.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/regions.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/cities.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap/islands.xml`,
      lastModified: new Date(),
    },
  ];
}

// Revalidate every 24 hours
export const revalidate = 86400;


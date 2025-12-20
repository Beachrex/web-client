import { type MetadataRoute } from 'next';
import { env } from '@/env';

/**
 * Dynamic robots.txt generation based on environment
 *
 * - Production (beachrex.com): Allow all crawling
 * - Development (dev.beachrex.com): Block all crawling
 * - Local (localhost): Block all crawling
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.');

  // Block crawling on dev and local environments
  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Allow crawling on production
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-beaches.xml`,
      `${baseUrl}/sitemap-countries.xml`,
      `${baseUrl}/sitemap-regions.xml`,
      `${baseUrl}/sitemap-cities.xml`,
      `${baseUrl}/sitemap-islands.xml`,
    ],
  };
}


import { type MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generation based on environment
 *
 * - Production (beachrex.com): Allow all crawling
 * - Development (dev.beachrex.com): Block all crawling
 * - Local (localhost): Block all crawling
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const isProduction = baseUrl.includes('beachrex.com') && !baseUrl.includes('dev.') && !baseUrl.includes('uat.');

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
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


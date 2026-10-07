import { type MetadataRoute } from 'next';
import { isProductionSite } from '@/lib/utils/environment';

/**
 * Dynamic robots.txt generation based on environment
 *
 * - Production (beachrex.com): Allow all crawling
 * - Everything else (dev., uat., localhost): Block all crawling
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const isProduction = isProductionSite(baseUrl);

  // Block crawling on dev, uat and local environments
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


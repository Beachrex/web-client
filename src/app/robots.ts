import { type MetadataRoute } from 'next';
import { AI_SEARCH_BOTS, AI_TRAINING_BOTS } from '@/lib/constants/crawlers';
import { isProductionSite } from '@/lib/utils/environment';

/**
 * robots.txt for every environment. A static `public/robots.txt` (Disallow: /) used to shadow
 * this route, so production would have blocked all search engines (TASK-004).
 *
 * - Production (beachrex.com): search engines and AI search bots allowed, AI training bots not.
 * - Everything else (dev., uat., localhost): everything blocked.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  if (!isProductionSite(baseUrl)) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: [
      // JS/CSS under /_next/ stay crawlable: Google renders pages with them.
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: AI_SEARCH_BOTS, allow: '/', disallow: ['/api/'] },
      { userAgent: AI_TRAINING_BOTS, disallow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

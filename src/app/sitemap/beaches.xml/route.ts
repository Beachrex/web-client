import type { MetadataRoute } from 'next';
import { locales } from '@/app/config/locales';
import { env } from '@/env';
import type { BeachSchema } from '@/lib/api-client/types.gen';

/**
 * Dynamic Beach Sitemap
 *
 * Generates sitemap entries for all beaches across all 14 locales.
 * Each beach URL includes hreflang alternate links for all languages.
 *
 * Expected output: ~2,445 beaches × 14 locales = ~34,230 URLs
 *
 * This sitemap is separate from the main sitemap to keep file sizes manageable
 * and allow different revalidation strategies.
 */

// Localized "beaches" word for URL construction
const beachesWord: Record<string, string> = {
  en: 'beaches',
  si: 'plaze',
  de: 'strande',
  hr: 'plaze',
  fr: 'plages',
  es: 'playas',
  it: 'spiagge',
  ua: 'plyazhi',
  ru: 'plyazhi',
  pl: 'plaze',
  cs: 'plaze',
  hu: 'strandok',
  bg: 'plyazhove',
  sk: 'plaze',
};

/**
 * Build beach URL for a specific locale
 */
function buildBeachUrl(
  beach: {
    continent_slug?: string | null;
    country_slug?: string | null;
    region_slug?: string | null;
    island_slug?: string | null;
    city_slug?: string | null;
    slug?: string;
  },
  locale: string,
  baseUrl: string,
): string {
  const segments = [
    locale,
    beachesWord[locale],
    beach.continent_slug,
    beach.country_slug,
    beach.region_slug,
    beach.island_slug,
    beach.city_slug,
    beach.slug,
  ].filter(Boolean); // Remove null/undefined values

  return `${baseUrl}/${segments.join('/')}`;
}

export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const apiEndpoint = env.NEXT_PUBLIC_API_ENDPOINT;
  const beachEntries: MetadataRoute.Sitemap = [];

  try {
    console.log('[sitemap/beaches] Fetching beaches from API...');
    console.log('[sitemap/beaches] API ' +
        '' +
        '' +
        '' +
        '' +
        '' +
        'Endpoint:', apiEndpoint);

    // Fetch beaches with pagination to avoid memory exhaustion
    // The API has memory limits, so we fetch in smaller batches
    const limit = 50; // Reduced from 100 to avoid 502 errors
    let page = 1;
    let allBeaches: BeachSchema[] = [];
    let hasMore = true;
    const maxRetries = 3;
    let consecutiveErrors = 0;

    while (hasMore) {
      console.log(`[sitemap/beaches] Fetching page ${page} (limit: ${limit})...`);

      const response = await fetch(`${apiEndpoint}/api/v1/beaches?limit=${limit}&page=${page}`, {
        headers: {
          'Accept-Language': 'en',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      });

      console.log('[sitemap/beaches] API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        console.error(`[sitemap/beaches] API returned ${response.status}: ${response.statusText}`);
        consecutiveErrors++;

        if (consecutiveErrors >= maxRetries) {
          console.log(`[sitemap/beaches] Stopping pagination after ${consecutiveErrors} consecutive errors`);
          break;
        }

        console.log(`[sitemap/beaches] Retrying... (attempt ${consecutiveErrors}/${maxRetries})`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * consecutiveErrors));
        continue; // Retry same page
      }

      // Reset error counter on success
      consecutiveErrors = 0;

      const data = (await response.json()) as {
        data?: BeachSchema[];
        meta?: { current_page?: number; last_page?: number; total?: number }
      };
      const beaches = data.data ?? [];
      const meta = data.meta;

      console.log(`[sitemap/beaches] Fetched ${beaches.length} beaches from page ${page}`);
      console.log('[sitemap/beaches] Pagination meta:', JSON.stringify(meta));

      allBeaches = [...allBeaches, ...beaches];

      // Check if there are more pages
      if (meta?.current_page && meta?.last_page) {
        hasMore = meta.current_page < meta.last_page;
        console.log(`[sitemap/beaches] Page ${meta.current_page} of ${meta.last_page}, hasMore: ${hasMore}`);
        page++;
      } else if (beaches.length === limit) {
        // No pagination metadata, but we got a full page - try next page
        console.log(`[sitemap/beaches] No pagination metadata, but got full page 
        (${beaches.length}), trying next page`);
        page++;
        hasMore = true;
      } else {
        // No pagination metadata and partial page - assume we're done
        console.log(`[sitemap/beaches] No pagination metadata and partial page (${beaches.length}), stopping`);
        hasMore = false;
      }

      // Safety limit: stop after 50 pages (5000 beaches)
      if (page > 50) {
        console.warn('[sitemap/beaches] Reached safety limit of 50 pages, stopping pagination');
        hasMore = false;
      }
    }

    console.log(`[sitemap/beaches] Total beaches fetched: ${allBeaches.length}`);

    // For each beach, create entries for all locales
    for (const beach of allBeaches) {
      if (!beach.slug || !beach.continent_slug || !beach.country_slug) {
        console.warn(
          `[sitemap/beaches] Skipping beach ${beach.id ?? 'unknown'} - missing required slugs`,
        );
        continue;
      }

      // Generate alternate links for this beach (all language versions)
      // Using the same slugs for all locales (only the "beaches" word changes)
      const alternates: Record<string, string> = {};

      for (const locale of locales) {
        alternates[locale] = buildBeachUrl(beach, locale, baseUrl);
      }

      // Create entry for each locale
      for (const locale of locales) {
        const url = buildBeachUrl(beach, locale, baseUrl);

        beachEntries.push({
          url,
          lastModified: new Date(), // Could use beach.updated_at if available
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: alternates,
          },
        });
      }
    }

    console.log(`[sitemap/beaches] Generated ${beachEntries.length} beach URLs`);
  } catch (error) {
    console.error('[sitemap/beaches] Error generating beach sitemap:', error);
  }

  // Generate XML sitemap
  const sitemap = generateSitemapXML(beachEntries);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

/**
 * Generate XML sitemap from MetadataRoute.Sitemap entries
 */
function generateSitemapXML(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const alternates = entry.alternates?.languages
        ? Object.entries(entry.alternates.languages)
            .map(
              ([lang, url]) =>
                `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`,
            )
            .join('\n')
        : '';

      return `  <url>
    <loc>${entry.url}</loc>${alternates ? '\n' + alternates : ''}
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

// Revalidate every 24 hours (ISR)
export const revalidate = 86400;

// Make this route dynamic to avoid blocking the build
// The sitemap will be generated on first request instead of at build time
export const dynamic = 'force-dynamic';


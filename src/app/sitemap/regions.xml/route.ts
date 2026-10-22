import type { MetadataRoute } from 'next';
import { locales, toHtmlLang } from '@/app/config/locales';
import { env } from '@/env';
import type { Region } from '@/lib/api-client/types.gen';

// Localized "beaches" word for each locale
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
  da: 'straande',
  pt: 'praias',
  nl: 'stranden',
  el: 'paralies',
  sq: 'plazhet',
};

/**
 * Build region URL for a specific locale
 * Format: /[locale]/beaches/[continent]/[country]/[region]
 */
function buildRegionUrl(
  region: {
    country?: { slug?: string | null; continent?: { slug?: string | null } | null } | null;
    slug?: string | null;
  },
  locale: string,
  baseUrl: string,
): string {
  const segments = [
    locale,
    beachesWord[locale],
    region.country?.continent?.slug,
    region.country?.slug,
    region.slug,
  ].filter(Boolean);

  return `${baseUrl}/${segments.join('/')}`;
}

/**
 * Generate sitemap XML from entries
 */
function generateSitemapXML(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const alternates = entry.alternates?.languages
        ? Object.entries(entry.alternates.languages)
            .map(
              ([lang, url]) =>
                `    <xhtml:link rel="alternate" hreflang="${toHtmlLang(lang)}" href="${url}" />`,
            )
            .join('\n')
        : '';

      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency ?? 'weekly'}</changefreq>
    <priority>${entry.priority ?? 0.7}</priority>
${alternates}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const apiEndpoint = env.NEXT_PUBLIC_API_ENDPOINT;
  const regionEntries: MetadataRoute.Sitemap = [];

  try {

    const response = await fetch(`${apiEndpoint}/api/v1/regions`, {
      headers: {
        'Accept-Language': 'en',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { data?: Region[] };
    const regions = data.data ?? [];

    // For each region, create entries for all locales
    for (const region of regions) {
      if (!region.slug || !region.country?.slug || !region.country?.continent?.slug) {
        console.warn(
          `[sitemap/regions] Skipping region ${region.code ?? 'unknown'} - missing required slugs`,
        );
        console.warn(
          `[sitemap/regions] Debug: slug=${region.slug}, ` +
            `country.slug=${region.country?.slug}, ` +
            `continent.slug=${region.country?.continent?.slug}`,
        );
        continue;
      }

      // Generate alternate links for this region (all language versions)
      const alternates: Record<string, string> = {};

      for (const locale of locales) {
        alternates[locale] = buildRegionUrl(region, locale, baseUrl);
      }

      // Create entry for each locale
      for (const locale of locales) {
        const url = buildRegionUrl(region, locale, baseUrl);

        regionEntries.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: { languages: alternates },
        });
      }
    }

  } catch (error) {
    console.error('[sitemap/regions] Error generating region sitemap:', error);
  }

  const sitemap = generateSitemapXML(regionEntries);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

export const revalidate = 86400; // Revalidate every 24 hours
export const dynamic = 'force-dynamic'; // Generate on-demand to avoid blocking build

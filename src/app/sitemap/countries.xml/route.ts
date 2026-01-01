import type { MetadataRoute } from 'next';
import { locales } from '@/app/config/locales';
import { env } from '@/env';
import type { Country } from '@/lib/api-client/types.gen';

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
};

/**
 * Build country URL for a specific locale
 * Format: /[locale]/beaches/[continent]/[country]
 */
function buildCountryUrl(
  country: {
    continent?: { slug?: string | null } | null;
    slug?: string | null;
  },
  locale: string,
  baseUrl: string,
): string {
  const segments = [
    locale,
    beachesWord[locale],
    country.continent?.slug,
    country.slug,
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
                `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`,
            )
            .join('\n')
        : '';

      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency ?? 'weekly'}</changefreq>
    <priority>${entry.priority ?? 0.8}</priority>
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
  const countryEntries: MetadataRoute.Sitemap = [];

  try {
    console.log('[sitemap/countries] Fetching countries from API...');
    console.log('[sitemap/countries] API Endpoint:', apiEndpoint);

    const response = await fetch(`${apiEndpoint}/api/v1/countries`, {
      headers: {
        'Accept-Language': 'en',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { data?: Country[] };
    const countries = data.data ?? [];
    console.log(`[sitemap/countries] Fetched ${countries.length} countries`);

    // For each country, create entries for all locales
    for (const country of countries) {
      if (!country.slug || !country.continent?.slug) {
        console.warn(
          `[sitemap/countries] Skipping country ${country.code ?? 'unknown'} - missing required slugs`,
        );
        continue;
      }

      // Generate alternate links for this country (all language versions)
      const alternates: Record<string, string> = {};

      for (const locale of locales) {
        alternates[locale] = buildCountryUrl(country, locale, baseUrl);
      }

      // Create entry for each locale
      for (const locale of locales) {
        const url = buildCountryUrl(country, locale, baseUrl);

        countryEntries.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: { languages: alternates },
        });
      }
    }

    console.log(`[sitemap/countries] Generated ${countryEntries.length} country URLs`);
  } catch (error) {
    console.error('[sitemap/countries] Error generating country sitemap:', error);
  }

  const sitemap = generateSitemapXML(countryEntries);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

export const revalidate = 86400; // Revalidate every 24 hours


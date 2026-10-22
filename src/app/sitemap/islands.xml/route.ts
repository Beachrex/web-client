import { toHtmlLang } from '@/app/config/locales';
import { env } from '@/env';
import type { Island } from '@/lib/api-client/types.gen';

// Revalidate every 24 hours
export const revalidate = 86400;

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

const locales = Object.keys(beachesWord);

/**
 * Build island URL for a specific locale
 * Format: /[locale]/beaches/[continent]/[country]/[region]/[island]
 * Note: Region is optional - only included if present
 */
function buildIslandUrl(
  island: Island & {
    continentSlug?: string | null;
    countrySlug?: string | null;
    regionSlug?: string | null;
  },
  locale: string,
  baseUrl: string,
): string {
  const segments = [
    locale,
    beachesWord[locale],
    island.continentSlug,
    island.countrySlug,
    island.regionSlug,
    island.slug,
  ].filter(Boolean);

  return `${baseUrl}/${segments.join('/')}`;
}

/**
 * Generate sitemap for island pages
 */
export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const apiEndpoint = env.NEXT_PUBLIC_API_ENDPOINT;

  try {
    // Fetch continents, countries, regions, and islands in parallel
    const [continentsRes, countriesRes, regionsRes, islandsRes] = await Promise.all([
      fetch(`${apiEndpoint}/api/v1/continents`, {
        headers: { 'Accept-Language': 'en', 'Content-Type': 'application/json' },
        next: { revalidate: 86400 },
      }),
      fetch(`${apiEndpoint}/api/v1/countries`, {
        headers: { 'Accept-Language': 'en', 'Content-Type': 'application/json' },
        next: { revalidate: 86400 },
      }),
      fetch(`${apiEndpoint}/api/v1/regions`, {
        headers: { 'Accept-Language': 'en', 'Content-Type': 'application/json' },
        next: { revalidate: 86400 },
      }),
      fetch(`${apiEndpoint}/api/v1/islands`, {
        headers: { 'Accept-Language': 'en', 'Content-Type': 'application/json' },
        next: { revalidate: 86400 },
      }),
    ]);

    if (!islandsRes.ok) {
      console.error('Failed to fetch islands:', islandsRes.statusText);
      return new Response('Error generating sitemap', { status: 500 });
    }

    // Parse responses
    const continentsData = (await continentsRes.json()) as { data?: { code: string; slug: string }[] };
    const countriesData = (await countriesRes.json()) as {
      data?: { code: string; slug: string; continent_code: string }[];
    };
    const regionsData = (await regionsRes.json()) as { data?: { id: number; slug: string }[] };
    const islandsData = (await islandsRes.json()) as { data?: Island[] };

    // Build mappings
    const continentMap = new Map((continentsData.data ?? []).map((c) => [c.code, c.slug]));
    const countryMap = new Map(
      (countriesData.data ?? []).map((c) => [
        c.code,
        { slug: c.slug, continentSlug: continentMap.get(c.continent_code) },
      ]),
    );
    const regionMap = new Map((regionsData.data ?? []).map((r) => [r.id, r.slug]));

    // Enrich islands with continent, country, and region slugs
    const islands = (islandsData.data ?? []).map((island) => {
      const country = island.country_code ? countryMap.get(island.country_code) : null;
      return {
        ...island,
        continentSlug: country?.continentSlug ?? null,
        countrySlug: country?.slug ?? null,
        regionSlug: island.region_id ? regionMap.get(island.region_id) : null,
      };
    });


    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Generate URLs for each island in all locales
    for (const island of islands) {
      for (const locale of locales) {
        const url = buildIslandUrl(island, locale, baseUrl);

        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';

        // Add hreflang alternates for all locales
        for (const altLocale of locales) {
          const altUrl = buildIslandUrl(island, altLocale, baseUrl);
          xml += `    <xhtml:link rel="alternate" hreflang="${toHtmlLang(altLocale)}" href="${altUrl}" />\n`;
        }

        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error generating islands sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; // Generate on-demand to avoid blocking build

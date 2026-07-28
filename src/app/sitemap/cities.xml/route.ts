import { env } from '@/env';
import type { City } from '@/lib/api-client/types.gen';

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
 * Build city URL for a specific locale
 * Format: /[locale]/beaches/[continent]/[country]/[region]/[island]/[city]
 * Note: Region and island are optional - only included if present
 */
function buildCityUrl(
  city: City & {
    continentSlug?: string | null;
    regionSlug?: string | null;
    islandSlug?: string | null;
  },
  locale: string,
  baseUrl: string,
): string {
  const segments = [
    locale,
    beachesWord[locale],
    city.continentSlug,
    city.country?.slug,
    city.regionSlug,
    city.islandSlug,
    city.slug,
  ].filter(Boolean);

  return `${baseUrl}/${segments.join('/')}`;
}

/**
 * Generate sitemap for city pages
 */
export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const apiEndpoint = env.NEXT_PUBLIC_API_ENDPOINT;

  try {
    // Fetch continents, regions, islands, and cities in parallel
    const [continentsRes, regionsRes, islandsRes, citiesRes] = await Promise.all([
      fetch(`${apiEndpoint}/api/v1/continents`, {
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
      fetch(`${apiEndpoint}/api/v1/cities?limit=2000`, {
        headers: { 'Accept-Language': 'en', 'Content-Type': 'application/json' },
        next: { revalidate: 86400 },
      }),
    ]);

    if (!citiesRes.ok) {
      console.error('Failed to fetch cities:', citiesRes.statusText);
      return new Response('Error generating sitemap', { status: 500 });
    }

    // Parse responses
    const continentsData = (await continentsRes.json()) as { data?: { code: string; slug: string }[] };
    const regionsData = (await regionsRes.json()) as { data?: { id: number; slug: string }[] };
    const islandsData = (await islandsRes.json()) as { data?: { id: number; slug: string }[] };
    const citiesData = (await citiesRes.json()) as { data?: City[] };

    // Build mappings
    const continentMap = new Map((continentsData.data ?? []).map((c) => [c.code, c.slug]));
    const regionMap = new Map((regionsData.data ?? []).map((r) => [r.id, r.slug]));
    const islandMap = new Map((islandsData.data ?? []).map((i) => [i.id, i.slug]));

    // Enrich cities with continent, region, and island slugs
    const cities = (citiesData.data ?? []).map((city) => ({
      ...city,
      continentSlug: city.country?.continent_code ? continentMap.get(city.country.continent_code) : null,
      regionSlug: city.region_id ? regionMap.get(city.region_id) : null,
      islandSlug: city.island_id ? islandMap.get(city.island_id) : null,
    }));

    console.log(`Generating sitemap for ${cities.length} cities`);

    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Generate URLs for each city in all locales
    for (const city of cities) {
      for (const locale of locales) {
        const url = buildCityUrl(city, locale, baseUrl);

        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';

        // Add hreflang alternates for all locales
        for (const altLocale of locales) {
          const altUrl = buildCityUrl(city, altLocale, baseUrl);
          xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}" />\n`;
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
    console.error('Error generating cities sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; // Generate on-demand to avoid blocking build

import { locales } from '@/app/config/locales';
import { placeAlternates, placePath, type PlaceRef, type PlaceSlugs } from '@/lib/seo/place-paths';

/**
 * Pre-launch SEO (2026-10-23): one sitemap file per section and language. The single beaches sitemap was 158 MB
 * with 54 644 URLs and the cities one 51 MB; search engines accept at most 50 MB and 50 000 URLs per file.
 * Each file holds one language's URLs with hreflang links to the same place in the other languages.
 */
export const SITEMAP_SECTIONS = ['countries', 'regions', 'islands', 'cities', 'beaches'] as const;
export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

const PRIORITY: Record<SitemapSection, string> = {
  countries: '0.9',
  regions: '0.8',
  islands: '0.8',
  cities: '0.7',
  beaches: '0.7',
};

/** `beaches-si.xml` → { section: 'beaches', locale: 'si' }, null for anything else. */
export function parseSitemapFile(file: string): { section: SitemapSection; locale: string } | null {
  const m = /^([a-z]+)-([a-z]{2})\.xml$/.exec(file);
  if (!m) return null;
  const [, section, locale] = m;
  if (!(SITEMAP_SECTIONS as readonly string[]).includes(section!)) return null;
  if (!(locales as readonly string[]).includes(locale!)) return null;
  return { section: section as SitemapSection, locale: locale! };
}

export function sitemapFiles(): string[] {
  return SITEMAP_SECTIONS.flatMap((section) => locales.map((locale) => `${section}-${locale}.xml`));
}

type Row = Record<string, unknown>;

async function getList(apiEndpoint: string, path: string): Promise<Row[]> {
  try {
    const res = await fetch(`${apiEndpoint}/api/v1/${path}`, {
      headers: { 'Accept-Language': 'en', Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Row[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);
const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

/** All active beaches (API pages of 100, English). */
async function getAllBeaches(apiEndpoint: string): Promise<Row[]> {
  const all: Row[] = [];
  for (let page = 1; page <= 300; page++) {
    let rows: Row[] = [];
    let lastPage = page;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${apiEndpoint}/api/v1/beaches?limit=100&page=${page}`, {
          headers: { 'Accept-Language': 'en', Accept: 'application/json' },
          next: { revalidate: 86400 },
        });
        if (res.ok) {
          const json = (await res.json()) as { data?: Row[]; meta?: { last_page?: number } };
          rows = json.data ?? [];
          lastPage = json.meta?.last_page ?? (rows.length === 100 ? page + 1 : page);
          break;
        }
      } catch {
        /* retry */
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
    all.push(...rows);
    if (page >= lastPage || rows.length === 0) break;
  }
  return all;
}

/** The places of a section as language-independent references (codes and ids). */
export async function sectionRefs(apiEndpoint: string, section: SitemapSection): Promise<PlaceRef[]> {
  if (section === 'countries') {
    return (await getList(apiEndpoint, 'countries')).map((c) => ({
      continent: str(c.continent_code),
      country: str(c.code),
    }));
  }
  if (section === 'regions') {
    return (await getList(apiEndpoint, 'regions')).map((r) => ({ country: str(r.country_code), regionId: num(r.id) }));
  }
  if (section === 'islands') {
    return (await getList(apiEndpoint, 'islands')).map((i) => ({
      country: str(i.country_code),
      regionId: num(i.region_id),
      islandId: num(i.id),
    }));
  }
  if (section === 'cities') {
    return (await getList(apiEndpoint, 'cities?limit=5000')).map((c) => ({
      country: str(c.country_code),
      regionId: num(c.region_id),
      islandId: num(c.island_id),
      cityId: num(c.id),
    }));
  }

  // Beaches: the list has English region/island/city slugs; map them to ids per country.
  const [regions, islands, cities, beaches] = await Promise.all([
    getList(apiEndpoint, 'regions'),
    getList(apiEndpoint, 'islands'),
    getList(apiEndpoint, 'cities?limit=5000'),
    getAllBeaches(apiEndpoint),
  ]);
  const index = (rows: Row[]) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const id = num(r.id);
      if (str(r.slug) && id !== null) map.set(`${str(r.country_code)}|${str(r.slug)}`, id);
    }
    return map;
  };
  const regionIds = index(regions);
  const islandIds = index(islands);
  const cityIds = index(cities);
  const id = (map: Map<string, number>, country: string | null, slug: unknown) => {
    const s = str(slug);
    return s ? (map.get(`${country}|${s}`) ?? undefined) : null;
  };

  const refs: PlaceRef[] = [];
  for (const b of beaches) {
    const country = str(b.country_code);
    const slug = str(b.slug);
    if (!country || !slug) continue;
    const regionId = id(regionIds, country, b.region_slug);
    const islandId = id(islandIds, country, b.island_slug);
    const cityId = id(cityIds, country, b.city_slug);
    // A slug in the list that no place list knows: skip rather than publish a wrong URL.
    if (regionId === undefined || islandId === undefined || cityId === undefined) continue;
    refs.push({ continent: str(b.continent_code), country, regionId, islandId, cityId, beach: slug });
  }
  return refs;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** The sitemap XML of one language: its URLs, each with hreflang links to the other languages. */
export function sitemapXml(
  refs: PlaceRef[],
  slugs: PlaceSlugs,
  locale: string,
  section: SitemapSection,
  baseUrl: string,
  lastmod: string,
): string {
  const base = baseUrl.replace(/\/$/, '');
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const ref of refs) {
    const path = placePath(slugs, locale, ref);
    if (!path) continue;
    const loc = `${base}/${locale}${path}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    const links = Object.entries(placeAlternates(slugs, ref, base))
      .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(href)}" />`)
      .join('\n');
    urls.push(
      [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        links,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${PRIORITY[section]}</priority>`,
        '  </url>',
      ].join('\n'),
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Pre-launch SEO 2026-10-23: one URL per page and language, hreflang to the same place in all 19 languages,
 * and sitemap files under the 50 MB / 50 000 URL limit (the beaches sitemap was 158 MB, 54 644 URLs).
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

async function fixture() {
  const { locales } = await import('@/app/config/locales');
  const slugs: Record<string, import('@/lib/seo/place-paths').LocaleSlugs> = {};
  const tr: Record<string, [string, string, string]> = { en: ['europe', 'croatia', 'sardinia'], si: ['evropa', 'hrvaska', 'sardinija'], de: ['europa', 'kroatien', 'sardinien'] };
  for (const l of locales) {
    const [cont, country, island] = tr[l] ?? tr.en!;
    slugs[l] = {
      continent: new Map([['EU', cont]]),
      country: new Map([['HR', country], ['IT', l === 'si' ? 'italija' : 'italy']]),
      countryContinent: new Map([['HR', 'EU'], ['IT', 'EU']]),
      region: new Map([[5, 'istra'], [20, 'sassari']]),
      island: new Map([[27, island]]),
      city: new Map([[206, 'duba']]),
    };
  }
  slugs.sq = { ...slugs.en!, country: new Map() }; // a language without country data
  return slugs;
}

test('a place path uses each language\'s continent, country and island slugs', async () => {
  const { placePath } = await import('@/lib/seo/place-paths');
  const slugs = await fixture();
  const beach = { continent: 'EU', country: 'HR', regionId: 5, cityId: 206, beach: 'beach-spina' };

  expect(placePath(slugs, 'si', beach)).toBe('/plaze/evropa/hrvaska/istra/duba/beach-spina');
  expect(placePath(slugs, 'de', beach)).toBe('/strande/europa/kroatien/istra/duba/beach-spina');
  expect(placePath(slugs, 'si', { country: 'IT', regionId: 20, islandId: 27 })).toBe('/plaze/evropa/italija/sassari/sardinija');
  expect(placePath(slugs, 'si', { continent: 'EU' }), 'continent page').toBe('/plaze/evropa');
  expect(placePath(slugs, 'sq', beach), 'unknown slug: no path rather than a wrong one').toBeNull();
  expect(placePath(slugs, 'si', { ...beach, cityId: 999 })).toBeNull();
});

test('hreflang alternates use language codes and point to each language\'s own URL', async () => {
  const { placeAlternates } = await import('@/lib/seo/place-paths');
  const alt = placeAlternates(await fixture(), { continent: 'EU', country: 'HR', regionId: 5, cityId: 206, beach: 'beach-spina' }, 'https://beachrex.com/');

  expect(alt.sl).toBe('https://beachrex.com/si/plaze/evropa/hrvaska/istra/duba/beach-spina');
  expect(alt.uk).toContain('https://beachrex.com/ua/');
  expect(alt.si, '"si" is Sinhala, never a key').toBeUndefined();
  expect(alt.sq).toBeUndefined();
  expect(alt['x-default']).toBe(alt.en);
  expect(Object.keys(alt)).toHaveLength(19); // 18 languages with data + x-default
});

test('beach details and destination details become place references', async () => {
  const { beachPlaceRef, destinationPlaceRef } = await import('@/lib/seo/place-paths');
  expect(
    beachPlaceRef({
      basic_info: { slug: 'beach-spina' },
      location: { continent: { code: 'EU' }, country: { code: 'HR' }, region: { id: 5, slug: 'istra' }, island: null, city: { id: 206, slug: 'duba' } },
    }),
  ).toEqual({ continent: 'EU', country: 'HR', regionId: 5, islandId: null, cityId: 206, beach: 'beach-spina' });
  expect(destinationPlaceRef('island', { id: 27, country_code: 'IT', region_id: 20 })).toEqual({ country: 'IT', regionId: 20, islandId: 27, cityId: null });
  expect(destinationPlaceRef('city', { id: 206, country: { code: 'HR' }, region_id: 5, island_id: null })).toEqual({ country: 'HR', regionId: 5, islandId: null, cityId: 206 });
});

test('sitemap files are one per section and language, each within the search engine limits', async () => {
  const { sitemapFiles, parseSitemapFile, sitemapXml } = await import('@/lib/seo/sitemap-sections');
  const slugs = await fixture();

  expect(sitemapFiles()).toHaveLength(5 * 19);
  expect(parseSitemapFile('beaches-si.xml')).toEqual({ section: 'beaches', locale: 'si' });
  expect(parseSitemapFile('beaches-xx.xml')).toBeNull();
  expect(parseSitemapFile('../etc-si.xml')).toBeNull();

  // 3 000 beaches (more than the real ~2 900) in one language file
  const refs = Array.from({ length: 3000 }, (_, i) => ({ continent: 'EU', country: 'HR', regionId: 5, cityId: 206, beach: `beach-${i}` }));
  const xml = sitemapXml(refs, slugs, 'si', 'beaches', 'https://beachrex.com', '2026-10-23T00:00:00.000Z');
  expect((xml.match(/<url>/g) ?? []).length).toBe(3000);
  expect(Buffer.byteLength(xml)).toBeLessThan(50 * 1024 * 1024);
  expect(xml).toContain('<loc>https://beachrex.com/si/plaze/evropa/hrvaska/istra/duba/beach-0</loc>');
  expect(xml).toContain('hreflang="de" href="https://beachrex.com/de/strande/europa/kroatien/istra/duba/beach-0"');
  expect(xml).not.toContain('/si/plaze/europe/');
});

test('pages use the API slugs for canonical URLs and full hreflang', () => {
  const beach = read('src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx');
  expect(beach).toContain('permanentRedirect(buildBeachUrl(beach, locale))');
  expect(beach).toContain('buildPlaceAlternates(locale, canonicalPath, beachPlaceRef(beach))');
  expect(beach).not.toContain('buildSelfAlternate(');
  expect(read('src/app/sitemap.xml/route.ts')).toContain("['static.xml', ...sitemapFiles()]");
});

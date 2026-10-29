import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { getBeachMapWord, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * TASK-004 SEO part 2: one h1 per page type, hreflang only where the other locales' URLs are
 * known, a real sitemap index, and metadata for the beach map.
 */

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_BASE_URL = 'https://beachrex.com';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

test('hreflang for localized fixed paths uses each locale\'s own word', async () => {
  const { buildLocalizedAlternates } = await import('@/lib/utils/metadata-helpers');
  const alt = buildLocalizedAlternates((l) => `/${getBeachesWord(l)}`);
  // hreflang keys are language codes: the URL's "si" is Slovenian, "sl" (pre-launch 2026-10-23)
  expect(alt.sl).toBe(`https://beachrex.com/si/${getBeachesWord('si')}`);
  expect(alt.si).toBeUndefined();
  expect(alt.de).toBe(`https://beachrex.com/de/${getBeachesWord('de')}`);
  expect(alt['x-default']).toBe(alt.en);
  const map = buildLocalizedAlternates((l) => `/${getBeachMapWord(l)}`);
  expect(map.hr).toBe(`https://beachrex.com/hr/${getBeachMapWord('hr')}`);
});

test('place pages build hreflang from each language\'s slugs; CMS pages only declare themselves', async () => {
  const { buildSelfAlternate } = await import('@/lib/utils/metadata-helpers');
  expect(buildSelfAlternate('si', '/plaze/evropa/hrvaska')).toEqual({ sl: 'https://beachrex.com/si/plaze/evropa/hrvaska' });
  for (const page of [
    'src/app/[locale]/beaches/[continent]/page.tsx',
    'src/app/[locale]/beaches/[continent]/[country]/page.tsx',
    'src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx',
  ]) {
    expect(read(page), page).toMatch(/buildPlaceAlternates\(locale, /);
  }
  expect(read('src/app/[locale]/p/[slug]/page.tsx')).toMatch(/buildSelfAlternate\(locale, /);
});

test('sitemap.xml is a sitemap index of the section sitemaps', async () => {
  const { GET } = await import('@/app/sitemap.xml/route');
  const xml = await GET().text();
  expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(xml).not.toContain('<urlset');
  // One file per section and language (pre-launch 2026-10-23: the single files were over 50 MB)
  for (const name of ['static', 'beaches-si', 'beaches-en', 'countries-de', 'regions-el', 'cities-ua', 'islands-sq']) {
    expect(xml).toContain(`<loc>https://beachrex.com/sitemap/${name}.xml</loc>`);
  }
  expect((xml.match(/<sitemap>/g) ?? []).length).toBe(1 + 5 * 19);
});

test('page titles are h1 elements; the beach details heading is not', () => {
  expect(read('src/components/BannerSection/BannerSection.tsx')).toMatch(/<h1[\s\S]*?\{title\}[\s\S]*?<\/h1>/);
  expect(read('src/components/Beach/BeachBanner/BeachTitleBlock.tsx')).toMatch(/<h1[\s\S]*?\{title\}[\s\S]*?<\/h1>/);
  expect(read('src/components/Home/HeroSection.tsx')).toMatch(/<h1[\s\S]*?\{heroTitle\}[\s\S]*?<\/h1>/);
  expect(read('src/components/Beach/BeachDetails/beachDetailsSection.tsx')).not.toMatch(/<h1/);
  expect(read('src/app/[locale]/page.tsx')).toMatch(/<HeroSection\s+initialTitle=/);
});

test('beach map has its own metadata and an h1', () => {
  const page = read('src/app/[locale]/beach-map/page.tsx');
  expect(page).toMatch(/export async function generateMetadata/);
  expect(page).toMatch(/beachMapTitle/);
  expect(page).toMatch(/<h1 className="sr-only">/);
  expect(page).not.toMatch(/'use client'/);
});

test('home page canonical and hreflang have no trailing slash (/{locale}/ redirects to /{locale})', async () => {
  // Regression (owner 2026-10-29 launch): canonical https://beachrex.com/si/ pointed Google at a 308 redirect.
  const { buildCanonicalUrl, buildAlternateLanguages, buildLocalizedAlternates, localeSuffix } = await import(
    '@/lib/utils/metadata-helpers'
  );
  expect(buildCanonicalUrl('si', '/')).toBe('https://beachrex.com/si');
  expect(buildCanonicalUrl('si', '')).toBe('https://beachrex.com/si');
  expect(buildCanonicalUrl('en', '/beaches/')).toBe('https://beachrex.com/en/beaches');
  expect(buildCanonicalUrl('en', 'beaches')).toBe('https://beachrex.com/en/beaches');
  const alt = buildAlternateLanguages('/');
  expect(alt.sl).toBe('https://beachrex.com/si');
  expect(alt['x-default']).toBe('https://beachrex.com/en');
  expect(buildLocalizedAlternates(() => '/').de).toBe('https://beachrex.com/de');
  expect(localeSuffix('/a/b/')).toBe('/a/b');
});

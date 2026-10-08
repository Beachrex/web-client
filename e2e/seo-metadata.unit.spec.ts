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
  expect(alt.si).toBe(`https://beachrex.com/si/${getBeachesWord('si')}`);
  expect(alt.de).toBe(`https://beachrex.com/de/${getBeachesWord('de')}`);
  expect(alt['x-default']).toBe(alt.en);
  const map = buildLocalizedAlternates((l) => `/${getBeachMapWord(l)}`);
  expect(map.hr).toBe(`https://beachrex.com/hr/${getBeachMapWord('hr')}`);
});

test('pages with localized slugs only declare themselves (no wrong cross-locale hreflang)', async () => {
  const { buildSelfAlternate } = await import('@/lib/utils/metadata-helpers');
  expect(buildSelfAlternate('si', '/plaze/evropa/hrvaska')).toEqual({ si: 'https://beachrex.com/si/plaze/evropa/hrvaska' });
  for (const page of [
    'src/app/[locale]/beaches/[continent]/page.tsx',
    'src/app/[locale]/beaches/[continent]/[country]/page.tsx',
    'src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx',
    'src/app/[locale]/p/[slug]/page.tsx',
  ]) {
    expect(read(page), page).toMatch(/buildSelfAlternate\(locale, /);
  }
});

test('sitemap.xml is a sitemap index of the section sitemaps', async () => {
  const { GET } = await import('@/app/sitemap.xml/route');
  const xml = await GET().text();
  expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  expect(xml).not.toContain('<urlset');
  for (const name of ['static', 'beaches', 'countries', 'regions', 'cities', 'islands']) {
    expect(xml).toContain(`<loc>https://beachrex.com/sitemap/${name}.xml</loc>`);
  }
});

test('page titles are h1 elements; the beach details heading is not', () => {
  expect(read('src/components/BannerSection/BannerSection.tsx')).toMatch(/<h1[\s\S]*?\{title\}[\s\S]*?<\/h1>/);
  expect(read('src/components/Beach/BeachBanner/BeachTitleBlock.tsx')).toMatch(/<h1[\s\S]*?\{title\}[\s\S]*?<\/h1>/);
  expect(read('src/components/Home/HeroSection.tsx')).toMatch(/<h1[\s\S]*?\{heroTitle\}[\s\S]*?<\/h1>/);
  expect(read('src/components/Beach/BeachDetails/beachDetailsSection.tsx')).not.toMatch(/<h1/);
  expect(read('src/app/[locale]/page.tsx')).toMatch(/<HeroSection initialTitle=/);
});

test('beach map has its own metadata and an h1', () => {
  const page = read('src/app/[locale]/beach-map/page.tsx');
  expect(page).toMatch(/export async function generateMetadata/);
  expect(page).toMatch(/beachMapTitle/);
  expect(page).toMatch(/<h1 className="sr-only">/);
  expect(page).not.toMatch(/'use client'/);
});

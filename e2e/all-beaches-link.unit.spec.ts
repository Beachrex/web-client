import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * TASK-004 audit D7: "All beaches (n)" on country, region, island and city pages was `href="#"`
 * and counted only the 20 cards of the carousel. It now jumps to the full list on the same page
 * and shows the place's total beach count.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const pages: Record<string, string> = {
  'src/app/[locale]/beaches/[continent]/[country]/page.tsx': 'countryBeachesCount',
  'src/components/Pages/RegionListingPage.tsx': 'regionBeachesCount',
  'src/components/Pages/IslandListingPage.tsx': 'islandBeachesCount',
  'src/components/Pages/CityListingPage.tsx': 'cityBeachesCount',
};

test('pages use the shared link with the total beach count, never href="#"', () => {
  for (const [file, count] of Object.entries(pages)) {
    const source = read(file);
    expect(source, file).not.toMatch(/href="#"/);
    expect(source, file).toContain(`<AllBeachesLink label={tProperty('allBeachesLink', { count: ${count} })} />`);
  }
});

test('the link targets the browse section id', async () => {
  const { ALL_BEACHES_SECTION_ID } = await import('@/components/AllBeachesLink');
  expect(read('src/components/AllBeachesLink.tsx')).toContain('href={`#${ALL_BEACHES_SECTION_ID}`}');
  expect(read('src/components/DynamicSearchBeaches.tsx')).toContain('id={ALL_BEACHES_SECTION_ID}');
  expect(ALL_BEACHES_SECTION_ID).toBe('all-beaches');
});

/**
 * Dev 2026-10-28: the Toscana page still showed "All beaches (20)" (43 beaches): PropertySection accepted `headerRight`
 * but never rendered it, so the carousel expander with its card count stood in for the link above.
 */
test('the popular-beaches section shows the page link instead of its card-count expander', () => {
  const source = read('src/components/PropertySection.tsx');
  const props = source.slice(source.indexOf('export const PropertySection'), source.indexOf('=> {', source.indexOf('export const PropertySection')));
  expect(props, 'headerRight is read').toContain('headerRight');
  expect(source).toContain('{headerRight ?? (');
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-28: "Sort by" (alphabetical / most / fewest beaches) also on the country page (regions, cities,
 * islands), the region page (islands, cities) and the island page (cities) — same control as the continent page.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const items = [
  { name: 'Žirje', beaches_count: 4 },
  { name: 'Čiovo', beaches_count: 12 },
  { name: 'Zadar', beaches_count: 4 },
  { name: 'Šolta', beaches_count: 7 },
  { name: 'Cres', beaches_count: 12 },
  { name: 'Sveti Andrija', beaches_count: undefined },
  { name: 'Silba', beaches_count: 7 },
];
const names = (list: { name?: string }[]) => list.map((i) => i.name);

test('alphabetical uses the locale collation (Slovenian: c < č, s < š, z < ž)', async () => {
  const { sortDestinations } = await import('@/lib/utils/destination-sort');
  expect(names(sortDestinations(items, 'name', 'si'))).toEqual([
    'Cres', 'Čiovo', 'Silba', 'Sveti Andrija', 'Šolta', 'Zadar', 'Žirje',
  ]);
});

test('most beaches first, ties by name, missing count last', async () => {
  const { sortDestinations } = await import('@/lib/utils/destination-sort');
  expect(names(sortDestinations(items, 'beaches_desc', 'si'))).toEqual([
    'Cres', 'Čiovo', 'Silba', 'Šolta', 'Zadar', 'Žirje', 'Sveti Andrija',
  ]);
});

test('fewest beaches first, ties by name, missing count as 0', async () => {
  const { sortDestinations } = await import('@/lib/utils/destination-sort');
  expect(names(sortDestinations(items, 'beaches_asc', 'si'))).toEqual([
    'Sveti Andrija', 'Zadar', 'Žirje', 'Silba', 'Šolta', 'Cres', 'Čiovo',
  ]);
});

test('sorting returns a new array, keeps the input and handles empty lists', async () => {
  const { sortDestinations, isDestinationSort, DEFAULT_DESTINATION_SORT } = await import('@/lib/utils/destination-sort');
  const input = [...items];
  sortDestinations(input, 'beaches_desc', 'en');
  expect(input).toEqual(items);
  expect(sortDestinations([], 'name', 'en')).toEqual([]);
  expect(DEFAULT_DESTINATION_SORT).toBe('name');
  expect(isDestinationSort('beaches_asc')).toBe(true);
  expect(isDestinationSort('popular')).toBe(false);
});

test('country, region and island sub-lists turn the sort control on', () => {
  const country = read('src/app/[locale]/beaches/[continent]/[country]/page.tsx');
  const region = read('src/components/Pages/RegionListingPage.tsx');
  const island = read('src/components/Pages/IslandListingPage.tsx');
  const sortableSections = (src: string) =>
    [...src.matchAll(/type: '(\w+)',[^}]*?sortable: true/g)].map((m) => m[1]);

  expect(sortableSections(country)).toEqual(['region', 'city', 'island']);
  expect(sortableSections(region)).toEqual(['island', 'city']);
  expect(sortableSections(island)).toEqual(['city']);
  expect(read('src/components/DestinationsSection.tsx')).toContain('<DestinationSortSelect');
  expect(read('src/components/Continent/ContinentCountriesSection.tsx')).toContain('<DestinationSortSelect');
});

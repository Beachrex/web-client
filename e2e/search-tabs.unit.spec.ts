import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-22: the search dropdown is split into tabs per result type (beaches, cities, islands, regions,
 * countries); "All" puts the closest name matches first ("albanija" → the country Albania on top).
 */
const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), 'utf8');

type R = { type: 'beach' | 'city' | 'island' | 'region' | 'country'; name: string };
const albania: R[] = [
  { type: 'beach', name: 'Plazhi Ksamil 2' },
  { type: 'beach', name: 'Plazhi i Pasqyrave' },
  { type: 'city', name: 'Arbanija' },
  { type: 'city', name: 'Ksamil' },
  { type: 'region', name: 'Vlorë' },
  { type: 'region', name: 'Drač' },
  { type: 'country', name: 'Albanija' },
];

test('tabs: All plus one tab per type with results, in a fixed order', async () => {
  const { searchTabs } = await import('@/lib/utils/search-tabs');

  expect(searchTabs(albania)).toEqual([
    { tab: 'all', count: 7 },
    { tab: 'beach', count: 2 },
    { tab: 'city', count: 2 },
    { tab: 'region', count: 2 },
    { tab: 'country', count: 1 },
  ]);
  expect(searchTabs(albania.filter((r) => r.type === 'beach')), 'one type: no tabs').toEqual([]);
  expect(searchTabs([])).toEqual([]);
});

test('All puts the exact name match first and keeps the API order otherwise', async () => {
  const { resultsForTab } = await import('@/lib/utils/search-tabs');

  const all = resultsForTab(albania, 'all', 'albanija').map((r) => r.name);
  expect(all[0]).toBe('Albanija');
  expect(all.slice(1)).toEqual(['Plazhi Ksamil 2', 'Plazhi i Pasqyrave', 'Arbanija', 'Ksamil', 'Vlorë', 'Drač']);

  expect(resultsForTab(albania, 'all', 'ksamil').map((r) => r.name).slice(0, 2), 'exact before word match').toEqual(['Ksamil', 'Plazhi Ksamil 2']);
  expect(resultsForTab(albania, 'all', 'drac')[0]?.name, 'diacritics are ignored').toBe('Drač');
  expect(resultsForTab(albania, 'region', 'albanija').map((r) => r.name)).toEqual(['Vlorë', 'Drač']);
});

test('match rank: exact, prefix, word prefix, other', async () => {
  const { matchRank } = await import('@/lib/utils/search-tabs');

  expect(matchRank('Albanija', ' ALBANIJA ')).toBe(0);
  expect(matchRank('Albanija jug', 'alban')).toBe(1);
  expect(matchRank('Plazhi Ksamil 2', 'ksa')).toBe(2);
  expect(matchRank('Arbanija', 'albanija')).toBe(3);
});

test('the dropdown renders the tabs and uses the tab results for the list and the keyboard', () => {
  const search = read('src/components/Header/GlobalSearch.tsx');

  expect(search).toContain('role="tablist"');
  expect(search).toContain('{visibleResults.map((result, index) => (');
  expect(search).toContain('handleResultClick(visibleResults[selectedIndex])');
  expect(search).not.toContain('{results.map((result, index) => (');
});

test('tab labels exist in all 19 languages', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    const s = JSON.parse(read(`messages/${f}`)).Search;
    for (const k of ['tabAll', 'tabBeaches', 'tabCities', 'tabIslands', 'tabRegions', 'tabCountries', 'tabsLabel']) {
      expect(s?.[k], `${f} ${k}`).toBeTruthy();
    }
  }
});

/** Owner 2026-10-22: "Show all" opens the beach map filtered to the place the query names. */
test('show all targets the place the query names and builds the map filter', async () => {
  const { showAllTarget, showAllQuery } = await import('@/lib/utils/search-tabs');
  const results = [
    { type: 'beach' as const, name: 'Plazhi Ksamil 2' },
    { type: 'city' as const, name: 'Arbanija', code: 'arbanija' },
    { type: 'region' as const, name: 'Vlorë', code: 'vlore' },
    { type: 'country' as const, name: 'Albanija', code: 'AL' },
  ];

  const country = showAllTarget(results, 'albanija');
  expect(country?.name).toBe('Albanija');
  expect(showAllQuery(country!)).toBe('country=AL');
  expect(showAllQuery(showAllTarget(results, 'vlo')!), 'prefix match on a region').toBe('region=vlore');
  expect(showAllTarget(results, 'ksamil'), 'only a beach matches: no target').toBeNull();
  expect(showAllTarget([{ type: 'country' as const, name: 'Grčija' }], 'grčija'), 'no code: no target').toBeNull();
});

test('the dropdown shows the button and the label exists in all 19 languages', () => {
  expect(read('src/components/Header/GlobalSearch.tsx')).toContain('data-testid="search-show-all"');
  for (const f of readdirSync(join(root, 'messages')).filter((x) => x.endsWith('.json'))) {
    expect(JSON.parse(read(`messages/${f}`)).Search?.showAllOnMap, f).toContain('{name}');
  }
});

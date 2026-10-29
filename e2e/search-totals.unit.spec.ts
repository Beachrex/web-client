import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-28: "France" showed "All 28 = Beaches 10 + Cities 10 + Regions 7 + Country 1" although France has
 * ~400 beaches and 87 towns. The badges now show the API's real totals (`meta.totals_by_type`).
 */
const root = process.cwd();

type R = { type: 'beach' | 'city' | 'island' | 'region' | 'country'; name: string };
const list = (type: R['type'], n: number): R[] => Array.from({ length: n }, (_, i) => ({ type, name: `${type} ${i}` }));
const france: R[] = [...list('beach', 10), ...list('city', 10), ...list('region', 7), ...list('country', 1)];
const franceMeta = {
  query: 'france',
  total_results: 28,
  results_by_type: { beaches: 10, cities: 10, islands: 0, regions: 7, countries: 1 },
  total_matches: 507,
  totals_by_type: { beaches: 412, cities: 87, islands: 0, regions: 7, countries: 1 },
  place: { type: 'country', id: 12, code: 'FR', name: 'France' },
};

test('meta: totals and place are read from the API, anything malformed is ignored', async () => {
  const { parseSearchMeta } = await import('@/lib/utils/search-totals');

  expect(parseSearchMeta(franceMeta)).toEqual({
    totals: { beach: 412, city: 87, island: 0, region: 7, country: 1 },
    place: { type: 'country', id: 12, code: 'FR', name: 'France' },
  });
  expect(parseSearchMeta(undefined), 'old API').toEqual({ totals: null, place: null });
  expect(parseSearchMeta({ results_by_type: { beaches: 10 } }), 'old API').toEqual({ totals: null, place: null });
  expect(
    parseSearchMeta({ totals_by_type: { beaches: '412', cities: -1, regions: 7.5, islands: 3, foo: 9 }, place: null }),
  ).toEqual({ totals: { island: 3 }, place: null });
  expect(parseSearchMeta({ place: { type: 'beach', id: 1, name: 'x' } }).place, 'a beach is not a place').toBeNull();
  expect(parseSearchMeta({ place: { type: 'region', id: 3, code: null, name: 'Toscana' } }).place).toEqual({
    type: 'region', id: 3, code: null, name: 'Toscana',
  });
});

test('tabs: badges show the real totals and All is their sum', async () => {
  const { searchTabs } = await import('@/lib/utils/search-tabs');
  const { parseSearchMeta } = await import('@/lib/utils/search-totals');

  expect(searchTabs(france, parseSearchMeta(franceMeta).totals)).toEqual([
    { tab: 'all', count: 507 },
    { tab: 'beach', count: 412 },
    { tab: 'city', count: 87 },
    { tab: 'region', count: 7 },
    { tab: 'country', count: 1 },
  ]);
  // Without totals (old API): item counts, as before
  expect(searchTabs(france)[0]).toEqual({ tab: 'all', count: 28 });
  // A total below the listed items (stale cache) never shrinks the badge
  expect(searchTabs(france, { beach: 3, city: 10 })[1]).toEqual({ tab: 'beach', count: 10 });
  // A type with a total but no items gets no tab
  expect(searchTabs(list('beach', 2).concat(list('city', 1)), { beach: 2, city: 1, island: 5 }).map((t) => t.tab))
    .toEqual(['all', 'beach', 'city']);
});

test('more matches: a type tab that lists fewer than it matched says so; equal or All → nothing', async () => {
  const { moreMatches } = await import('@/lib/utils/search-tabs');
  const totals = { beach: 412, city: 87, region: 7, country: 1 };

  expect(moreMatches(france, totals, 'beach')).toEqual({ type: 'beach', shown: 10, total: 412 });
  expect(moreMatches(france, totals, 'city')).toEqual({ type: 'city', shown: 10, total: 87 });
  expect(moreMatches(france, totals, 'region'), 'total == shown').toBeNull();
  expect(moreMatches(france, totals, 'all'), 'All mixes types').toBeNull();
  expect(moreMatches(france, null, 'beach'), 'old API').toBeNull();
  expect(moreMatches(list('beach', 10), { beach: 11 }, 'all'), 'one type, no tabs: still told').toEqual({
    type: 'beach', shown: 10, total: 11,
  });
});

test('badge numbers are localized and compact from 1 000 on', async () => {
  const { formatCount } = await import('@/lib/utils/search-totals');

  expect(formatCount(0, 'en')).toBe('0');
  expect(formatCount(412, 'en')).toBe('412');
  expect(formatCount(999, 'si')).toBe('999');
  expect(formatCount(1000, 'en')).toBe('1K');
  expect(formatCount(1234, 'en')).toBe('1.2K');
  expect(formatCount(1234, 'si')).toContain('1,2');
  expect(formatCount(1234, 'ua'), 'ua → uk').not.toBe('1234');
});

test('new search strings exist in all 19 languages with their placeholders', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const file of files) {
    const search = JSON.parse(readFileSync(join(root, 'messages', file), 'utf8')).Search;
    expect(search.showingOf, file).toContain('{shown}');
    expect(search.showingOf, file).toContain('{total}');
    expect(search.openPlace, file).toContain('{name}');
    expect(`${search.showingOf}${search.openPlace}`, `${file}: single braces`).not.toContain('{{');
  }
});

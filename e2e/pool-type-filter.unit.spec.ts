import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-29: "filter bi mogli razbit na notranji in zunanji bazen … če stisneš na prvi strani outdoor ali
 * indoor, filter ne zazna". Indoor / outdoor pools are shown under "Pool" in the water body filter and set the
 * API's `pool_type`; `waterbody=pool` still means every pool place.
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

// Shape of GET /beaches/filters (sl)
const groups = {
  waterbody: {
    title: 'Vodna površina',
    options: [
      { id: 1, code: 'sea', name: 'Morje' },
      { id: 2, code: 'lake', name: 'Jezero' },
      { id: 3, code: 'river', name: 'Reka' },
      { id: 4, code: 'pool', name: 'Bazen' },
    ],
  },
  pool_type: {
    title: 'Vrsta bazena',
    options: [
      { code: 'indoor', value: 'indoor', name: 'Notranji bazen' },
      { code: 'outdoor', value: 'outdoor', name: 'Zunanji bazen' },
    ],
  },
};

test('pool types are listed right after "Bazen", nested, with the API labels', async () => {
  const { waterbodyChoices, mergesPoolTypes } = await import('@/lib/utils/waterbody-filter');
  expect(mergesPoolTypes(groups)).toBe(true);
  expect(waterbodyChoices(groups).map((c) => [c.filterKey, c.code, c.label, c.nested])).toEqual([
    ['waterbody', 'sea', 'Morje', false],
    ['waterbody', 'lake', 'Jezero', false],
    ['waterbody', 'river', 'Reka', false],
    ['waterbody', 'pool', 'Bazen', false],
    ['pool_type', 'indoor', 'Notranji bazen', true],
    ['pool_type', 'outdoor', 'Zunanji bazen', true],
  ]);
});

test('without a "pool" water body or without pool types nothing is merged', async () => {
  const { waterbodyChoices, mergesPoolTypes } = await import('@/lib/utils/waterbody-filter');
  const noPool = { ...groups, waterbody: { ...groups.waterbody, options: groups.waterbody.options.slice(0, 3) } };
  expect(mergesPoolTypes(noPool)).toBe(false);
  expect(waterbodyChoices(noPool).map((c) => c.code)).toEqual(['sea', 'lake', 'river']);
  expect(mergesPoolTypes({ waterbody: groups.waterbody })).toBe(false);
  expect(waterbodyChoices({ waterbody: groups.waterbody }).map((c) => c.code)).toEqual(['sea', 'lake', 'river', 'pool']);
  expect(waterbodyChoices(null)).toEqual([]);
});

test('ticking a pool type sets pool_type and keeps waterbody (waterbody=pool still means both)', async () => {
  const { waterbodyChoices, isChoiceSelected, toggleChoice, waterbodySelectedCount } = await import(
    '@/lib/utils/waterbody-filter'
  );
  const choices = waterbodyChoices(groups);
  const pick = (code: string) => {
    const choice = choices.find((c) => c.code === code);
    if (!choice) throw new Error(`no choice ${code}`);
    return choice;
  };
  const [pool, indoor, outdoor] = [pick('pool'), pick('indoor'), pick('outdoor')];

  // URL of the home page "indoor pools" tile: ?pool_type=indoor
  const fromHome = { pool_type: 'indoor' };
  expect(isChoiceSelected(fromHome, indoor)).toBe(true);
  expect(isChoiceSelected(fromHome, outdoor)).toBe(false);
  expect(isChoiceSelected(fromHome, pool)).toBe(false);
  expect(waterbodySelectedCount(fromHome, true)).toBe(1);
  expect(waterbodySelectedCount(fromHome, false)).toBe(0);

  expect(toggleChoice(fromHome, outdoor)).toBe('indoor,outdoor');
  expect(toggleChoice(fromHome, indoor)).toBeUndefined();
  expect(toggleChoice({ waterbody: 'sea' }, pool)).toBe('sea,pool');

  const legacy = { waterbody: 'pool' };
  expect(isChoiceSelected(legacy, pool)).toBe(true);
  expect(isChoiceSelected(legacy, indoor)).toBe(false);
  expect(waterbodySelectedCount({ waterbody: 'sea,pool', pool_type: 'indoor,outdoor' }, true)).toBe(4);
});

test('listing page select: pool types round-trip through the select value', async () => {
  const { waterbodyChoices, choiceSelectValue, waterbodySelectValue, waterbodyFromSelectValue } = await import(
    '@/lib/utils/waterbody-filter'
  );
  const values = waterbodyChoices(groups).map(choiceSelectValue);
  expect(values).toEqual(['sea', 'lake', 'river', 'pool', 'pool_type:indoor', 'pool_type:outdoor']);

  expect(waterbodyFromSelectValue('pool_type:indoor')).toEqual({ waterbody: undefined, pool_type: 'indoor' });
  expect(waterbodyFromSelectValue('pool')).toEqual({ waterbody: 'pool', pool_type: undefined });
  expect(waterbodyFromSelectValue('')).toEqual({ waterbody: undefined, pool_type: undefined });

  expect(waterbodySelectValue({ pool_type: 'outdoor' })).toBe('pool_type:outdoor');
  expect(waterbodySelectValue({ waterbody: 'lake' })).toBe('lake');
  expect(waterbodySelectValue({ pool_type: 'indoor,outdoor' })).toBe('');
  expect(waterbodySelectValue({})).toBe('');
});

test('regression: the home page tiles send pool_type values the map keeps and labels', async () => {
  const home = read('src/components/Home/BeachCategorySearch.tsx');
  const sent = [...home.matchAll(/navigateToMapWithFilters\(\{ pool_type: \['(\w+)'\] \}\)/g)].map((m) => m[1] ?? '');
  expect(sent.sort()).toEqual(['indoor', 'outdoor']);

  // The map drops a filter value no option matches; both tile values must survive and get a label
  const { optionMatches } = await import('@/lib/utils/filter-options');
  const { filterChips } = await import('@/lib/utils/filter-chips');
  for (const value of sent) {
    expect(groups.pool_type.options.some((o) => optionMatches(o, value))).toBe(true);
  }
  expect(filterChips({ pool_type: 'indoor' }, groups).map((c) => c.label)).toEqual(['Notranji bazen']);
});

test('the map sidebar, home filter modal and listing select use the merged water body choices', () => {
  const sidebar = read('src/components/Map/LeftSidebarFilters.tsx');
  expect(sidebar).toContain('waterbodyChoices(');
  expect(sidebar).toMatch(/filterKey === POOL_TYPE_KEY && poolTypesMerged\) return null/);
  expect(read('src/components/Home/FilterModal.tsx')).toContain('waterbodyChoices(');
  expect(read('src/components/DynamicSearchBeaches.tsx')).toContain('waterbodyFromSelectValue(v)');
});

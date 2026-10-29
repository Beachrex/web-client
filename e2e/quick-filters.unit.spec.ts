import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { MAP_QUICK_FILTERS } from '@/config/mapQuickFilters';
import {
  isQuickFilterSelected,
  onlyQuickFilters,
  resolveQuickFilters,
  toggleFilterValue,
} from '@/lib/utils/quick-filters';

/**
 * Beach map quick filters (owner, 2026-10-08): with advanced filters off, the sidebar shows
 * icon tiles. Options and labels come from GET /beaches/filters; the config only picks them.
 */

const apiFilters = {
  beach_type: { options: [{ code: 'sand', name: 'Pesek' }, { code: 'small_stones', name: 'Drobni kamni' }] },
  user_type: { options: [{ code: 'youth', name: 'Zabava' }] },
  location_infrastructure: { options: [{ code: 'parking', name: 'Parkirišče' }] },
};

test.describe('resolveQuickFilters', () => {
  test('keeps config order, uses API labels and drops options the API does not return', () => {
    const tiles = resolveQuickFilters(MAP_QUICK_FILTERS, apiFilters);
    expect(tiles.map((t) => `${t.filterKey}:${t.code}:${t.label}`)).toEqual([
      'beach_type:sand:Pesek',
      'beach_type:small_stones:Drobni kamni',
      'user_type:youth:Zabava',
      'location_infrastructure:parking:Parkirišče',
    ]);
  });

  test('no filter data yet → no tiles', () => {
    expect(resolveQuickFilters(MAP_QUICK_FILTERS, null)).toEqual([]);
  });

  test('every configured icon exists in public/', () => {
    for (const pick of MAP_QUICK_FILTERS) {
      expect(existsSync(path.join(process.cwd(), 'public', pick.icon)), pick.icon).toBe(true);
    }
  });

  test('no option is configured twice', () => {
    const keys = MAP_QUICK_FILTERS.map((p) => `${p.filterKey}:${p.optionCode}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

test.describe('quick filter selection', () => {
  test('toggle adds and removes one code in the comma-separated value', () => {
    expect(toggleFilterValue(undefined, 'sand')).toBe('sand');
    expect(toggleFilterValue('sand', 'small_stones')).toBe('sand,small_stones');
    expect(toggleFilterValue('sand,small_stones', 'sand')).toBe('small_stones');
    expect(toggleFilterValue('sand', 'sand')).toBeUndefined();
  });

  test('selected state reads the same value', () => {
    expect(isQuickFilterSelected({ beach_type: 'sand,small_stones' }, 'beach_type', 'small_stones')).toBe(true);
    expect(isQuickFilterSelected({ beach_type: 'sand' }, 'beach_type', 'grass_beach')).toBe(false);
  });

  test('advanced filters open only when the selection has a non-quick value', () => {
    expect(onlyQuickFilters({}, MAP_QUICK_FILTERS)).toBe(true);
    expect(onlyQuickFilters({ beach_type: 'sand', user_type: 'youth' }, MAP_QUICK_FILTERS)).toBe(true);
    expect(onlyQuickFilters({ beach_type: 'sand,concrete' }, MAP_QUICK_FILTERS)).toBe(false);
    expect(onlyQuickFilters({ waterbody: 'sea' }, MAP_QUICK_FILTERS)).toBe(false);
  });
});

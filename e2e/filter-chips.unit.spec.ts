import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-23: every selected filter value as a chip with its own ✕ (also when its section is closed),
 * several countries / regions / islands / towns at once, and sections no longer collapse on every change.
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

const groups = {
  country: { title: 'Država', options: [{ code: 'HR', name: 'Hrvaška' }, { code: 'IT', name: 'Italija' }] },
  region: { title: 'Regija', options: [{ code: 'istra', name: 'Istra' }, { code: 'kvarner', name: 'Kvarner' }] },
  beach_type: { title: 'Tip plaže', options: [{ code: 'sand', name: 'Pesek' }] },
  parking: { title: 'Parkirišče', options: [] },
};

test('one chip per selected value, labelled from the options, view state left out', async () => {
  const { filterChips } = await import('@/lib/utils/filter-chips');
  const chips = filterChips(
    { region: 'istra,kvarner', country: 'HR', beach_type: 'sand', parking: '1', lat: '45.1', beach_id: '7', unknown_key: 'x' },
    groups,
  );
  expect(chips.map((c) => `${c.filterKey}:${c.label}`)).toEqual([
    'country:Hrvaška',
    'region:Istra',
    'region:Kvarner',
    'beach_type:Pesek',
    'parking:Parkirišče',
    'unknown_key:x',
  ]);
  expect(filterChips({}, groups)).toEqual([]);
  expect(filterChips({ country: '' }, groups)).toEqual([]);
});

test('removing a chip keeps every other value and filter', async () => {
  const { filterChips, withoutChip } = await import('@/lib/utils/filter-chips');
  const filters = { country: 'HR,IT', region: 'istra' };
  const [hr, it, istra] = filterChips(filters, groups);

  expect(withoutChip(filters, hr!)).toBe('IT');
  expect(withoutChip(filters, it!)).toBe('HR');
  expect(withoutChip(filters, istra!), 'last value: the key goes').toBeUndefined();
  expect(withoutChip({ country: 'IT' }, hr!), 'already gone: unchanged').toBe('IT');
});

test('the sidebar shows the chips, allows several places and keeps sections open', () => {
  const sidebar = read('src/components/Map/LeftSidebarFilters.tsx');
  expect(sidebar).toContain('handleFilterChange(chip.filterKey, withoutChip(currentFilters, chip))');
  expect(sidebar, 'the country is a single choice').toContain("multiple={Boolean(allKey) && filterName !== 'country'}");
  expect(sidebar).not.toContain('setExpandedSections({});');
  expect(sidebar, 'labels stay while the next options load').toContain('placeholderData: keepPreviousData');
  expect(sidebar, 'validation still waits for the new options').toContain('const isLoading = isFirstLoad || isPlaceholderData;');
  expect(sidebar, 'the list does not hide on every change').toContain('{!isFirstLoad && !error && filterOptions && (');

  const select = read('src/components/ui/SearchableSelect.tsx');
  expect(select).toContain('aria-multiselectable={multiple || undefined}');
  expect(select).toContain('return; // keep the list open to pick more');
});

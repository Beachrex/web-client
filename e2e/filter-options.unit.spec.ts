import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Mobile report 2026-10-09: the parking and swimming-pool filters (options with only `value: "1"`) were
 * dropped, because the selected value was matched against code/slug/id only.
 */
test('a selected filter value matches an option by code, slug, id or value', async () => {
  const { optionMatches } = await import('@/lib/utils/filter-options');

  expect(optionMatches({ value: '1' }, '1')).toBe(true); // parking / has_swimming_pool (older API)
  expect(optionMatches({ code: '1', value: '1' }, 1)).toBe(true);
  expect(optionMatches({ code: 'sand' }, 'sand')).toBe(true);
  expect(optionMatches({ slug: 'pjescana' }, 'pjescana')).toBe(true);
  expect(optionMatches({ id: 7 }, '7')).toBe(true);
  expect(optionMatches({ code: 'sand' }, 'pebble')).toBe(false);
  expect(optionMatches({}, 'undefined')).toBe(false);
});

test('both filter validators use the shared matcher', () => {
  const root = process.cwd();
  for (const f of ['src/hooks/useBeachFiltersController.ts', 'src/components/Map/MapWithSidebar.tsx']) {
    expect(readFileSync(join(root, f), 'utf8'), f).toContain('optionMatches(opt,');
  }
});

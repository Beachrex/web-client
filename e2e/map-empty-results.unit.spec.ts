import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-22: on the beach map, waterbody=pool or river showed every beach instead of 0.
 * The map ignored empty responses and kept the previous list.
 */
test('an empty response replaces the previous beaches; a pending one keeps them', async () => {
  const { nextDisplayedBeaches } = await import('@/lib/utils/map-results');
  const previous = [{ id: 1 }, { id: 2 }];

  expect(nextDisplayedBeaches(previous, [])).toEqual([]);
  expect(nextDisplayedBeaches(previous, undefined)).toBe(previous);
  expect(nextDisplayedBeaches(previous, [{ id: 3 }])).toEqual([{ id: 3 }]);
});

test('the map list shows the "no beaches found" message for an empty result', () => {
  const src = readFileSync(join(process.cwd(), 'src/components/Map/MapWithSidebar.tsx'), 'utf8');

  expect(src).toContain('nextDisplayedBeaches(');
  expect(src).toContain("t('noBeachesFound')");
  expect(src).not.toMatch(/allBeaches\.length > 0/);
});

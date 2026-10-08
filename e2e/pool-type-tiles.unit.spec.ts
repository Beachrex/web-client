import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * QA #70: the home "outdoor pools" and "indoor pools & spas" tiles both sent
 * waterbody=pool, so the map could not tell them apart. They now send the
 * backend's pool_type filter (indoor_pools_count / outdoor_pools_count > 0).
 */
test('pool tiles send pool_type=outdoor and pool_type=indoor', () => {
  const src = readFileSync(join(process.cwd(), 'src', 'components', 'Home', 'BeachCategorySearch.tsx'), 'utf-8');

  expect(src).toContain("navigateToMapWithFilters({ pool_type: ['outdoor'] })");
  expect(src).toContain("navigateToMapWithFilters({ pool_type: ['indoor'] })");
  expect(src).not.toContain("navigateToMapWithFilters({ waterbody: ['pool'] })");
});

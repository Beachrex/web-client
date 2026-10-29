import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Unknown beach-tree URLs must answer HTTP 404 (found 2026-10-08, fixed 2026-10-09). A `loading.tsx` above a
 * page that calls notFound() makes Next stream the response with status 200 first, and an unknown country
 * crashed the country page (500). Checked with `next dev` against a mock API: /en/beaches/nowhere,
 * /en/beaches/europe/nocountry and /en/beaches/europe/croatia/x/y → 404; a known country → 200.
 */
const root = process.cwd();
const beaches = join(root, 'src/app/[locale]/beaches');

test('no loading UI above the beach pages that resolve slugs (it would turn 404s into 200s)', () => {
  for (const dir of ['', '[continent]', '[continent]/[country]', '[continent]/[country]/[...segments]']) {
    expect(existsSync(join(beaches, dir, 'loading.tsx')), `${dir}/loading.tsx`).toBe(false);
  }
});

test('an unknown country is a 404, an unreachable API stays an error', () => {
  const page = readFileSync(join(beaches, '[continent]/[country]/page.tsx'), 'utf8');
  expect(page).toMatch(/if \(countryStatus === 404\) notFound\(\);/);
  expect(page).toContain('throw new Error(`Country page data unavailable');
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

import { isOldBeachSlug } from '../src/lib/utils/beach-urls';

/** Owner 2026-10-23: `/pl/plaze/.../beach-svetilnik` → `/pl/plaze/.../svetilnik` with a 301. */
test('an old slug differs from the current one', () => {
  expect(isOldBeachSlug('beach-svetilnik', 'svetilnik')).toBe(true);
  expect(isOldBeachSlug('svetilnik', 'svetilnik')).toBe(false);
  expect(isOldBeachSlug('plage-de-l%C3%A9oube', 'plage-de-léoube')).toBe(false);
  expect(isOldBeachSlug('svetilnik', undefined)).toBe(false);
  expect(isOldBeachSlug(undefined, 'svetilnik')).toBe(false);
});

test('the beach page redirects permanently from an old slug', () => {
  const page = readFileSync(join(process.cwd(), 'src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx'), 'utf8');
  expect(page).toMatch(/isOldBeachSlug\(lastSegment, beachSlug\)\) \{\s*permanentRedirect\(buildBeachUrl\(beach, locale\)\)/);
});

test('the middleware spots old beach slugs and swaps them', async () => {
  const { oldBeachSlug, withBeachSlug } = await import('../src/lib/utils/old-beach-slug');
  expect(oldBeachSlug('/pl/plaze/europa/slowenia/obalno-kraska/izola/beach-svetilnik')).toBe('beach-svetilnik');
  expect(oldBeachSlug('/pl/plaze/europa/slowenia/obalno-kraska/izola/svetilnik')).toBeNull();
  expect(oldBeachSlug('/pl/plaze/europa/slowenia/beach-x')).toBeNull(); // too short for a beach
  expect(oldBeachSlug('/pl/p/beach-guide/a/b/beach-x')).toBeNull(); // not a beaches path
  expect(withBeachSlug('/pl/plaze/europa/slowenia/obalno-kraska/izola/beach-svetilnik', 'svetilnik')).toBe(
    '/pl/plaze/europa/slowenia/obalno-kraska/izola/svetilnik',
  );
  const middleware = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');
  expect(middleware).toContain('NextResponse.redirect(url, 301)');
});

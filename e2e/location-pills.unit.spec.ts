import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { buildLocationPillUrls } from '@/lib/utils/beach-urls';

/**
 * Owner, 2026-10-29: the location pills on the beach banner (continent, country, region, island, city) showed
 * only an icon or a cut 5-letter label and did nothing. Now each one opens on hover/focus to show the full name
 * and links to that place, with the same URLs as the breadcrumbs.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('pill links follow the beach URL hierarchy; optional levels are skipped', () => {
  const location = {
    continent: { slug: 'evropa' },
    country: { slug: 'hrvaska' },
    region: { slug: 'kvarner' },
    island: { slug: 'rab' },
    city: { slug: 'lopar' },
  };
  expect(buildLocationPillUrls('si', location)).toEqual({
    continent: '/si/plaze/evropa',
    country: '/si/plaze/evropa/hrvaska',
    region: '/si/plaze/evropa/hrvaska/kvarner',
    island: '/si/plaze/evropa/hrvaska/kvarner/rab',
    city: '/si/plaze/evropa/hrvaska/kvarner/rab/lopar',
  });
  // No region, no island: the city follows the country directly.
  expect(buildLocationPillUrls('en', { continent: { slug: 'europe' }, country: { slug: 'croatia' }, city: { slug: 'split' } }))
    .toEqual({
      continent: '/en/beaches/europe',
      country: '/en/beaches/europe/croatia',
      region: null,
      island: null,
      city: '/en/beaches/europe/croatia/split',
    });
});

test('missing continent or country slug gives no broken links', () => {
  expect(buildLocationPillUrls('en', null)).toEqual({ continent: null, country: null, region: null, island: null, city: null });
  expect(buildLocationPillUrls('en', { continent: { slug: 'europe' }, country: { slug: null }, city: { slug: 'split' } }))
    .toEqual({ continent: '/en/beaches/europe', country: null, region: null, island: null, city: null });
});

test('pills are links that open on hover and keyboard focus, over the row, without motion when reduced', () => {
  const pill = read('src/components/BannerSection/LocationPill.tsx');
  expect(pill).toContain("import Link from 'next/link'");
  expect(pill).toContain('aria-label={name}');
  // The tab opens over the following pills and ignores the pointer, so the row never shifts under the cursor.
  expect(pill).toContain('pointer-events-none absolute');
  expect(pill).toContain('group-hover/pill:[clip-path:');
  expect(pill).toContain('group-focus-visible/pill:[clip-path:');
  expect(pill).toContain('motion-reduce:transition-none');
  expect(pill).toContain('min-w-[54px]'); // short labels like "LOPAR" no longer overflow a fixed 54 px

  const topBar = read('src/components/BannerSection/TopBar.tsx');
  expect(topBar.match(/<LocationPill\b/g)).toHaveLength(5);
  expect(topBar).not.toMatch(/w-\[54px\]/);

  const banner = read('src/components/Beach/BeachBanner/BeachBannerSection.tsx');
  expect(banner).toContain('pillLinks={buildLocationPillUrls(locale, beachDetails?.location)}');
  expect(banner).toMatch(/pillNames=\{\{/);
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import type { BeachSchema } from '@/lib/api-client/types.gen';
import { getBeachesWord } from '@/lib/utils/beach-urls';

// Set before the module (and @/env) is loaded.
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_CDN_TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
process.env.NEXT_PUBLIC_CDN_ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

/**
 * QA #48: /[locale]/beaches rendered mock data ("Plaža Ladinka" ×4, "Country N" with random
 * counts, hardcoded totals), a missing banner image and buttons that only logged to the console.
 */

const page = readFileSync(join(process.cwd(), 'src/app/[locale]/beaches/page.tsx'), 'utf8');

test('world page has no mock data, random values or console-only handlers', () => {
  expect(page).not.toMatch(/Ladinka|mockCountries|Math\.random|console\.log|world-banner\.png/);
  expect(page).not.toMatch(/'use client'/); // server-rendered (SEO)
  expect(page).toMatch(/getMostVisitedBeaches/);
  expect(page).toMatch(/beachesToProperties/);
});

test('beach cards: real URLs and media, beaches without a main image are skipped', async () => {
  const { beachesToProperties } = await import('@/lib/utils/beach-properties');
  const beaches = [
    {
      id: 1,
      name: 'Zlatni rat',
      slug: 'zlatni-rat',
      main_image: 'beaches/zlatni-rat/main.jpg',
      continent_slug: 'europe',
      country_slug: 'croatia',
      region_slug: 'dalmatia',
      island_slug: null,
      city_slug: 'bol',
      city_name: 'Bol',
      media: { gallery: [{ url: 'beaches/zlatni-rat/2.jpg', order: 2 }, { url: 'beaches/zlatni-rat/1.jpg', order: 1 }] },
    },
    { id: 2, name: 'No image', slug: 'no-image', main_image: null, continent_slug: 'europe', country_slug: 'croatia' },
  ] as unknown as BeachSchema[];

  const cards = beachesToProperties(beaches, 'hr');
  expect(cards).toHaveLength(1);
  expect(cards[0].beachUrl).toBe(`/hr/${getBeachesWord('hr')}/europe/croatia/dalmatia/bol/zlatni-rat`);
  expect(cards[0].title).toBe('Zlatni rat');
  expect(cards[0].location).toBe('Bol');
  expect(cards[0].galleryImages).toHaveLength(2);
  expect(cards[0].galleryImages[0]).toContain('1.jpg');
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-09: continent page cards had no tag line ("Swimming • Snorkeling • …") while the
 * beach and city pages had it. The API sends `tags` for every list; every card builder passes them on.
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

test('most-visited cards (world and continent pages) carry the API tags', async () => {
  const { beachesToProperties } = await import('@/lib/utils/beach-properties');
  const beach = {
    id: 7, name: 'Slanica', slug: 'slanica', main_image: 'img/b7.jpg', continent_slug: 'evropa',
    country_slug: 'hrvaska', city_slug: 'murter', tags: ['Swimming', 'Snorkeling', '', 'Fishing'],
  };

  const [card] = beachesToProperties([beach], 'si');
  expect(card?.tags).toEqual(['Swimming', 'Snorkeling', 'Fishing']);
  expect(beachesToProperties([{ ...beach, tags: [] }], 'si')[0]?.tags).toBeUndefined();
});

test('the "all beaches" search cards carry the API tags too', () => {
  expect(read('src/components/DynamicSearchBeaches.tsx')).toContain('tags: cardTags(b)');
});

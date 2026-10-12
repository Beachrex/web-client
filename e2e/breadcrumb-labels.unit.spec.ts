import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { breadcrumbLabel, breadcrumbLabels } from '../src/lib/utils/breadcrumb-labels';

/**
 * Owner 2026-10-12 (Greek beach page): the breadcrumb read "Paralies > Europe > Slovenia > Obalno Kraska >
 * Strunjan > Beach Mesecev Zaliv": URL slugs in title case, never the translated names.
 */
test('names come from the page data, keyed by slug', () => {
  const labels = breadcrumbLabels(
    {
      continent: { slug: 'europe', name: 'Ευρώπη' },
      country: { slug: 'slovenia', name: 'Σλοβενία' },
      region: { slug: 'obalno-kraska', name: 'Παράκτια-Καρστική' },
      city: { slug: 'strunjan', name: 'Στρούνιαν' },
    },
    { id: 1, slug: 'beach-mesecev-zaliv', name: 'Μέσετσεβ Ζάλιβ' },
  );
  expect(breadcrumbLabel('obalno-kraska', labels)).toBe('Παράκτια-Καρστική');
  expect(breadcrumbLabel('beach-mesecev-zaliv', labels)).toBe('Μέσετσεβ Ζάλιβ');
  expect(breadcrumbLabel('unknown-place', labels)).toBe('Unknown Place');
});

test('a region page collects its own name and its country and continent', () => {
  const labels = breadcrumbLabels({
    slug: 'bretagne',
    name: 'Bretagne',
    country: { slug: 'france', name: 'Frankreich', continent: { slug: 'europe', name: 'Europa' } },
    navigation: { next: { slug: 'normandie', name: 'Normandie' } },
  });
  expect(labels).toEqual({ bretagne: 'Bretagne', france: 'Frankreich', europe: 'Europa' });
});

test('every place page passes its labels; the beaches word is translated', () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  for (const page of ['BeachDetailPage', 'RegionListingPage', 'CityListingPage', 'IslandListingPage']) {
    expect(read(`src/components/Pages/${page}.tsx`), page).toContain('breadcrumbLabels={breadcrumbLabels(');
  }
  expect(read('src/app/[locale]/beaches/[continent]/page.tsx')).toContain('breadcrumbLabels={breadcrumbLabels(continent)}');
  expect(read('src/app/[locale]/beaches/[continent]/[country]/page.tsx'))
    .toContain('breadcrumbLabels={breadcrumbLabels(countryDetails)}');
  expect(read('src/components/DynamicBreadcrumbs.tsx')).toContain("[getBeachesWord(locale)]: tCommon('statsBeaches')");
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-22 (country pages): "Beach view" (photos, video, 360°, webcam) worked in "Most visited" but not in
 * "Browse all beaches". Both sections now use the same switch, and the browse list changes the card view
 * without hiding beaches (the page comes from the server, so hiding cards broke the count and paging).
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

test('Most visited and Browse all beaches both render the shared view switch', () => {
  for (const file of ['src/components/PropertySection.tsx', 'src/components/DynamicSearchBeaches.tsx']) {
    const src = read(file);
    expect(src, file).toMatch(/<BeachViewToggle mode=\{mediaMode\} onChange=\{setMediaMode\}/);
    expect(src, file).toContain('<PropertyMediaContext.Provider');
  }
});

test('Browse all beaches does not hide cards for the selected view', () => {
  const src = read('src/components/DynamicSearchBeaches.tsx');
  expect(src).not.toMatch(/properties\.filter\(/);
  expect(src).toContain('const paginatedItems = properties;');
});

test('switch labels come from the beach page media labels, present in all 19 languages', () => {
  const toggle = read('src/components/BeachViewToggle.tsx');
  const keys = [...toggle.matchAll(/labelKey: '(\w+)'/g)].map((m) => m[1] ?? '');
  expect(keys).toEqual(['beachMediaGallery', 'beachMediaVideo', 'beachMedia360', 'beachMediaLiveCam']);

  const locales = ['bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'hr', 'hu', 'it', 'nl', 'pl', 'pt', 'ru', 'si', 'sk', 'sq', 'ua'];
  for (const locale of locales) {
    const media = (JSON.parse(read(`messages/${locale}.json`)) as { BeachDetails: Record<string, string> }).BeachDetails;
    for (const key of keys) expect(media[key], `${locale}.${key}`).toBeTruthy();
  }
});

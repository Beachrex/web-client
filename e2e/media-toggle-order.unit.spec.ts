import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-22: the media switch on the map page (photos, webcam, 360, video) did not match the beach page
 * (photos, video, 360, webcam). Every switch now uses the beach page order.
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const order = (src: string, re: RegExp) => [...src.matchAll(re)].map((m) => m[1]);

test('map media switches use the same order as the beach page', () => {
  const beachPage = order(read('src/components/Beach/BeachPageView.tsx'), /key: '(gallery|video|sphere|webcam)'/g);
  // "Beach view" switch shared by Most visited and Browse all beaches (owner 2026-10-22).
  const beachSection = order(read('src/components/BeachViewToggle.tsx'), /mode: '(gallery|video|sphere|webcam)'/g);
  const inline = order(read('src/components/Dropdown.tsx'), /setMediaMode\('(gallery|video|sphere|webcam)'\)/g);
  const dropdown = order(read('src/components/Map/MapWithSidebar.tsx'), /value: '(gallery|video|sphere|webcam)'/g);

  expect(beachPage).toEqual(['gallery', 'video', 'sphere', 'webcam']);
  expect(beachSection).toEqual(beachPage);
  expect(inline).toEqual(beachPage);
  expect(dropdown).toEqual(beachPage);
});

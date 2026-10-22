import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';

/**
 * Owner 2026-10-22: a webcam on a beach card (map, city, region, island lists) plays in a popup on our page
 * instead of opening Windy in a new tab. Only an old pasted link (FEATURES.windyWebcams off) opens a tab.
 */
const root = process.cwd();
const read = (f: string) => readFileSync(join(root, f), 'utf8');

test('the Windy id is read only from a Windy webcam page URL', async () => {
  const { windyIdFromPageUrl, windyPageUrl } = await import('@/lib/utils/webcam');

  expect(windyIdFromPageUrl(windyPageUrl(1712345678))).toBe(1712345678);
  expect(windyIdFromPageUrl('https://www.windy.com/webcams/0')).toBeNull();
  expect(windyIdFromPageUrl('https://www.lookr.com/webcams/123')).toBeNull();
  expect(windyIdFromPageUrl('https://www.windy.com/webcams/123?x=javascript:')).toBeNull();
  expect(windyIdFromPageUrl(null)).toBeNull();
});

test('a card opens the popup for a Windy webcam and a new tab only otherwise', () => {
  const card = read('src/components/PropertyCard/PropertyCard.tsx');
  const handler = card.slice(card.indexOf('const handleWebcamClick'), card.indexOf('const handleSphereClick'));

  expect(handler.indexOf('setWebcamOpen(true)')).toBeGreaterThan(-1);
  expect(handler.indexOf('if (windyId)')).toBeLessThan(handler.indexOf('window.open('));
  expect(card).toContain('<WebcamModal windyId={windyId}');
});

test('the popup uses the Windy player built from the id, closes on Escape and outside clicks', () => {
  const modal = read('src/components/Beach/WebcamModal.tsx');

  expect(modal).toContain('src={windyPlayerUrl(windyId)}');
  expect(modal).toContain('role="dialog"');
  expect(modal).toContain('aria-modal="true"');
  expect(modal).toContain("e.key === 'Escape'");
  expect(modal).toContain('createPortal(');
  expect(modal).toContain('e.stopPropagation()');
});

test('the close label exists in all 19 languages', () => {
  const files = readdirSync(join(root, 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const f of files) {
    expect(JSON.parse(read(`messages/${f}`)).PropertyCard?.webcamClose, f).toBeTruthy();
  }
});

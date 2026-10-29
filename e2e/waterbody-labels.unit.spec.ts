import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

import { beachPillKey, seabedLabelKey, showsSeaTemperature, waterKind } from '../src/lib/utils/waterbody';

/**
 * Owner 2026-10-23: lake, river and pool beaches said "Morska plaža", "Temperatura morja" and "Morsko dno".
 */
const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const LOCALES = ['bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'hr', 'hu', 'it', 'nl', 'pl', 'pt', 'ru', 'si', 'sk', 'sq', 'ua'];

test('waterKind maps codes and falls back to sea', () => {
  expect(waterKind('lake')).toBe('lake');
  expect(waterKind(' River ')).toBe('river');
  expect(waterKind('pool')).toBe('pool');
  expect(waterKind('sea')).toBe('sea');
  expect(waterKind(undefined)).toBe('sea');
  expect(waterKind('ocean')).toBe('sea');
});

test('label keys and the sea-only temperature widget', () => {
  expect(beachPillKey('sea')).toBe('beachLabel');
  expect(beachPillKey('lake')).toBe('beachLabelLake');
  expect(seabedLabelKey('sea')).toBe('seabed');
  expect(seabedLabelKey('river')).toBe('seabedRiver');
  expect(showsSeaTemperature('sea')).toBe(true);
  expect(showsSeaTemperature('lake')).toBe(false);
  expect(showsSeaTemperature('pool')).toBe(false);
});

test('every locale has the pill and seabed labels for each waterbody', () => {
  for (const locale of LOCALES) {
    const m = JSON.parse(read(`messages/${locale}.json`));
    for (const kind of ['sea', 'lake', 'river', 'pool'] as const) {
      expect(m.TopBar[beachPillKey(kind)], `${locale} TopBar.${beachPillKey(kind)}`).toBeTruthy();
      expect(m.BeachDetails.labels[seabedLabelKey(kind)], `${locale} seabed ${kind}`).toBeTruthy();
    }
  }
  const si = JSON.parse(read('messages/si.json'));
  expect(si.TopBar.beachLabel).toBe('Morje');
  expect(si.TopBar.beachLabelLake).toBe('Jezero');
  expect(si.TopBar.beachLabelRiver).toBe('Reka');
  expect(si.TopBar.beachLabelPool).toBe('Bazen');
  expect(si.BeachDetails.labels.seabedLake).toBe('Dno jezera');
});

test('beach banner and details use the waterbody', () => {
  const banner = read('src/components/Beach/BeachBanner/BeachBannerSection.tsx');
  expect(banner).toContain('pillLabelKey={beachPillKey(water)}');
  expect(banner).toContain('showsSeaTemperature(water)');
  expect(read('src/components/Beach/BeachDetails/beachDetailsSection.tsx')).toContain('seabedLabelKey(waterKind(');
});

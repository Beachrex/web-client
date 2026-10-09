import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { test, expect } from '@playwright/test';
import { FEATURES } from '../src/lib/constants/features';

/**
 * Guard against placeholder content reaching visitors (TASK-004 audit D2, D3, D9).
 *
 * - Beaches without a description showed "Lorem Ipsum" in the banner.
 * - Beach, city, region, island and country pages showed fake accommodation cards
 *   ("Apartma Pehta", "569 accommodations"); home showed "+6250 accommodations".
 *   Accommodation is hidden for launch behind FEATURES.accommodation
 *   (backend docs/features/hidden-for-launch.md).
 */

const ROOT = process.cwd();

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, ext);
    return ext.test(name) ? [path] : [];
  });
}

const SOURCES = files(join(ROOT, 'src'), /\.(tsx?|json)$/).filter(
  (f) => !f.includes(`${join('src', 'lib', 'api-client')}`),
);

test('no Lorem Ipsum or dummy text in src/ and messages/', () => {
  const all = [...SOURCES, ...files(join(ROOT, 'messages'), /\.json$/)];
  const hits = all.filter((f) => /lorem ipsum|dummy text/i.test(readFileSync(f, 'utf8')));
  expect(hits.map((f) => relative(ROOT, f))).toEqual([]);
});

test('accommodation and GetYourGuide are hidden for launch', () => {
  expect(FEATURES.accommodation).toBe(false);
  expect(FEATURES.getYourGuide).toBe(false);
});

// Every place that renders a hidden section must check its flag.
const GATED: Array<[RegExp, string]> = [
  [/<AccommodationSection\b/, 'FEATURES.accommodation'],
  [/<HomeAccommodationSection\b/, 'FEATURES.accommodation'],
  [/<GetYourGuideSection\b/, 'FEATURES.getYourGuide'],
];

for (const [usage, flag] of GATED) {
  test(`${usage.source} is only rendered behind ${flag}`, () => {
    const offenders = SOURCES.filter((f) => {
      const src = readFileSync(f, 'utf8');
      return usage.test(src) && !src.includes(flag);
    });
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });
}

test('no hardcoded accommodation totals', () => {
  const hits = SOURCES.filter((f) => /totalCount=\{\d+\}/.test(readFileSync(f, 'utf8')));
  expect(hits.map((f) => relative(ROOT, f))).toEqual([]);
});

test('header search bar: accommodation and shop are gated in every layout (mobile too), CGP logo', () => {
  const source = readFileSync(join(process.cwd(), 'src/components/Header/SearchBar.tsx'), 'utf8');
  const count = (re: RegExp) => (source.match(re) ?? []).length;
  // Owner, 2026-10-09: the mobile header still showed "Accommodations" and "Shop".
  expect(count(/accomodation\.svg/g)).toBe(count(/FEATURES\.accommodation && \(/g));
  expect(count(/store\.svg/g)).toBe(count(/FEATURES\.shop && \(/g));
  expect(source).not.toContain('logo_dark.png');
  expect(source).toContain('/brand/BeachRex_CGP/01_Logo/Horizontal/SVG/beachrex_horizontal_color.svg');
});

test('city page category tiles (no click action) are hidden for launch', () => {
  const page = readFileSync(join(process.cwd(), 'src/components/Pages/CityListingPage.tsx'), 'utf8');
  expect(page).toContain('{FEATURES.cityCategoryTiles && <CityCategories />}');
  expect(readFileSync(join(process.cwd(), 'src/lib/constants/features.ts'), 'utf8')).toContain('cityCategoryTiles: false');
});

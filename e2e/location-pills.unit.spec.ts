import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { buildLocationPillUrls } from '@/lib/utils/beach-urls';
import { mapPlacePills } from '@/lib/mappers/mapPlacePills';

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
  // No native tooltip on an interactive pill: it covered the open tab (owner, 2026-10-29).
  const linkBlock = pill.slice(pill.indexOf('<Link'));
  expect(linkBlock).not.toMatch(/\btitle=/);
  // The tab sizes to its content, not to the pill (the name was cut to "Hrvaš" and "RN" of KVARN showed through).
  expect(pill).toMatch(/absolute inset-y-0 left-0 flex w-max/);
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
  expect(banner).toContain('{...mapPlacePills(locale, beachDetails?.location)}');
});

test('the open tab looks like the place page main bar: level word, name, beach count box', () => {
  const pill = read('src/components/BannerSection/LocationPill.tsx');
  expect(pill).toContain('rounded-full bg-white'); // level word pill, like TopBar's main bar
  expect(pill).toContain('/images/beach-black.png'); // same beach icon as the main bar's count box
  expect(pill).toContain("typeof beachCount === 'number' &&"); // no count: no box, never a wrong number

  const topBar = read('src/components/BannerSection/TopBar.tsx');
  expect(topBar).toContain('levelLabel: t(VARIANT_PILL_LABEL_KEY[level])');
  expect(topBar).toContain("tCommon('numBeaches')");
  expect(topBar.match(/\{\.\.\.pillTab\('(continent|country|region|island|city)'\)\}/g)).toHaveLength(5);
});

test('level words and the beach count label exist in all 19 locales', () => {
  const files = ['bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'hr', 'hu', 'it', 'nl', 'pl', 'pt', 'ru', 'si', 'sk', 'sq', 'ua'];
  for (const file of files) {
    const messages = JSON.parse(read(`messages/${file}.json`));
    for (const key of ['continentLabel', 'countryLabel', 'regionLabel', 'islandLabel', 'cityLabel']) {
      expect(messages.TopBar?.[key], `${file} TopBar.${key}`).toBeTruthy();
    }
    expect(messages.Common?.numBeaches, `${file} Common.numBeaches`).toBeTruthy();
  }
});

test('mapPlacePills: links, names and counts; a missing count stays empty', () => {
  const pills = mapPlacePills('si', {
    continent: { slug: 'evropa', name: 'Evropa', beaches_count: 5000 },
    country: { slug: 'hrvaska', name: 'Hrvaška', beaches_count: 1167 },
    region: { slug: 'kvarner', name: 'Kvarner' },
    island: { slug: 'rab', name: 'Rab', beaches_count: 0 },
    city: { slug: 'lopar', name: 'Lopar', beaches_count: 12 },
  });
  expect(pills.pillLinks.country).toBe('/si/plaze/evropa/hrvaska');
  expect(pills.pillLinks.city).toBe('/si/plaze/evropa/hrvaska/kvarner/rab/lopar');
  expect(pills.pillNames).toEqual({ region: 'Kvarner', island: 'Rab', city: 'Lopar' });
  expect(pills.pillCounts).toEqual({ continent: 5000, country: 1167, region: undefined, island: 0, city: 12 });
  expect(mapPlacePills('en', null).pillCounts).toEqual({
    continent: undefined, country: undefined, region: undefined, island: undefined, city: undefined,
  });
});

test('every page that renders a banner with location pills passes links, names and counts', () => {
  // Owner, 2026-10-29: no pill anywhere stays a static box.
  const callers: Array<[string, string]> = [
    ['src/app/[locale]/beaches/[continent]/page.tsx', '{...mapPlacePills(resolvedParams.locale, { continent })}'],
    ['src/app/[locale]/beaches/[continent]/[country]/page.tsx', '{...mapPlacePills(locale, {'],
    ['src/components/Pages/RegionListingPage.tsx', '{...mapPlacePills(locale, {'],
    ['src/components/Pages/IslandListingPage.tsx', '{...mapPlacePills(locale, {'],
    ['src/components/Pages/CityListingPage.tsx', '{...mapPlacePills(locale, {'],
    ['src/components/Beach/BeachBanner/BeachBannerSection.tsx', '{...mapPlacePills(locale, beachDetails?.location)}'],
  ];
  for (const [file, call] of callers) expect(read(file), file).toContain(call);

  // Every BannerSection / pill TopBar caller in src is in the list above (a new caller must be added and wired).
  const walk = (dir: string): string[] =>
    readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return walk(path);
      return path.endsWith('.tsx') ? [path] : [];
    });
  const found = walk('src')
    .filter((f) => /<(BannerSection|TopBar)\b/.test(read(f)))
    // BannerSection renders TopBar itself; Layout's <TopBar/> is the site header (Header/TopBar), not the banner.
    .filter((f) => f !== 'src/components/BannerSection/BannerSection.tsx' && f !== 'src/components/Layout.tsx');
  expect(found.sort()).toEqual(callers.map(([f]) => f).sort());

  // BannerSection forwards them to TopBar.
  const bannerSection = read('src/components/BannerSection/BannerSection.tsx');
  for (const prop of ['pillLinks={pillLinks}', 'pillNames={pillNames}', 'pillCounts={pillCounts}']) {
    expect(bannerSection).toContain(prop);
  }
});

/** Owner, 2026-10-29: on the continent page the continent pill is the page itself; opening it looked like a bug. */
test('the pill of the current page level is static (continent page)', () => {
  const topBar = read('src/components/BannerSection/TopBar.tsx');
  expect(topBar).toContain("href={variant === 'continent' ? null : pillLinks?.continent}");
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { locales } from '@/app/config/locales';
import type { Country } from '@/lib/api-client/types.gen';
import { buildMenuItems } from '@/lib/utils/menu-items';
import { resolveAllFilterOptions } from '@/lib/utils/quick-filters';
import { BEACH_TYPE_ICONS } from '@/lib/utils/beach-badges';
import { resolveBadgeIcon } from '@/lib/utils/beach-badge-icons';
import { footerBrowseHrefs } from '@/lib/utils/footer-links';
import { getBeachesWord, buildBeachMapUrl } from '@/lib/utils/beach-urls';

/**
 * Menu and footer links (TASK-004 audit B1, B2, C2).
 *
 * - The burger menu read `public/menu_en.json` for 17 locales, so "Europe" linked the English
 *   slug `/xx/beaches/europe` while continent slugs are localized (de `europa`) → 404.
 * - The footer linked `/destinations` and `/accommodations`, which do not exist → 404.
 */

const labels = {
  browseBeaches: 'Browse',
  topCountries: 'Top',
  aiAssistant: 'AI',
  aiChat: 'Chat',
  aiItinerary: 'Planner',
  about: 'About',
  contact: 'Contact',
};

const continents = [
  { code: 'EU', name: 'Europa', slug: 'europa', beaches_count: 3000 },
  { code: 'AF', name: 'Afrika', slug: 'afrika', beaches_count: 0 },
  { code: 'AS', name: 'Asien', slug: 'asien', beaches_count: 10 },
];

const countries: Country[] = Array.from({ length: 14 }, (_, i) => ({
  name: `Land ${i}`,
  slug: `land-${i}`,
  continent_code: i === 13 ? 'XX' : 'EU',
  beaches_count: i === 12 ? 0 : 100 - i,
}));

function build(aboutUrl: string | null = '/de/p/uber-uns') {
  return buildMenuItems({ locale: 'de', continents, countries, aboutUrl, contactUrl: null, labels });
}

test('menu continents use the localized API slug, skip empty continents, most beaches first', () => {
  const browse = build()[0]!;
  expect(browse.href).toBe(`/de/${getBeachesWord('de')}`);
  expect(browse.subItems?.map((s) => s.href)).toEqual([
    `/de/${getBeachesWord('de')}/europa`,
    `/de/${getBeachesWord('de')}/asien`,
  ]);
});

test('menu top countries: every country with beaches and a known continent, most beaches first, no cap', () => {
  // Owner 2026-10-29: the menu listed only 10 of the 13 countries with beaches.
  const top = build().find((i) => i.label === labels.topCountries)!;
  // 14 countries: land-12 has no beaches, land-13 has an unknown continent → 12 listed.
  expect(top.subItems).toHaveLength(12);
  expect(top.subItems!.map((s) => s.label)).toEqual(Array.from({ length: 12 }, (_, i) => `Land ${i}`));
  expect(top.subItems![0]).toEqual({ label: 'Land 0', href: `/de/${getBeachesWord('de')}/europa/land-0` });
  expect(top.subItems![11]).toEqual({ label: 'Land 11', href: `/de/${getBeachesWord('de')}/europa/land-11` });
  const hrefs = top.subItems!.map((s) => s.href);
  expect(hrefs).not.toContain(`/de/${getBeachesWord('de')}/europa/land-12`);
  expect(hrefs.some((h) => h.includes('land-13'))).toBe(false);
});

test('menu top countries: localized URLs in every locale, unsorted input comes out by beach count', () => {
  for (const locale of locales) {
    const top = buildMenuItems({
      locale,
      continents: [{ code: 'EU', name: 'Europe', slug: `eu-${locale}`, beaches_count: 10 }],
      countries: [
        { name: 'Small', slug: 'small', continent_code: 'EU', beaches_count: 1 },
        { name: 'Big', slug: 'big', continent_code: 'EU', beaches_count: 900 },
        { name: 'None', slug: 'none', continent_code: 'EU', beaches_count: 0 },
      ],
      aboutUrl: null,
      contactUrl: null,
      labels,
    }).find((i) => i.label === labels.topCountries)!;
    expect(top.subItems!.map((s) => s.href)).toEqual([
      `/${locale}/${getBeachesWord(locale)}/eu-${locale}/big`,
      `/${locale}/${getBeachesWord(locale)}/eu-${locale}/small`,
    ]);
  }
});

test('menu has AI links; About only when the CMS page exists; contact skipped when missing', () => {
  const items = build();
  expect(items.find((i) => i.label === 'AI')?.subItems?.map((s) => s.href)).toEqual(['/de/ai/chat', '/de/ai/itinerary']);
  expect(items.find((i) => i.label === 'About')?.href).toBe('/de/p/uber-uns');
  expect(items.find((i) => i.label === 'Contact')).toBeUndefined();
  expect(build(null).find((i) => i.label === 'About')).toBeUndefined();
});

test('every menu href is locale-prefixed', () => {
  const all = build().flatMap((i) => [i, ...(i.subItems ?? [])]);
  for (const item of all) expect(item.href.startsWith('/de/') || item.href === '/de').toBe(true);
});

for (const locale of locales) {
  test(`footer browse links for ${locale}: no 404 routes, locale-prefixed`, () => {
    const hrefs = footerBrowseHrefs(locale);
    expect(hrefs).toEqual([
      `/${locale}/${getBeachesWord(locale)}`,
      `/${locale}`,
      null, // accommodation: hidden for launch
      buildBeachMapUrl(locale),
    ]);
    // Labels and hrefs stay aligned by index.
    const messages = JSON.parse(readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf8'));
    expect(messages.Footer.browse.links).toHaveLength(hrefs.length);
  });
}

test('the static menu JSON (English slugs) is gone', () => {
  const menu = readFileSync(join(process.cwd(), 'src/components/Header/BurgerMenu.tsx'), 'utf8');
  expect(menu).not.toMatch(/menu_en\.json|\/beach-accommodation|href="\/beach-map"/);
});

test('menu groups of pre-filtered beaches open the localized beach map with one filter', () => {
  const items = buildMenuItems({
    locale: 'hr',
    continents,
    countries,
    aboutUrl: null,
    contactUrl: null,
    labels,
    filterGroups: [
      {
        label: 'Vrste plaža',
        icon: '/images/categories/sand-castle.png',
        tiles: [{ filterKey: 'beach_type', code: 'sand', label: 'Pješčana', icon: '/images/categories/sand-castle.png' }],
      },
      { label: 'Empty', icon: '/x.png', tiles: [] },
    ],
  });
  const group = items.find((i) => i.label === 'Vrste plaža')!;
  expect(group.href).toBe(buildBeachMapUrl('hr'));
  expect(group.subItems).toEqual([
    { label: 'Pješčana', href: `${buildBeachMapUrl('hr')}?beach_type=sand`, icon: '/images/categories/sand-castle.png' },
  ]);
  expect(items.find((i) => i.label === 'Empty')).toBeUndefined();
  // Before the AI group, after the browse groups
  const order = items.map((i) => i.label);
  expect(order.indexOf('Vrste plaža')).toBeGreaterThan(order.indexOf(labels.topCountries));
  expect(order.indexOf('Vrste plaža')).toBeLessThan(order.indexOf(labels.aiAssistant));
});

test('menu filter picks use filter keys the map understands and icons that exist', async () => {
  const { existsSync } = await import('fs');
  const { MENU_FILTER_GROUPS } = await import('@/config/menuBeachFilters');
  const mapKeys = ['beach_type', 'user_type', 'location_infrastructure', 'culinary_offer', 'natural_location_condition'];
  for (const group of MENU_FILTER_GROUPS) {
    expect(existsSync(join(process.cwd(), 'public', group.icon))).toBe(true);
    if (group.allOptions) {
      expect(mapKeys).toContain(group.allOptions.filterKey);
      // Local icons must exist; CDN icons (beach types, same as the cards) are checked in the next test.
      const icons = [...Object.values(group.allOptions.icons), group.allOptions.fallbackIcon].filter((i) => i.startsWith('/'));
      for (const icon of icons) expect(existsSync(join(process.cwd(), 'public', icon)), icon).toBe(true);
    }
    for (const pick of group.picks ?? []) {
      expect(mapKeys).toContain(pick.filterKey);
      expect(existsSync(join(process.cwd(), 'public', pick.icon)), pick.icon).toBe(true);
    }
  }
});

test('menu "Beach types" lists every beach type the API returns, API order and labels, fallback icon', async () => {
  // Owner 2026-10-29: the menu showed only 3 of the 6 beach types (hardcoded picks).
  const { MENU_FILTER_GROUPS } = await import('@/config/menuBeachFilters');
  const group = MENU_FILTER_GROUPS.find((g) => g.labelKey === 'beachTypes')!;
  expect(group.allOptions?.filterKey).toBe('beach_type');
  const { filterKey, icons, fallbackIcon } = group.allOptions!;
  const apiTypes = [
    { code: 'sand', name: 'Sand' },
    { code: 'small_stones', name: 'Fine Pebbles' },
    { code: 'big_stones', name: 'Large Pebbles' },
    { code: 'rock_beach', name: 'Rocky Beach' },
    { code: 'grass_beach', name: 'Grass Beach' },
    { code: 'concrete', name: 'Concrete' },
    { code: 'future_type', name: 'Future' },
    { code: 'unnamed', name: '' },
  ];
  const tiles = resolveAllFilterOptions(filterKey, icons, fallbackIcon, { beach_type: { options: apiTypes } });
  expect(tiles.map((t) => t.label)).toEqual(['Sand', 'Fine Pebbles', 'Large Pebbles', 'Rocky Beach', 'Grass Beach', 'Concrete', 'Future']);
  // Owner 2026-10-29: the same icons as on the beach cards, for every type ("Concrete" had the wrong one).
  for (const code of ['sand', 'small_stones', 'big_stones', 'rock_beach', 'grass_beach', 'concrete']) {
    expect(tiles.find((t) => t.code === code)!.icon, code).toBe(resolveBadgeIcon(BEACH_TYPE_ICONS[code]!));
    expect(tiles.find((t) => t.code === code)!.icon, code).not.toBe(fallbackIcon);
  }
  expect(tiles.find((t) => t.code === 'concrete')!.icon).toContain('beach_type-concrete.png');
  expect(tiles.find((t) => t.code === 'future_type')!.icon).toBe(fallbackIcon);
  expect(resolveAllFilterOptions(filterKey, icons, fallbackIcon, null)).toEqual([]);
  // White icons (made for dark backgrounds) are invisible on the light menu: "Concrete" rendered blank on dev.
  const whiteIcons = ['/images/categories/sunset.png', '/images/categories/gozd.png', '/images/categories/reka.png'];
  for (const icon of [...Object.values(icons), fallbackIcon]) expect(whiteIcons, icon).not.toContain(icon);

  const menuGroup = buildMenuItems({
    locale: 'si',
    continents,
    countries,
    aboutUrl: null,
    contactUrl: null,
    labels,
    filterGroups: [{ label: 'Vrste plaž', icon: group.icon, tiles }],
  }).find((i) => i.label === 'Vrste plaž')!;
  expect(menuGroup.subItems).toHaveLength(7);
  expect(menuGroup.subItems![5]!.href).toBe(`${buildBeachMapUrl('si')}?beach_type=concrete`);
});

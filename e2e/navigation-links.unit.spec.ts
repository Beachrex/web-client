import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { locales } from '@/app/config/locales';
import type { Country } from '@/lib/api-client/types.gen';
import { buildMenuItems, TOP_COUNTRIES } from '@/lib/utils/menu-items';
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

test('menu top countries: only countries with beaches and a known continent, at most TOP_COUNTRIES', () => {
  const top = build().find((i) => i.label === labels.topCountries)!;
  expect(top.subItems).toHaveLength(TOP_COUNTRIES);
  expect(top.subItems![0]).toEqual({ label: 'Land 0', href: `/de/${getBeachesWord('de')}/europa/land-0` });
  const hrefs = top.subItems!.map((s) => s.href);
  expect(hrefs).not.toContain(`/de/${getBeachesWord('de')}/europa/land-12`);
  expect(hrefs.some((h) => h.includes('land-13'))).toBe(false);
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

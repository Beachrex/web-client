import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { locales } from '@/app/config/locales';
import { getBeachMapWord, getBeachesWord, buildBeachMapUrl } from '@/lib/utils/beach-urls';

/**
 * Pure unit tests for the beach-map URL helpers.
 *
 * These guard against the localization/routing bugs fixed in
 * docs/features/BEACH_MAP_LINK_FIX.md:
 *  - wrong/drifted slugs producing 404s (e.g. de: strandkarte, ru: karta-plyazhej)
 *  - locale-less hrefs causing cross-locale jumps via the NEXT_LOCALE cookie
 *
 * They also assert the helper stays in sync with the canonical slug map in
 * src/i18n/routing.ts (globalRoutes.beachMap), which is the source of truth
 * the next-intl middleware uses.
 */

// Expected canonical slugs, mirrored from src/i18n/routing.ts (globalRoutes.beachMap).
const EXPECTED_SLUGS: Record<string, string> = {
  en: 'beach-map',
  si: 'zemljevid-plaz',
  de: 'strand-karte',
  hr: 'karta-plaza',
  fr: 'carte-des-plages',
  es: 'mapa-de-playas',
  it: 'mappa-spiagge',
  ua: 'karta-plyazhiv',
  ru: 'karta-plyazhey',
  pl: 'mapa-plaz',
  cs: 'mapa-plazi',
  hu: 'strand-terkep',
  bg: 'karta-na-plyazhovete',
  sk: 'mapa-plazi',
  da: 'strandkort',
  pt: 'mapa-praias',
  nl: 'strandkaart',
  el: 'chartis-paralion',
  sq: 'harta-plazheve',
};

test.describe('beach-urls: getBeachMapWord', () => {
  for (const [locale, slug] of Object.entries(EXPECTED_SLUGS)) {
    test(`returns correct slug for "${locale}"`, () => {
      expect(getBeachMapWord(locale)).toBe(slug);
    });
  }

  test('regression: de is "strand-karte" (not "strandkarte")', () => {
    expect(getBeachMapWord('de')).toBe('strand-karte');
    expect(getBeachMapWord('de')).not.toBe('strandkarte');
  });

  test('regression: ru is "karta-plyazhey" (not "karta-plyazhej")', () => {
    expect(getBeachMapWord('ru')).toBe('karta-plyazhey');
    expect(getBeachMapWord('ru')).not.toBe('karta-plyazhej');
  });

  test('falls back to English slug for unknown locale', () => {
    expect(getBeachMapWord('xx')).toBe('beach-map');
    expect(getBeachMapWord('')).toBe('beach-map');
  });
});

test.describe('beach-urls: buildBeachMapUrl', () => {
  test('always produces a locale-prefixed path (no cookie reliance)', () => {
    for (const locale of locales) {
      const url = buildBeachMapUrl(locale);
      expect(url).toBe(`/${locale}/${EXPECTED_SLUGS[locale]}`);
      expect(url.startsWith(`/${locale}/`)).toBe(true);
    }
  });

  test('appends query string when provided', () => {
    expect(buildBeachMapUrl('hr', 'continent_code=EU&country=hr')).toBe(
      '/hr/karta-plaza?continent_code=EU&country=hr'
    );
  });

  test('omits the "?" when query string is empty or undefined', () => {
    expect(buildBeachMapUrl('de')).toBe('/de/strand-karte');
    expect(buildBeachMapUrl('de', '')).toBe('/de/strand-karte');
  });

  test('regression: de builds "/de/strand-karte" (the 404 slug is gone)', () => {
    expect(buildBeachMapUrl('de')).toBe('/de/strand-karte');
  });

  test('regression: ru builds "/ru/karta-plyazhey" (the 404 slug is gone)', () => {
    expect(buildBeachMapUrl('ru')).toBe('/ru/karta-plyazhey');
  });
});

/** Parse a `key: { en: '...', si: '...' }` block from src/i18n/routing.ts. */
function routingBlock(key: string): Record<string, string> {
  const routingSrc = readFileSync(join(process.cwd(), 'src', 'i18n', 'routing.ts'), 'utf-8');
  const blockMatch = new RegExp(`${key}:\\s*\\{([^}]*)\\}`).exec(routingSrc);
  expect(blockMatch, `${key} block not found in routing.ts`).toBeTruthy();
  const slugs: Record<string, string> = {};
  const entryRe = /(\w+):\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(blockMatch?.[1] ?? '')) !== null) {
    if (m[1] && m[2]) slugs[m[1]] = m[2];
  }
  return slugs;
}

test.describe('beach-urls: sync with routing.ts', () => {
  test('every supported locale has a slug', () => {
    for (const locale of locales) {
      expect(EXPECTED_SLUGS[locale], `missing slug for ${locale}`).toBeTruthy();
    }
  });

  test('helper matches globalRoutes.beachMap in src/i18n/routing.ts', () => {
    const routingSrc = readFileSync(
      join(process.cwd(), 'src', 'i18n', 'routing.ts'),
      'utf-8'
    );

    // Extract the beachMap: { ... } block from routing.ts and parse its slugs.
    const blockMatch = /beachMap:\s*\{([^}]*)\}/.exec(routingSrc);
    expect(blockMatch, 'beachMap block not found in routing.ts').toBeTruthy();

    const block = blockMatch?.[1] ?? '';
    const routingSlugs: Record<string, string> = {};
    const entryRe = /(\w+):\s*'([^']+)'/g;
    let m: RegExpExecArray | null;
    while ((m = entryRe.exec(block)) !== null) {
      const key = m[1];
      const value = m[2];
      if (key && value) {
        routingSlugs[key] = value;
      }
    }

    // routing.ts and the helper must agree for every locale, both directions.
    expect(routingSlugs).toEqual(EXPECTED_SLUGS);
    for (const locale of Object.keys(routingSlugs)) {
      expect(getBeachMapWord(locale)).toBe(routingSlugs[locale]);
    }
  });

  // Added 2026-10-07: the 5 languages added on 2026-07-28 were missing from the
  // helper, so beach detail links in da/pt/nl/el/sq used "/beaches/".
  test('getBeachesWord matches globalRoutes.beaches for every locale', () => {
    const routingWords = routingBlock('beaches');
    for (const locale of locales) {
      expect(routingWords[locale], `routing.ts has no beaches word for ${locale}`).toBeTruthy();
      expect(getBeachesWord(locale), `getBeachesWord("${locale}")`).toBe(routingWords[locale]);
    }
  });
});

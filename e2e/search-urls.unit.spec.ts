import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import type { NextRequest as NextRequestType, NextResponse as NextResponseType } from 'next/server';
import { locales } from '@/app/config/locales';
import { getBeachesWord } from '@/lib/utils/beach-urls';
import { buildSearchResultUrl } from '@/lib/utils/search-result-url';
import { routing } from '@/i18n/routing';
import { createBeachesMiddleware } from '@/lib/i18n/beaches-middleware';

// `next/server` has no ESM exports map, so load it (and next-intl's middleware) through require.
const require = createRequire(import.meta.url);
const { NextRequest, NextResponse } = require('next/server') as {
  NextRequest: typeof NextRequestType;
  NextResponse: typeof NextResponseType;
};
import type createIntlMiddlewareType from 'next-intl/middleware';
const createIntlMiddleware = (require('next-intl/middleware') as { default: typeof createIntlMiddlewareType }).default;
const middleware = createBeachesMiddleware(createIntlMiddleware(routing), (url) => NextResponse.rewrite(url));

/**
 * Regression tests for "non-EN search result → empty page" (dev review tracker QA #52, #53, #54).
 *
 * GlobalSearch pushed `/beaches/...`; the next-intl router only added the locale, so `si` went to
 * `/si/beaches/...`. next-intl answered with a redirect to `/si/plaze/...`, and src/middleware.ts
 * copied that `location` header onto a 200 rewrite, which Next served as an empty page.
 */

const hr = { continent_slug: 'evropa', country_slug: 'hrvaska' };

function run(path: string, cookieLocale = 'en') {
  const req = new NextRequest(new URL(`http://localhost:3000${path}`), {
    headers: { 'accept-language': 'en', cookie: `NEXT_LOCALE=${cookieLocale}` },
  });
  return middleware(req);
}

test.describe('buildSearchResultUrl', () => {
  test('every result type uses the localized beaches word', () => {
    expect(buildSearchResultUrl({ type: 'country', slug: 'hrvaska', ...hr }, 'si')).toBe(
      '/si/plaze/evropa/hrvaska',
    );
    expect(buildSearchResultUrl({ type: 'region', slug: 'istra', ...hr }, 'de')).toBe(
      '/de/strande/evropa/hrvaska/istra',
    );
    expect(
      buildSearchResultUrl({ type: 'island', slug: 'krk', region_slug: 'kvarner', ...hr }, 'fr'),
    ).toBe('/fr/plages/evropa/hrvaska/kvarner/krk');
    expect(
      buildSearchResultUrl({ type: 'city', slug: 'bol', island_slug: 'brac', region_slug: 'dalmacija', ...hr }, 'sq'),
    ).toBe('/sq/plazhet/evropa/hrvaska/brac/bol');
    expect(
      buildSearchResultUrl(
        { type: 'beach', slug: 'zlatni-rat', region_slug: 'dalmacija', island_slug: 'brac', city_slug: 'bol', ...hr },
        'en',
      ),
    ).toBe('/en/beaches/evropa/hrvaska/dalmacija/brac/bol/zlatni-rat');
  });

  test('country URL is correct for all 19 locales', () => {
    expect(locales).toHaveLength(19);
    for (const locale of locales) {
      expect(buildSearchResultUrl({ type: 'country', slug: 'hrvaska', ...hr }, locale)).toBe(
        `/${locale}/${getBeachesWord(locale)}/evropa/hrvaska`,
      );
    }
  });

  test('missing slugs fall back to the localized listing', () => {
    expect(buildSearchResultUrl({ type: 'country', slug: 'hrvaska' }, 'si')).toBe('/si/plaze');
    expect(buildSearchResultUrl({ type: 'beach', slug: 'x', continent_slug: 'evropa' }, 'pl')).toBe('/pl/plaze');
  });
});

test.describe('middleware', () => {
  test('a /<locale>/beaches/... URL in a non-EN locale redirects, never a 200 with a location header', () => {
    for (const locale of locales.filter((l) => l !== 'en')) {
      const res = run(`/${locale}/beaches/evropa/hrvaska`, locale);
      const location = res.headers.get('location');
      if (location) {
        expect(res.status, `${locale}: status`).toBeGreaterThanOrEqual(300);
        expect(res.status, `${locale}: status`).toBeLessThan(400);
        expect(new URL(location).pathname).toBe(`/${locale}/${getBeachesWord(locale)}/evropa/hrvaska`);
      }
    }
  });

  test('the localized URL is rewritten to the internal /beaches route', () => {
    const res = run('/si/plaze/evropa/hrvaska', 'si');
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toContain('/si/beaches/evropa/hrvaska');
  });

  test('the English URL is rewritten, not redirected', () => {
    const res = run('/en/beaches/europe/croatia');
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toContain('/en/beaches/europe/croatia');
  });

  test('a foreign beaches word after a language switch still renders (no empty 200)', () => {
    const res = run('/en/plaze/evropa/hrvaska');
    const location = res.headers.get('location');
    if (location) {
      expect(res.status).toBeGreaterThanOrEqual(300);
      expect(res.status).toBeLessThan(400);
    } else {
      expect(res.headers.get('x-middleware-rewrite')).toContain('/en/beaches/evropa/hrvaska');
    }
  });
});

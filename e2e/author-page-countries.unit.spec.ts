import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createElement, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTranslator } from 'next-intl';
import {
  AUTHOR_ROUTE,
  authorBeachesUrl,
  buildAuthorCountryUrls,
} from '@/lib/constants/author';
import { buildCountryUrl, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * Owner, 2026-10-28: the author page lists all 13 countries Beachrex has beaches in, every country links to its
 * localized country page, and "4,000 beaches" / "13 countries" link to the all-beaches page.
 */

// Countries with beaches on dev (get_beach_filters / country filter, 2026-10-28)
const BEACHREX_COUNTRIES = ['AL', 'BE', 'DE', 'DK', 'ES', 'FR', 'GR', 'HR', 'IT', 'ME', 'NL', 'PT', 'SI'];

const messagesDir = join(process.cwd(), 'messages');
const locales = readdirSync(messagesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));

type Messages = Record<string, unknown> & {
  AuthorPage: { countries: Record<string, string>; chapters: { road: { title: string; text: string } } };
};
const load = (locale: string) => JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), 'utf8')) as Messages;

test('the route has exactly the 13 Beachrex countries, no duplicates', () => {
  expect(AUTHOR_ROUTE).toHaveLength(13);
  expect(new Set(AUTHOR_ROUTE).size).toBe(13);
  expect(AUTHOR_ROUTE.map((c) => c.toUpperCase()).sort()).toEqual([...BEACHREX_COUNTRIES].sort());
});

test('every country gets a localized URL built by buildCountryUrl, in all 19 locales', () => {
  expect(locales).toHaveLength(19);
  for (const locale of locales) {
    // Localized slugs differ per language, like the API returns them with Accept-Language
    const continents = [{ code: 'EU', slug: `${locale}-europe` }];
    const countries = BEACHREX_COUNTRIES.map((code) => ({
      code,
      slug: `${locale}-${code.toLowerCase()}-slug`,
      continent_code: 'EU',
    }));
    const urls = buildAuthorCountryUrls(locale, continents, countries);
    expect(Object.keys(urls)).toHaveLength(13);
    for (const key of AUTHOR_ROUTE) {
      const expected = buildCountryUrl(locale, `${locale}-europe`, `${locale}-${key}-slug`);
      expect(urls[key], `${locale} ${key}`).toBe(expected);
      expect(urls[key]!.startsWith(`/${locale}/${getBeachesWord(locale)}/`), `${locale} ${key}`).toBe(true);
    }
    expect(authorBeachesUrl(locale)).toBe(`/${locale}/${getBeachesWord(locale)}`);
  }
});

test('a country or continent missing from the API gets no link instead of a broken URL', () => {
  const urls = buildAuthorCountryUrls(
    'de',
    [{ code: 'EU', slug: 'europa' }],
    [
      { code: 'HR', slug: 'kroatien', continent_code: 'EU' },
      { code: 'SI', slug: '', continent_code: 'EU' },
      { code: 'IT', slug: 'italien', continent_code: 'XX' },
    ],
  );
  expect(urls).toEqual({ hr: '/de/strande/europa/kroatien' });
  expect(buildAuthorCountryUrls('en', [], [])).toEqual({});
});

test('all 19 locales name the 13 countries and render the linked title and story text', () => {
  for (const locale of locales) {
    const messages = load(locale);
    const a = messages.AuthorPage;
    expect(Object.keys(a.countries).sort(), locale).toEqual([...AUTHOR_ROUTE].sort());
    for (const c of AUTHOR_ROUTE) expect(a.countries[c]?.trim(), `${locale} ${c}`).toBeTruthy();

    // ICU tags parse and wrap the right words; the country list is inserted once
    const t = createTranslator({ locale, messages, namespace: 'AuthorPage' });
    const link = (cls: string) => (chunks: ReactNode) => createElement('a', { className: cls }, chunks);
    const tags = { beaches: link('b'), countries: link('c'), list: () => createElement('i', null, 'LIST') };
    const title = renderToStaticMarkup(createElement(Fragment, null, t.rich('chapters.road.title', tags)));
    const text = renderToStaticMarkup(createElement(Fragment, null, t.rich('chapters.road.text', tags)));
    for (const html of [title, text]) {
      expect(html, locale).toMatch(/<a class="b">4[\s.,  ]?000 [^<]+<\/a>/);
      expect(html, locale).toMatch(/<a class="c">13 [^<]+<\/a>/);
    }
    expect(text.match(/<i>LIST<\/i>/g), locale).toHaveLength(1);
    // No unparsed placeholders or tags left over
    for (const html of [title, text]) {
      expect(html.replace(/<\/?(a|i)( class="[bc]")?>/g, ''), locale).not.toMatch(/[<>{}]/);
    }
  }
});

test('the page builds links with the helpers and never hardcodes a locale', () => {
  const src = readFileSync(join(process.cwd(), 'src/app/[locale]/gregor-balazic/page.tsx'), 'utf8');
  expect(src).toContain('buildAuthorCountryUrls(');
  expect(src).toContain('authorBeachesUrl(');
  expect(src).toContain("t.rich('chapters.road.title'");
  expect(src).toContain("t.rich('chapters.road.text'");
  expect(src).not.toMatch(/['"`]\/en\//);
});

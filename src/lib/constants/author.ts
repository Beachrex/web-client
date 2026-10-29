import { buildCountryUrl, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * The author page (owner, 2026-10-08): a dedication to Gregor Balažic, who photographed the beaches.
 * The path is his name, the same in every locale.
 */
export const AUTHOR_PATH = '/gregor-balazic';
export const AUTHOR_NAME = 'Gregor Balažic';

export const AUTHOR_PHOTO = '/images/author/gregor-balazic.jpg';
export const AUTHOR_BEACH_PHOTO = '/images/author/beach-on-the-road.jpg';

/** Facts from the owner's text; shown as the stats band. */
export const AUTHOR_STATS = [
  { key: 'beaches', value: 4000, plus: false },
  { key: 'km', value: 70000, plus: true },
  { key: 'countries', value: 13, plus: false },
  { key: 'facts', value: 200, plus: true },
] as const;

/**
 * The 13 countries along the coasts (owner, 2026-10-28: all 13 countries Beachrex has beaches in, each linked to its
 * country page). Keys are lower-case ISO 3166-1 alpha-2 codes and message keys under `AuthorPage.countries`.
 */
export const AUTHOR_ROUTE = ['si', 'hr', 'me', 'al', 'gr', 'it', 'fr', 'es', 'pt', 'be', 'nl', 'de', 'dk'] as const;
export type AuthorCountryKey = (typeof AUTHOR_ROUTE)[number];

/** "4,000 beaches" and "13 countries" open the all-beaches page (world totals and every country with beaches). */
export function authorBeachesUrl(locale: string): string {
  return `/${locale}/${getBeachesWord(locale)}`;
}

interface SlugContinent {
  code?: string;
  slug?: string;
}
interface SlugCountry {
  code?: string;
  slug?: string;
  continent_code?: string;
}

/**
 * Localized country-page URL for each route country, from `GET /countries` and `GET /continents` fetched with the
 * page's Accept-Language (slugs are localized). A country the API did not return (or a failed request) gets no
 * entry, and the page renders its name without a link instead of a broken URL.
 */
export function buildAuthorCountryUrls(
  locale: string,
  continents: SlugContinent[],
  countries: SlugCountry[],
): Partial<Record<AuthorCountryKey, string>> {
  const continentSlug = new Map(continents.filter((c) => c.code && c.slug).map((c) => [c.code!, c.slug!]));
  const byCode = new Map(countries.filter((c) => c.code).map((c) => [c.code!.toUpperCase(), c]));
  const urls: Partial<Record<AuthorCountryKey, string>> = {};
  for (const key of AUTHOR_ROUTE) {
    const country = byCode.get(key.toUpperCase());
    const continent = continentSlug.get(country?.continent_code ?? '');
    if (country?.slug && continent) urls[key] = buildCountryUrl(locale, continent, country.slug);
  }
  return urls;
}

/** next-intl locale → BCP 47 for number formatting (the frontend uses `si` and `ua`). */
export function numberLocale(locale: string): string {
  if (locale === 'si') return 'sl';
  if (locale === 'ua') return 'uk';
  return locale;
}

export function authorUrl(locale: string): string {
  return `/${locale}${AUTHOR_PATH}`;
}

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
  { key: 'beaches', value: 2445, plus: false },
  { key: 'km', value: 30000, plus: true },
  { key: 'countries', value: 6, plus: false },
  { key: 'facts', value: 200, plus: true },
] as const;

/** The route along the coasts, in travel order (message keys under AuthorPage.countries). */
export const AUTHOR_ROUTE = ['si', 'hr', 'ba', 'it', 'fr', 'es'] as const;

/** next-intl locale → BCP 47 for number formatting (the frontend uses `si` and `ua`). */
export function numberLocale(locale: string): string {
  if (locale === 'si') return 'sl';
  if (locale === 'ua') return 'uk';
  return locale;
}

export function authorUrl(locale: string): string {
  return `/${locale}${AUTHOR_PATH}`;
}

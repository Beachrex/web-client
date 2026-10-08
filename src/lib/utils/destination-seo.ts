import { getBeachesWord } from '@/lib/utils/beach-urls';
import { truncateDescription, truncateTitle } from '@/lib/utils/seo-helpers';

export type DestinationKind = 'region' | 'island' | 'city';

/** `SEO` namespace keys per page type (all 19 locales have them). */
const SEO_KEYS: Record<DestinationKind, { title: string; description: string; nameParam: string }> = {
  region: { title: 'regionTitle', description: 'regionDescription', nameParam: 'regionName' },
  island: { title: 'islandTitle', description: 'islandDescription', nameParam: 'islandName' },
  city: { title: 'cityTitle', description: 'cityDescription', nameParam: 'cityName' },
};

type Translate = (key: string, values: Record<string, string>) => string;

/**
 * Title and meta description for a region, island or city page, from the `SEO` messages.
 * Before, these pages had the capitalised URL slug as their title and no description.
 */
export function buildDestinationSeoText(
  kind: DestinationKind,
  name: string,
  countryName: string,
  t: Translate,
): { title: string; description: string } {
  const keys = SEO_KEYS[kind];
  const values = { [keys.nameParam]: name, countryName };

  return {
    title: truncateTitle(t(keys.title, values)),
    description: truncateDescription(t(keys.description, values)),
  };
}

/**
 * Canonical path (without the locale) of a region, island or city page: the URL the page was
 * resolved from, with the locale's own "beaches" word.
 */
export function buildDestinationPath(
  locale: string,
  continent: string,
  country: string,
  segments: string[],
): string {
  return `/${getBeachesWord(locale)}/${continent}/${country}/${segments.join('/')}`;
}

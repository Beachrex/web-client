// src/lib/utils/search-result-url.ts

import { getBeachesWord } from '@/lib/utils/beach-urls';

export interface SearchResultSlugs {
  type: 'beach' | 'city' | 'island' | 'region' | 'country';
  slug: string;
  continent_slug?: string | null;
  country_slug?: string | null;
  region_slug?: string | null;
  island_slug?: string | null;
  city_slug?: string | null;
}

/**
 * Full, locale-prefixed URL of a global search result, e.g. `/si/plaze/evropa/hrvaska`.
 *
 * It must use the localized "beaches" word: `/si/beaches/...` made next-intl answer with a
 * redirect that the middleware turned into an empty page (QA #52, #53, #54).
 * Returns the localized beaches listing when required slugs are missing.
 */
export function buildSearchResultUrl(result: SearchResultSlugs, locale: string): string {
  const root = `/${locale}/${getBeachesWord(locale)}`;
  const { continent_slug: continent, country_slug: country } = result;

  if (!continent) return root;

  const segments: string[] = [continent];

  switch (result.type) {
    case 'country':
      segments.push(result.slug);
      break;

    case 'region':
      if (!country) return root;
      segments.push(country, result.slug);
      break;

    case 'island':
      if (!country) return root;
      segments.push(country);
      if (result.region_slug) segments.push(result.region_slug);
      segments.push(result.slug);
      break;

    case 'city':
      if (!country) return root;
      segments.push(country);
      if (result.island_slug) {
        segments.push(result.island_slug);
      } else if (result.region_slug) {
        segments.push(result.region_slug);
      }
      segments.push(result.slug);
      break;

    case 'beach':
      if (!country) return root;
      segments.push(country);
      if (result.region_slug) segments.push(result.region_slug);
      if (result.island_slug) segments.push(result.island_slug);
      if (result.city_slug) segments.push(result.city_slug);
      segments.push(result.slug);
      break;

    default:
      return root;
  }

  return `${root}/${segments.join('/')}`;
}

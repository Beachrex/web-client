// src/lib/utils/destination-url.ts

import { getBeachesWord } from '@/lib/utils/beach-urls';

export type DestinationType =
  | 'country'
  | 'region'
  | 'island'
  | 'city';

interface DestinationLocation {
  continent_slug: string;
  country_slug: string;
  // Cities and islands may have no region (the API sends null); the URL then skips that segment.
  region_slug?: string | null;
  island_slug?: string | null;
}

interface BuildDestinationUrlParams {
  locale: string;
  type: DestinationType;
  slug: string; // slug of the destination itself
  location: DestinationLocation;
}

/**
 * Centralized destination URL builder
 * This is the single source of truth for destination routing.
 * Uses the localized "beaches" word for each locale (all 19, via getBeachesWord).
 * Never throws for a missing region: a city or island without a region crashed the
 * country page while rendering (QA #53, #56).
 */
export function buildDestinationUrl({
  locale,
  type,
  slug,
  location,
}: BuildDestinationUrlParams): string {
  const beachesWord = getBeachesWord(locale);
  const base = `/${locale}/${beachesWord}/${location.continent_slug}/${location.country_slug}`;

  const regionPart = location.region_slug ? `/${location.region_slug}` : '';

  switch (type) {
    case 'country':
      return base;

    case 'region':
      return `${base}/${location.region_slug ?? slug}`;

    case 'island':
      return `${base}${regionPart}/${slug}`;

    case 'city': {
      // island is optional for city
      const islandPart = location.island_slug ? `/${location.island_slug}` : '';

      return `${base}${regionPart}${islandPart}/${slug}`;
    }

    default:
      throw new Error('Unsupported destination type');
  }
}

// src/lib/utils/destination-url.ts

export type DestinationType =
  | 'country'
  | 'region'
  | 'island'
  | 'city';

interface DestinationLocation {
  continent_slug: string;
  country_slug: string;
  region_slug?: string;
  island_slug?: string;
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
 */
export function buildDestinationUrl({
  locale,
  type,
  slug,
  location,
}: BuildDestinationUrlParams): string {
  const base = `/${locale}/beaches/${location.continent_slug}/${location.country_slug}`;

  switch (type) {
    case 'country':
      return base;

    case 'region':
      if (!location.region_slug) {
        throw new Error('Region URL requires region_slug');
      }
      return `${base}/${location.region_slug}`;

    case 'island':
      if (!location.region_slug) {
        throw new Error('Island URL requires region_slug');
      }
      return `${base}/${location.region_slug}/${slug}`;

    case 'city': {
      if (!location.region_slug) {
        throw new Error('City URL requires region_slug');
      }

      // island is optional for city
      const islandPart = location.island_slug
        ? `/${location.island_slug}`
        : '';

      return `${base}/${location.region_slug}${islandPart}/${slug}`;
    }

    default:
  throw new Error('Unsupported destination type');
  }
}

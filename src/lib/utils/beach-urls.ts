/**
 * Utility functions for building beach-related URLs
 */

import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

/**
 * Get localized "beaches" word for URL
 */
function getBeachesWord(locale: string): string {
  const beachesRoutes: Record<string, string> = {
    en: 'beaches',
    si: 'plaze',
    de: 'strande',
    hr: 'plaze',
    fr: 'plages',
    es: 'playas',
    it: 'spiagge',
    ua: 'plyazhi',
    ru: 'plyazhi',
    pl: 'plaze',
    cs: 'plaze',
    hu: 'strandok',
    bg: 'plyazhove',
    sk: 'plaze',
  };
  return beachesRoutes[locale] ?? 'beaches';
}

/**
 * Build beach URL from beach details object
 * This is the MAIN function to use throughout the project for building beach URLs
 *
 * Handles flexible geographic hierarchy:
 * - Continent and country are always included
 * - Region, island, and city are optional (only included if they exist)
 * - Order: continent → country → [region] → [island] → [city] → beach
 *
 * @param beachDetails - Beach details from API
 * @param locale - Current locale (e.g., 'en', 'si')
 * @returns Full beach detail page URL
 *
 * @example
 * // Beach with full hierarchy (region + island + city)
 * buildBeachUrl(beachDetails, 'en')
 * // Returns: /en/beaches/europe/croatia/kvarner/island-cres/cres/beach-name
 *
 * @example
 * // Beach with only country (no region, island, or city)
 * buildBeachUrl(beachDetails, 'en')
 * // Returns: /en/beaches/europe/monaco/beach-name
 */
export function buildBeachUrl(
  beachDetails: BeachDetailsSchema,
  locale: string
): string {
  const segments: string[] = [locale, getBeachesWord(locale)];

  // Continent (required)
  const continentSlug = beachDetails.location?.continent?.slug;
  if (!continentSlug) {
    console.error('Beach missing continent slug:', beachDetails.basic_info?.slug);
    return '#';
  }
  segments.push(continentSlug);

  // Country (required)
  const countrySlug = beachDetails.location?.country?.slug;
  if (!countrySlug) {
    console.error('Beach missing country slug:', beachDetails.basic_info?.slug);
    return '#';
  }
  segments.push(countrySlug);

  // Region (optional)
  const regionSlug = beachDetails.location?.region?.slug;
  if (regionSlug) {
    segments.push(regionSlug);
  }

  // Island (optional - comes after region if exists, otherwise after country)
  const islandSlug = beachDetails.location?.island?.slug;
  if (islandSlug) {
    segments.push(islandSlug);
  }

  // City (optional - comes after island if exists, otherwise after region/country)
  const citySlug = beachDetails.location?.city?.slug;
  if (citySlug) {
    segments.push(citySlug);
  }

  // Beach slug (required)
  const beachSlug = beachDetails.basic_info?.slug;
  if (!beachSlug) {
    console.error('Beach missing slug:', beachDetails.basic_info?.id);
    return '#';
  }
  segments.push(beachSlug);

  return '/' + segments.join('/');
}

/**
 * Build country page URL
 * Format: /[locale]/beaches/[continent]/[country]
 */
export function buildCountryUrl(
  locale: string,
  continentSlug: string,
  countrySlug: string
): string {
  const beachesWord = getBeachesWord(locale);
  return `/${locale}/${beachesWord}/${continentSlug}/${countrySlug}`;
}

/**
 * Build continent page URL
 * Format: /[locale]/beaches/[continent]
 */
export function buildContinentUrl(locale: string, continentSlug: string): string {
  const beachesWord = getBeachesWord(locale);
  return `/${locale}/${beachesWord}/${continentSlug}`;
}

/**
 * Build beach URL from navigation data (previous/next beach)
 * Navigation data includes location slugs, so we can build the URL directly
 *
 * @param navigationBeach - Navigation beach object from API (previous or next)
 * @param locale - Current locale
 * @returns Full beach URL
 */
export function buildBeachUrlFromNavigation(
  navigationBeach: {
    slug?: string;
    location?: {
      continent_slug?: string | null;
      country_slug?: string | null;
      region_slug?: string | null;
      island_slug?: string | null;
      city_slug?: string | null;
    };
  },
  locale: string
): string {
  const segments: string[] = [locale, getBeachesWord(locale)];

  // Continent (required)
  const continentSlug = navigationBeach.location?.continent_slug;
  if (!continentSlug) {
    console.error('Navigation beach missing continent slug:', navigationBeach.slug);
    return '#';
  }
  segments.push(continentSlug);

  // Country (required)
  const countrySlug = navigationBeach.location?.country_slug;
  if (!countrySlug) {
    console.error('Navigation beach missing country slug:', navigationBeach.slug);
    return '#';
  }
  segments.push(countrySlug);

  // Region (optional)
  const regionSlug = navigationBeach.location?.region_slug;
  if (regionSlug) {
    segments.push(regionSlug);
  }

  // Island (optional)
  const islandSlug = navigationBeach.location?.island_slug;
  if (islandSlug) {
    segments.push(islandSlug);
  }

  // City (optional)
  const citySlug = navigationBeach.location?.city_slug;
  if (citySlug) {
    segments.push(citySlug);
  }

  // Beach slug (required)
  const beachSlug = navigationBeach.slug;
  if (!beachSlug) {
    console.error('Navigation beach missing slug');
    return '#';
  }
  segments.push(beachSlug);

  return '/' + segments.join('/');
}

/**
 * Build beach URL from BeachSchema (from listing APIs)
 * BeachSchema includes location slugs, so we can build the URL directly
 *
 * @param beach - Beach object from listing API
 * @param locale - Current locale
 * @returns Full beach URL or null if required fields are missing
 */
export function buildBeachUrlFromSchema(
  beach: {
    slug?: string;
    continent_slug?: string | null;
    country_slug?: string | null;
    region_slug?: string | null;
    island_slug?: string | null;
    city_slug?: string | null;
  },
  locale: string
): string | null {
  // Check required fields
  if (!beach.continent_slug || !beach.country_slug || !beach.slug) {
    return null;
  }

  const segments: string[] = [locale, getBeachesWord(locale)];

  // Continent (required)
  segments.push(beach.continent_slug);

  // Country (required)
  segments.push(beach.country_slug);

  // Region (optional)
  if (beach.region_slug) {
    segments.push(beach.region_slug);
  }

  // Island (optional - comes after region if exists, otherwise after country)
  if (beach.island_slug) {
    segments.push(beach.island_slug);
  }

  // City (optional - comes after island if exists, otherwise after region/country)
  if (beach.city_slug) {
    segments.push(beach.city_slug);
  }

  // Beach slug (required)
  segments.push(beach.slug);

  return '/' + segments.join('/');
}


/**
 * Build country URL from navigation data (previous/next country)
 * Format: /[locale]/beaches/[continent]/[country]
 */
export function buildCountryUrlFromNavigation(
  navigationCountry: {
    slug?: string;
    location?: {
      continent_slug?: string | null;
    };
  },
  locale: string,
): string {
  const continentSlug = navigationCountry.location?.continent_slug;
  const countrySlug = navigationCountry.slug;

  if (!continentSlug || !countrySlug) {
    console.error(
      'Navigation country missing required slugs:',
      navigationCountry,
    );
    return '#';
  }

  return buildCountryUrl(locale, continentSlug, countrySlug);
}

/**
 * Build region URL from navigation data (previous/next region)
 * Format: /[locale]/beaches/[continent]/[country]/[region]
 */
export function buildRegionUrlFromNavigation(
  navigationRegion: {
    slug?: string;
    location?: {
      continent_slug?: string | null;
      country_slug?: string | null;
    };
  },
  locale: string,
): string {
  const continentSlug = navigationRegion.location?.continent_slug;
  const countrySlug = navigationRegion.location?.country_slug;
  const regionSlug = navigationRegion.slug;

  if (!continentSlug || !countrySlug || !regionSlug) {
    console.error(
      'Navigation region missing required slugs:',
      navigationRegion,
    );
    return '#';
  }

  const beachesWord = getBeachesWord(locale);
  return `/${locale}/${beachesWord}/${continentSlug}/${countrySlug}/${regionSlug}`;
}


export function buildIslandUrlFromNavigation(
  navigationIsland: {
    slug?: string;
    location?: {
      continent_slug?: string | null;
      country_slug?: string | null;
      region_slug?: string | null;
    };
  },
  locale: string,
): string {
  const continentSlug = navigationIsland.location?.continent_slug;
  const countrySlug = navigationIsland.location?.country_slug;
  const regionSlug = navigationIsland.location?.region_slug;
  const islandSlug = navigationIsland.slug;

  if (!continentSlug || !countrySlug || !islandSlug) {
    console.error(
      'Navigation island missing required slugs:',
      navigationIsland,
    );
    return '#';
  }

  const beachesWord = getBeachesWord(locale);

  const segments = [
    locale,
    beachesWord,
    continentSlug,
    countrySlug,
  ];

  if (regionSlug) {
    segments.push(regionSlug);
  }

  segments.push(islandSlug);

  return '/' + segments.join('/');
}


/**
 * Build city URL from navigation data (previous/next city)
 * Typical formats:
 * - /[locale]/beaches/[continent]/[country]/[region]/[city]
 * - /[locale]/beaches/[continent]/[country]/[island]/[city]
 * (depending on whether city is on mainland or on an island)
 */
export function buildCityUrlFromNavigation(
  navigationCity: {
    slug?: string;
    location?: {
      continent_slug?: string | null;
      country_slug?: string | null;
      region_slug?: string | null;
      island_slug?: string | null;
    };
  },
  locale: string,
): string {
  const continentSlug = navigationCity.location?.continent_slug;
  const countrySlug = navigationCity.location?.country_slug;
  const regionSlug = navigationCity.location?.region_slug;
  const islandSlug = navigationCity.location?.island_slug;
  const citySlug = navigationCity.slug;

  if (!continentSlug || !countrySlug || !citySlug) {
    console.error('Navigation city missing required slugs:', navigationCity);
    return '#';
  }

  const beachesWord = getBeachesWord(locale);

  const segments: string[] = [
    locale,
    beachesWord,
    continentSlug,
    countrySlug,
  ];

  // If island is present, we prefer island branch, otherwise region
  if (islandSlug) {
    segments.push(islandSlug);
  } else if (regionSlug) {
    segments.push(regionSlug);
  }

  segments.push(citySlug);

  return '/' + segments.join('/');
}

/**
 * Build a human-readable location label based on geographic hierarchy.
 *
 * Works with the same logic as URL segments:
 * continent -> country -> region -> island -> city
 *
 * It automatically selects the most relevant "context" label,
 * depending on which slugs exist on the object.
 *
 * Examples:
 *  - Region page: country.name + region name
 *  - Island page: country.name + island name
 *  - City page:   country.name + city name
 *
 * If contextName is provided (e.g. "Krk"), it overrides automatic inference.
 */
export function buildLocationLabelAdvanced(
  country: {
    name?: string | null;
    full_name?: string | null;

    continent_slug?: string | null;
    country_slug?: string | null;
    region_slug?: string | null;
    island_slug?: string | null;
    city_slug?: string | null;

    location?: {
      continent?: { name?: string | null };
      country?: { name?: string | null };
      region?: { name?: string | null };
      island?: { name?: string | null };
      city?: { name?: string | null };
    };
  },
  contextName?: string
): string {
  const baseName =
    country?.full_name ??
    country?.name ??
    '';

  // Use explicit contextName first (from page-level)
  if (contextName) {
    return `${baseName}, ${contextName}`;
  }

  // Otherwise infer from available location fields
  const loc = country.location;

  // Prefer the most specific available level
  if (loc?.city?.name) {
    return `${baseName}, ${loc.city.name}`;
  }

  if (loc?.island?.name) {
    return `${baseName}, ${loc.island.name}`;
  }

  if (loc?.region?.name) {
    return `${baseName}, ${loc.region.name}`;
  }

  if (loc?.country?.name) {
    return `${baseName}, ${loc.country.name}`;
  }

  if (loc?.continent?.name) {
    return `${baseName}, ${loc.continent.name}`;
  }

  // Fallback to country name only
  return baseName;
}

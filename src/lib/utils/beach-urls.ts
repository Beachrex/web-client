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


/**
 * SEO Helper Utilities
 *
 * Reusable helper functions for generating SEO-friendly metadata
 * All functions support localization and follow SEO best practices
 */

/**
 * Maximum recommended length for meta title (Google displays ~60 characters)
 */
const MAX_TITLE_LENGTH = 60;

/**
 * Maximum recommended length for meta description (Google displays ~160 characters)
 */
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Truncate text to specified length while preserving whole words
 * Adds ellipsis (...) if text is truncated
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 160)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText("This is a very long description that needs to be truncated", 30)
 * // Returns: "This is a very long..."
 */
export function truncateText(text: string, maxLength: number = MAX_DESCRIPTION_LENGTH): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If no space found, just truncate at maxLength
  if (lastSpace === -1) {
    return `${truncated.trim()}...`;
  }

  return `${truncated.slice(0, lastSpace).trim()}...`;
}

/**
 * Truncate title to SEO-friendly length (60 characters)
 * Preserves whole words and adds ellipsis if truncated
 *
 * @param title - Title to truncate
 * @returns Truncated title
 *
 * @example
 * truncateTitle("Bačvice Beach - Split, Croatia | BeachRex - The Best Beach Guide")
 * // Returns: "Bačvice Beach - Split, Croatia | BeachRex - The Best..."
 */
export function truncateTitle(title: string): string {
  return truncateText(title, MAX_TITLE_LENGTH);
}

/**
 * Truncate description to SEO-friendly length (160 characters)
 * Preserves whole words and adds ellipsis if truncated
 *
 * @param description - Description to truncate
 * @returns Truncated description
 *
 * @example
 * truncateDescription("Discover the beautiful Bačvice Beach in Split, Croatia...")
 * // Returns: "Discover the beautiful Bačvice Beach in Split, Croatia. Perfect for
 * // families with sandy shores, clear waters, and excellent facilities..."
 */
export function truncateDescription(description: string): string {
  return truncateText(description, MAX_DESCRIPTION_LENGTH);
}

/**
 * Build localized image alt text for beach images
 *
 * @param beachName - Name of the beach
 * @param cityName - Name of the city (optional)
 * @param countryName - Name of the country
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildBeachImageAlt("Bačvice", "Split", "Croatia", t)
 * // Returns: "Bačvice beach in Split, Croatia" (localized)
 */
export function buildBeachImageAlt(
  beachName: string,
  cityName: string | null | undefined,
  countryName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  if (cityName) {
    return t('beachImageAlt', { beachName, cityName, countryName });
  }
  return t('beachImageAltNoCity', { beachName, countryName });
}

/**
 * Build localized alt text for icon images
 *
 * @param iconName - Name/type of the icon (e.g., 'parking', 'shower', 'restaurant')
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildIconAlt("parking", t)
 * // Returns: "Parking available" (localized)
 */
export function buildIconAlt(
  iconName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t(`iconAlt.${iconName}`, { defaultValue: iconName });
}

/**
 * Build localized alt text for facility/amenity icons
 *
 * @param facilityName - Name of the facility (e.g., 'shower', 'toilet', 'restaurant')
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildFacilityAlt("shower", t)
 * // Returns: "Shower facilities" (localized)
 */
export function buildFacilityAlt(
  facilityName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t(`facilityAlt.${facilityName}`, { defaultValue: `${facilityName} facilities` });
}

/**
 * Build localized alt text for country flag images
 *
 * @param countryName - Name of the country
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildCountryFlagAlt("Croatia", t)
 * // Returns: "Croatia flag" (localized)
 */
export function buildCountryFlagAlt(
  countryName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t('countryFlagAlt', { countryName });
}

/**
 * Build localized alt text for continent images
 *
 * @param continentName - Name of the continent
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildContinentImageAlt("Europe", t)
 * // Returns: "Beaches in Europe" (localized)
 */
export function buildContinentImageAlt(
  continentName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t('continentImageAlt', { continentName });
}

/**
 * Build localized alt text for country images
 *
 * @param countryName - Name of the country
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildCountryImageAlt("Croatia", t)
 * // Returns: "Beaches in Croatia" (localized)
 */
export function buildCountryImageAlt(
  countryName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t('countryImageAlt', { countryName });
}

/**
 * Build localized alt text for region images
 *
 * @param regionName - Name of the region
 * @param countryName - Name of the country
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildRegionImageAlt("Dalmatia", "Croatia", t)
 * // Returns: "Beaches in Dalmatia, Croatia" (localized)
 */
export function buildRegionImageAlt(
  regionName: string,
  countryName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t('regionImageAlt', { regionName, countryName });
}

/**
 * Build localized alt text for city images
 *
 * @param cityName - Name of the city
 * @param countryName - Name of the country
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildCityImageAlt("Split", "Croatia", t)
 * // Returns: "Beaches in Split, Croatia" (localized)
 */
export function buildCityImageAlt(
  cityName: string,
  countryName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t('cityImageAlt', { cityName, countryName });
}

/**
 * Build localized alt text for island images
 *
 * @param islandName - Name of the island
 * @param countryName - Name of the country
 * @param t - Translation function from next-intl
 * @returns Localized alt text
 *
 * @example
 * buildIslandImageAlt("Hvar", "Croatia", t)
 * // Returns: "Beaches on Hvar island, Croatia" (localized)
 */
export function buildIslandImageAlt(
  islandName: string,
  countryName: string,
  t: (key: string, values?: Record<string, string>) => string
): string {
  return t('islandImageAlt', { islandName, countryName });
}

/**
 * Sanitize text for use in meta tags
 * Removes HTML tags, extra whitespace, and special characters that could break meta tags
 *
 * @param text - Text to sanitize
 * @returns Sanitized text safe for meta tags
 *
 * @example
 * sanitizeMetaText("<p>Beach with \"quotes\" & special chars</p>")
 * // Returns: "Beach with quotes & special chars"
 */
export function sanitizeMetaText(text: string): string {
  if (!text) return '';

  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}


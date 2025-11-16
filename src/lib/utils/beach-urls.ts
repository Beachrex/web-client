/**
 * Utility functions for building beach-related URLs
 */

/**
 * Build beach detail page URL
 * Format: /[locale]/beaches/[continent]/[country]/[region]/[city]/[beach-slug]
 *
 * @param locale - Current locale (e.g., 'en', 'si')
 * @param continentSlug - Continent slug (e.g., 'europe')
 * @param countrySlug - Country slug (e.g., 'croatia')
 * @param regionSlug - Region slug (e.g., 'dalmatia')
 * @param citySlug - City slug (e.g., 'split')
 * @param beachSlug - Beach slug (e.g., 'beach-bacvice')
 * @returns Full beach detail page URL
 */
export function buildBeachDetailUrl(
  locale: string,
  continentSlug: string,
  countrySlug: string,
  regionSlug: string,
  citySlug: string,
  beachSlug: string
): string {
  // Get localized "beaches" word
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
  const beachesWord = beachesRoutes[locale] ?? 'beaches';

  return `/${locale}/${beachesWord}/${continentSlug}/${countrySlug}/${regionSlug}/${citySlug}/${beachSlug}`;
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
  const beachesWord = beachesRoutes[locale] ?? 'beaches';

  return `/${locale}/${beachesWord}/${continentSlug}/${countrySlug}`;
}

/**
 * Build continent page URL
 * Format: /[locale]/beaches/[continent]
 */
export function buildContinentUrl(locale: string, continentSlug: string): string {
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
  const beachesWord = beachesRoutes[locale] ?? 'beaches';

  return `/${locale}/${beachesWord}/${continentSlug}`;
}


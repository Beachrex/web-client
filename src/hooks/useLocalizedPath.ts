'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getContinents } from '@/lib/api-client/sdk.gen';

// Locale-specific route translations
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

/**
 * Hook to get a localized path for language switching
 * Handles dynamic segments like continent slugs that need to be translated
 */
export const useLocalizedPath = () => {
  const pathname = usePathname(); // This returns the actual URL path with locale-specific segments
  const currentLocale = useLocale();

  /**
   * Get the localized path for a target locale
   * This handles translating dynamic segments like continent and city slugs
   */
  const getLocalizedPath = async (targetLocale: string): Promise<string> => {
    console.log('[useLocalizedPath] Starting translation:', { pathname, currentLocale, targetLocale });

    // Remove the locale prefix from pathname (e.g., /si/plaze/evropa -> /plaze/evropa)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
    console.log('[useLocalizedPath] Path without locale:', pathWithoutLocale);

    // Get the current locale's beaches route word
    const currentBeachesWord = beachesRoutes[currentLocale] ?? 'beaches';
    console.log('[useLocalizedPath] Current beaches word:', currentBeachesWord);

    // Check if we're on a continent or city page
    const continentCityPattern = new RegExp(`^\\/${currentBeachesWord}\\/([^/]+)\\/([^/]+)(?:\\/|$)`);
    const continentPattern = new RegExp(`^\\/${currentBeachesWord}\\/([^/]+)(?:\\/|$)`);

    const continentCityMatch = pathWithoutLocale.match(continentCityPattern);
    const continentMatch = pathWithoutLocale.match(continentPattern);

    console.log('[useLocalizedPath] Continent match:', continentMatch);

    if (!continentMatch) {
      // Not a beaches page, just replace the locale in the path
      console.log('[useLocalizedPath] Not a beaches page, returning:', pathWithoutLocale);
      return pathWithoutLocale;
    }

    const currentContinentSlug = continentMatch[1];
    const currentCitySlug = continentCityMatch?.[2];
    console.log('[useLocalizedPath] Extracted slugs:', { currentContinentSlug, currentCitySlug });

    try {
      // Fetch continents for current locale to get the continent code
      const { data: currentContinentsResponse } = await getContinents({
        headers: { 'Accept-Language': currentLocale },
      });

      const currentContinent = currentContinentsResponse?.data?.find(
        c => c.slug?.toLowerCase() === currentContinentSlug.toLowerCase()
      );

      console.log('[useLocalizedPath] Found current continent:', currentContinent);

      if (!currentContinent?.code) {
        // Couldn't find continent, return pathname as-is
        console.log('[useLocalizedPath] No continent code found, returning:', pathWithoutLocale);
        return pathWithoutLocale;
      }

      // Fetch continents for target locale to get the translated slug
      const { data: targetContinentsResponse } = await getContinents({
        headers: { 'Accept-Language': targetLocale },
      });

      const targetContinent = targetContinentsResponse?.data?.find(
        c => c.code === currentContinent.code
      );

      console.log('[useLocalizedPath] Found target continent:', targetContinent);

      if (!targetContinent?.slug) {
        // Couldn't find translated slug, return pathname as-is
        console.log('[useLocalizedPath] No target slug found, returning:', pathWithoutLocale);
        return pathWithoutLocale;
      }

      // Get the target locale's beaches route word
      const targetBeachesWord = beachesRoutes[targetLocale] ?? 'beaches';

      // If we have a city slug, we need to translate it too
      if (currentCitySlug) {
        // For now, we'll keep the city slug as-is since we don't have a city translation API yet
        // TODO: Implement city slug translation when API is available
        const result = `/${targetBeachesWord}/${targetContinent.slug}/${currentCitySlug}`;
        console.log('[useLocalizedPath] Returning city path:', result);
        return result;
      }

      // Return the new path with translated beaches word and continent slug
      const result = `/${targetBeachesWord}/${targetContinent.slug}`;
      console.log('[useLocalizedPath] Returning continent path:', result);
      return result;
    } catch (error) {
      console.error('[useLocalizedPath] Error getting localized path:', error);
      return pathWithoutLocale;
    }
  };

  return { getLocalizedPath };
};


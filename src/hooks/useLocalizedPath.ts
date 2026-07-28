'use client';

import { usePathname } from 'next/navigation';
import {
  getContinents,
  getBeachDetails,
  getCountries,
  getStaticPageBySlug,
  getStaticPagesForFooter,
} from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage } from '@/lib/api-client/types.gen';
import { buildBeachUrl } from '@/lib/utils/beach-urls';

// Locale-specific route translations
const beachesRoutes = {
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
} as const;

type BeachesRoutesKey = keyof typeof beachesRoutes;

const getBeachesWord = (locale: string): string => {
  if (locale in beachesRoutes) {
    return beachesRoutes[locale as BeachesRoutesKey];
  }
  return 'beaches';
};

/**
 * Hook to get a localized path for language switching
 * Handles dynamic segments like continent slugs that need to be translated
 */
export const useLocalizedPath = () => {
  const pathname = usePathname(); // This returns the actual URL path with locale-specific segments

  /**
   * Get the localized path for a target locale
   * This handles translating dynamic segments like continent and city slugs
   */
  const getLocalizedPath = async (targetLocale: string): Promise<string> => {
    // Extract current locale from pathname instead of using useLocale()
    // This is more reliable because useLocale() might already reflect the new locale during transition
    const localeRegex = /^\/([a-z]{2})\//;
    const localeMatch = localeRegex.exec(pathname);
    const currentLocale: string = localeMatch ? localeMatch[1]! : 'en';

    console.log('[useLocalizedPath] Starting translation:', { pathname, currentLocale, targetLocale });

    // Remove the locale prefix from pathname
    // Handles both /en and /en/something patterns
    let pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');

    // Normalize double slashes to single slash (e.g., // -> /)
    pathWithoutLocale = pathWithoutLocale.replace(/\/+/g, '/');

    console.log('[useLocalizedPath] Path without locale:', pathWithoutLocale);

    // If we're on the homepage, just return /
    if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
      console.log('[useLocalizedPath] Homepage detected, returning /');
      return '/';
    }

    // Split path into segments
    const segments = pathWithoutLocale.split('/').filter(Boolean);
    console.log('[useLocalizedPath] Path segments:', segments);

    // Static (CMS) pages: '/p/{slug}'. The 'p' prefix is NOT localized, but the
    // slug is. Translate the slug by resolving it to the page's stable code in
    // the current locale, then looking up that code in the target locale's
    // footer list to get the translated slug.
    const firstSegment = segments[0];
    const currentSlug = segments[1];
    if (firstSegment === 'p' && currentSlug) {
      try {
        console.log('[useLocalizedPath] Detected static page route, slug:', currentSlug);

        // Resolve the current slug to the page's stable code (in current locale).
        const { data: currentResponse } = await getStaticPageBySlug({
          path: { slug: currentSlug },
          headers: { 'Accept-Language': currentLocale as AcceptLanguage },
        });
        const pageCode = currentResponse?.data?.code;

        if (!pageCode) {
          console.log('[useLocalizedPath] Could not resolve static page code, returning as-is:', pathWithoutLocale);
          return pathWithoutLocale;
        }

        // Fetch the target locale's footer list and find the same page by code.
        const { data: targetResponse } = await getStaticPagesForFooter({
          headers: { 'Accept-Language': targetLocale as AcceptLanguage },
        });
        const targetPage = targetResponse?.data?.find((p) => p.code === pageCode);

        // The footer list only includes pages flagged is_in_footer; if the page
        // isn't in the footer list, fall back to fetching it directly by slug
        // (the show endpoint accepts any locale's slug with EN fallback).
        let targetSlug = targetPage?.slug;
        if (!targetSlug) {
          const { data: directResponse } = await getStaticPageBySlug({
            path: { slug: currentSlug },
            headers: { 'Accept-Language': targetLocale as AcceptLanguage },
          });
          targetSlug = directResponse?.data?.slug;
        }

        if (!targetSlug) {
          console.log('[useLocalizedPath] No target slug found for static page, returning as-is:', pathWithoutLocale);
          return pathWithoutLocale;
        }

        const result = `/p/${targetSlug}`;
        console.log('[useLocalizedPath] Translated static page path:', result);
        return result;
      } catch (error) {
        console.error('[useLocalizedPath] Error translating static page slug:', error);
        return pathWithoutLocale;
      }
    }

    // Check if this is a beaches route by checking against ALL possible beaches words
    // This handles cases where URL uses a different locale's beaches word (e.g., /beaches/ when locale is 'si')
    const allBeachesWords = Object.values(beachesRoutes);
    const isBeachesRoute = firstSegment && allBeachesWords.includes(firstSegment as typeof allBeachesWords[number]);

    if (!isBeachesRoute) {
      // Not a beaches page, just return the path without locale
      console.log('[useLocalizedPath] Not a beaches page, returning:', pathWithoutLocale);
      return pathWithoutLocale;
    }

    console.log('[useLocalizedPath] Detected beaches route, first segment:', firstSegment);

    // Extract continent slug (always at index 1 for beaches routes)
    const currentContinentSlug = segments[1];
    console.log('[useLocalizedPath] Extracted continent slug:', currentContinentSlug);

    if (!currentContinentSlug) {
      // No continent slug found, just translate the beaches word
      const targetBeachesWord = getBeachesWord(targetLocale);
      const result = `/${targetBeachesWord}`;
      console.log('[useLocalizedPath] No continent slug, returning:', result);
      return result;
    }

    try {
      // Fetch continents for current locale to get the continent code
      const { data: currentContinentsResponse } = await getContinents({
        headers: { 'Accept-Language': currentLocale as AcceptLanguage },
      });

      const currentContinent = currentContinentsResponse?.data?.find(
        c => c.slug?.toLowerCase() === currentContinentSlug.toLowerCase()
      ) ?? null;

      console.log('[useLocalizedPath] Found current continent:', currentContinent);

      if (!currentContinent?.code) {
        // Couldn't find continent, return pathname as-is
        console.log('[useLocalizedPath] No continent code found, returning:', pathWithoutLocale);
        return pathWithoutLocale;
      }

      // Fetch continents for target locale to get the translated slug
      // We need to override the header here because we're fetching for a different locale
      const { data: targetContinentsResponse } = await getContinents({
        headers: { 'Accept-Language': targetLocale as AcceptLanguage },
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
      const targetBeachesWord = getBeachesWord(targetLocale);

      // Check if this is a beach detail page (has more than 3 segments: beaches/continent/country/...)
      // If it has 4+ segments, the last one is likely a beach slug
      const lastSegment = segments[segments.length - 1];
      const isLikelyBeachDetailPage = segments.length >= 4 && lastSegment;

      if (isLikelyBeachDetailPage) {
        console.log('[useLocalizedPath] Detected beach detail page, fetching beach details for:', lastSegment, 'in locale:', targetLocale);

        try {
          // Fetch beach details in target locale to get all translated slugs
          const beachResponse = await getBeachDetails({
            path: { identifier: lastSegment },
            headers: { 'Accept-Language': targetLocale as AcceptLanguage },
          });

          console.log('[useLocalizedPath] Beach API response:', beachResponse);

          const beachDetails = beachResponse.data?.data;

          if (beachDetails) {
            console.log('[useLocalizedPath] Beach details received:', {
              beach_slug: beachDetails.basic_info?.slug,
              country_slug: beachDetails.location?.country?.slug,
              region_slug: beachDetails.location?.region?.slug,
              island_slug: beachDetails.location?.island?.slug,
              city_slug: beachDetails.location?.city?.slug,
            });

            // Use buildBeachUrl to construct the fully translated URL
            const translatedUrl = buildBeachUrl(beachDetails, targetLocale);
            console.log('[useLocalizedPath] Built translated beach URL:', translatedUrl);

            // Remove the locale prefix since TopBar will add it
            const urlWithoutLocale = translatedUrl.replace(/^\/[a-z]{2}\//, '/');
            return urlWithoutLocale;
          } else {
            console.warn('[useLocalizedPath] Beach details response was empty, falling back to simple translation');
          }
        } catch (error) {
          console.error('[useLocalizedPath] Error fetching beach details:', error);
          // Fall through to simple translation
        }
      }

      // For non-beach pages or if beach fetch failed, translate country slug too
      // We need to translate: beaches word, continent slug, and country slug
      // Keep remaining segments (region, island, city) as-is for now

      const countrySlug = segments[2]; // Country is always at index 2
      let translatedCountrySlug = countrySlug;

      if (countrySlug) {
        try {
          // Fetch countries in CURRENT locale to get country code
          const { data: currentCountriesResponse } = await getCountries({
            headers: { 'Accept-Language': currentLocale as AcceptLanguage },
          });
          const currentCountry = currentCountriesResponse?.data?.find(
            (c: { slug?: string; code?: string }) => c.slug?.toLowerCase() === countrySlug.toLowerCase()
          );

          if (!currentCountry) {
            throw new Error('Country not found in current locale');
          }

          if (currentCountry.code) {
            // Fetch countries in target locale to get translated slug
            const { data: targetCountriesResponse } = await getCountries({
              headers: { 'Accept-Language': targetLocale as AcceptLanguage },
            });
            const targetCountry = targetCountriesResponse?.data?.find(
              (c: { slug?: string; code?: string }) => c.code === currentCountry.code
            ) as { slug?: string; code?: string } | undefined;

            if (targetCountry?.slug) {
              translatedCountrySlug = targetCountry.slug;
            }
          }
        } catch (error) {
          console.error('[useLocalizedPath] Error translating country slug:', error);
          // Keep original country slug on error
        }
      }

      // Build translated path: beaches/continent/country/[remaining segments]
      const remainingSegments = segments.slice(3); // Everything after country
      const translatedSegments = [targetBeachesWord, targetContinent.slug, translatedCountrySlug, ...remainingSegments];

      const result = '/' + translatedSegments.join('/');
      console.log('[useLocalizedPath] Returning translated path:', result);
      return result;
    } catch (error) {
      console.error('[useLocalizedPath] Error getting localized path:', error);
      return pathWithoutLocale;
    }
  };

  return { getLocalizedPath };
};


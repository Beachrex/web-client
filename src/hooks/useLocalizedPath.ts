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
import { buildBeachUrl, getBeachesWord } from '@/lib/utils/beach-urls';
import { isBeachesWord, translateFixedPath } from '@/lib/utils/locale-path-words';
import { NOT_A_VIEW_HEADERS } from '@/lib/utils/beach-views';

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


    // Remove the locale prefix from pathname
    // Handles both /en and /en/something patterns
    let pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');

    // Normalize double slashes to single slash (e.g., // -> /)
    pathWithoutLocale = pathWithoutLocale.replace(/\/+/g, '/');


    // If we're on the homepage, just return /
    if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
      return '/';
    }

    // Split path into segments
    const segments = pathWithoutLocale.split('/').filter(Boolean);

    // Static (CMS) pages: '/p/{slug}'. The 'p' prefix is NOT localized, but the
    // slug is. Translate the slug by resolving it to the page's stable code in
    // the current locale, then looking up that code in the target locale's
    // footer list to get the translated slug.
    const firstSegment = segments[0];
    const currentSlug = segments[1];
    if (firstSegment === 'p' && currentSlug) {
      try {

        // Resolve the current slug to the page's stable code (in current locale).
        const { data: currentResponse } = await getStaticPageBySlug({
          path: { slug: currentSlug },
          headers: { 'Accept-Language': currentLocale as AcceptLanguage },
        });
        const pageCode = currentResponse?.data?.code;

        if (!pageCode) {
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
          return pathWithoutLocale;
        }

        const result = `/p/${targetSlug}`;
        return result;
      } catch (error) {
        console.error('[useLocalizedPath] Error translating static page slug:', error);
        return pathWithoutLocale;
      }
    }

    // World beaches page and beach map: the word itself is localized (B9: da/pt/nl/el/sq were missing)
    const fixedPath = translateFixedPath(segments, targetLocale);
    if (fixedPath) {
      return fixedPath;
    }

    // Beaches route in any locale's word (e.g. /beaches/ when the locale is 'si')
    if (!isBeachesWord(firstSegment)) {
      // Not a beaches page, just return the path without locale
      return pathWithoutLocale;
    }


    // Extract continent slug (always at index 1 for beaches routes)
    const currentContinentSlug = segments[1];

    if (!currentContinentSlug) {
      // No continent slug found, just translate the beaches word
      const targetBeachesWord = getBeachesWord(targetLocale);
      const result = `/${targetBeachesWord}`;
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


      if (!currentContinent?.code) {
        // Couldn't find continent, return pathname as-is
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


      if (!targetContinent?.slug) {
        // Couldn't find translated slug, return pathname as-is
        return pathWithoutLocale;
      }

      // Get the target locale's beaches route word
      const targetBeachesWord = getBeachesWord(targetLocale);

      // Check if this is a beach detail page (has more than 3 segments: beaches/continent/country/...)
      // If it has 4+ segments, the last one is likely a beach slug
      const lastSegment = segments[segments.length - 1];
      const isLikelyBeachDetailPage = segments.length >= 4 && lastSegment;

      if (isLikelyBeachDetailPage) {

        try {
          // Fetch beach details in target locale to get all translated slugs
          const beachResponse = await getBeachDetails({
            path: { identifier: lastSegment },
            headers: { 'Accept-Language': targetLocale as AcceptLanguage, ...NOT_A_VIEW_HEADERS },
          });


          const beachDetails = beachResponse.data?.data;

          if (beachDetails) {

            // Use buildBeachUrl to construct the fully translated URL
            const translatedUrl = buildBeachUrl(beachDetails, targetLocale);

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
      return result;
    } catch (error) {
      console.error('[useLocalizedPath] Error getting localized path:', error);
      return pathWithoutLocale;
    }
  };

  return { getLocalizedPath };
};


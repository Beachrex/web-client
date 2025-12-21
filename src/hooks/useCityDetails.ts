'use client';

import { getCityOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Detail page cache settings
 * City details change infrequently, cache moderately
 */
const DETAIL_PAGE_CACHE = {
  staleTime: 30 * 60 * 1000, // 30 minutes - consider data fresh
  gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Hook to fetch city details by slug
 *
 * @param slug        City slug (e.g. "l-escala")
 * @param countryCode Optional ISO country code (e.g. "ES") used as additional filter/guard
 * @param regionCode  Optional region code/slug to make sure the city matches the region
 * @param islandCode  Optional island code/slug if the city is on an island
 * @param enabled     Whether the query should run (default: true)
 *
 * @example
 * const { cityDetails, loading, error } = useCityDetails('l-escala', 'ES', 'comarques-gironines');
 */
export const useCityDetails = (
  slug: string,
  countryCode?: string,
  regionCode?: string,
  islandCode?: string,
  enabled = true,
) => {
  // Build optional query filters only when provided
  const queryFilters: Record<string, string> = {};
  if (countryCode) queryFilters.country_code = countryCode;
  if (regionCode) queryFilters.region_code = regionCode;
  if (islandCode) queryFilters.island_code = islandCode;

  const { data, isLoading, error } = useQuery({
    ...getCityOptions({
      path: {
        // In OpenAPI this is { slug: string }
        slug: String(slug),
      },
      // country_code, region_code, island_code are optional filters in Swagger
      ...(Object.keys(queryFilters).length > 0
        ? {
            query: queryFilters,
          }
        : {}),
    }),
    // Only run the query when slug is present and enabled is true
    enabled: enabled && Boolean(slug),
    ...DETAIL_PAGE_CACHE,
  });

  return {
    // Full city payload from API (details + country + region + navigation ...)
    cityDetails: data?.data,
    loading: isLoading,
    error:
      error instanceof Error
        ? error.message
        : error
        ? 'Failed to fetch city details'
        : null,
  };
};

'use client';

import { getCitiesOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Reference data cache settings
 * Cities rarely change, cache aggressively
 */
const REFERENCE_DATA_CACHE = {
  staleTime: 60 * 60 * 1000, // 1 hour - consider data fresh
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Fetches list of cities for a given country, region, or island.
 *
 * Endpoint:
 * GET /api/v1/cities?country_code=HR&region_code=...&island_code=...
 *
 * @param countryCode ISO code (HR, IT, SI...)
 * @param regionCode Region code (e.g., "istria")
 * @param islandCode Island code (e.g., "krk")
 */

export const useCities = (countryCode?: string, regionCode?: string, islandCode?: string,) => {
  const { data, isLoading, error } = useQuery({
    ...getCitiesOptions({
      query: {
        ...(countryCode ? { country_code: countryCode } : {}),
        ...(regionCode ? { region_code: regionCode } : {}),
        ...(islandCode ? { island_code: islandCode } : {}),
      },
    }),
    ...REFERENCE_DATA_CACHE,
  });

  return {
    cities: data?.data ?? [],
    loading: isLoading,
    error: error ? 'Failed to fetch cities' : null,
  };
};


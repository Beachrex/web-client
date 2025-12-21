// src/hooks/useRegions.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRegionsOptions } from '@/lib/api-client/@tanstack/react-query.gen';

/**
 * Reference data cache settings
 * Regions rarely change, cache aggressively
 */
const REFERENCE_DATA_CACHE = {
  staleTime: 60 * 60 * 1000, // 1 hour - consider data fresh
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Fetches list of regions for a given country.
 *
 * Endpoint:
 * GET /api/v1/regions?country_code=HR
 *
 * @param countryCode ISO code (HR, IT, SI...)
 */
export const useRegions = (countryCode: string) => {
  const { data, isLoading, error } = useQuery({
    ...getRegionsOptions({
      query: { country_code: countryCode },
    }),
    ...REFERENCE_DATA_CACHE,
  });

  return {
    regions: data?.data ?? [],
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch regions'
      : null,
  };
};

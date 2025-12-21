'use client';

import { getIslandsOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Reference data cache settings
 * Islands rarely change, cache aggressively
 */
const REFERENCE_DATA_CACHE = {
  staleTime: 60 * 60 * 1000, // 1 hour - consider data fresh
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Fetches list of islands for a given country or region.
 *
 * Examples:
 *  /api/v1/islands?country_code=HR
 *  /api/v1/islands?region_code=dalmatia-split
 */
export const useIslands = (countryCode?: string, regionCode?: string) => {
  const { data, isLoading, error } = useQuery({
    ...getIslandsOptions({
      query: {
        ...(countryCode ? { country_code: countryCode } : {}),
        ...(regionCode ? { region_code: regionCode } : {}),
      },
    }),
    ...REFERENCE_DATA_CACHE,
  });

  return {
    islands: data?.data ?? [],
    loading: isLoading,
    error: error ? 'Failed to fetch islands' : null,
  };
};

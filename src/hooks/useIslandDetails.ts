'use client';

import { getIslandOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Detail page cache settings
 * Island details change infrequently, cache moderately
 */
const DETAIL_PAGE_CACHE = {
  staleTime: 30 * 60 * 1000, // 30 minutes - consider data fresh
  gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Hook to fetch island details by slug
 *
 * @param slug        Island slug (e.g. "krk")
 * @param countryCode Optional country code filter (e.g. "HR")
 * @param regionCode  Optional region code filter (e.g. "kvarner")
 * @param enabled     Whether the query should run
 *
 * @example
 * const { islandDetails } = useIslandDetails("krk", "HR", "kvarner");
 */
export const useIslandDetails = (
  slug: string,
  countryCode?: string,
  regionCode?: string,
  enabled = true,
) => {
  const { data, isLoading, error } = useQuery({
    ...getIslandOptions({
      path: {
        slug: String(slug), // required
      },
      // Optional filters from Swagger
      ...(countryCode || regionCode
        ? {
            query: {
              ...(countryCode ? { country_code: countryCode } : {}),
              ...(regionCode ? { region_code: regionCode } : {}),
            },
          }
        : {}),
    }),
    enabled: enabled && Boolean(slug),
    ...DETAIL_PAGE_CACHE,
  });

  return {
    islandDetails: data?.data,
    loading: isLoading,
    error:
      error instanceof Error
        ? error.message
        : error
        ? 'Failed to fetch island details'
        : null,
  };
};

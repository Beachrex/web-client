'use client';

import { useQuery } from '@tanstack/react-query';
import { getBeachDetailsOptions } from '@/lib/api-client/@tanstack/react-query.gen';

/**
 * Beach detail page cache settings
 * Beach details can change (reviews, ratings, etc.) but not frequently
 */
const BEACH_DETAIL_CACHE = {
  staleTime: 15 * 60 * 1000, // 15 minutes - consider data fresh
  gcTime: 60 * 60 * 1000, // 1 hour - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Hook to fetch comprehensive beach details by slug or ID
 *
 * @param identifier - Beach slug (e.g., "beach-hangar") or ID (numeric)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Beach details data, loading state, and error
 *
 * @example
 * ```tsx
 * const { beachDetails, loading, error } = useBeachDetails('beach-hangar');
 * ```
 */
export const useBeachDetails = (identifier: string | number, enabled = true) => {
  const { data, isLoading, error } = useQuery({
    ...getBeachDetailsOptions({
      path: {
        identifier: String(identifier),
      },
    }),
    enabled: enabled && !!identifier,
    ...BEACH_DETAIL_CACHE,
  });

  return {
    beachDetails: data?.data,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch beach details') : null,
  };
};


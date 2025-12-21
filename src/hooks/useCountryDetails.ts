// src/hooks/useCountryDetails.ts
'use client';

import { getCountryOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { type CountryDetails } from '@/types/CountryDetails';
import { useQuery } from '@tanstack/react-query';

/**
 * Detail page cache settings
 * Country details change infrequently, cache moderately
 */
const DETAIL_PAGE_CACHE = {
  staleTime: 30 * 60 * 1000, // 30 minutes - consider data fresh
  gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

/**
 * Hook to fetch country details by code
 *
 * Uses /api/v1/countries/{code}
 *
 * @param code - Country code (e.g. "HR", "SI", "IT")
 * @param enabled - Whether the query should run (default: true)
 */
export const useCountryDetails = (code: string | undefined, enabled = true) => {
  const { data, isLoading, error } = useQuery({
    ...getCountryOptions({
      path: {
        codeOrSlug: String(code),
      },
    }),
    enabled: enabled && !!code,
    select: (response): CountryDetails | null => {
      // API returns { success, data, message }, so we extract .data
      return (response?.data ?? null) as CountryDetails;
    },
    ...DETAIL_PAGE_CACHE,
  });

  return {
    countryDetails: data,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch country details'
      : null,
  };
};

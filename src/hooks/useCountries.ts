'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountriesOptions } from '@/lib/api-client/@tanstack/react-query.gen';

/**
 * Reference data cache settings
 * Countries rarely change, so we cache aggressively
 */
const REFERENCE_DATA_CACHE = {
  staleTime: 60 * 60 * 1000, // 1 hour - consider data fresh
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

export const useCountries = (continentCode?: string) => {
  // Fetch countries using TanStack Query
  const { data, isLoading, error } = useQuery({
    ...getCountriesOptions({
      query: continentCode ? { continent: continentCode } : undefined,
    }),
    ...REFERENCE_DATA_CACHE,
  });

  // Return raw API data (includes slug and continent fields)
  const countries = useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  return {
    countries,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch countries') : null,
  };
};

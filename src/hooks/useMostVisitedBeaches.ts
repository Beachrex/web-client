'use client';

import { getMostVisitedBeachesOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Most visited beaches cache settings
 * This data changes more frequently than reference data but still relatively stable
 */
const MOST_VISITED_CACHE = {
  staleTime: 30 * 60 * 1000, // 30 minutes - consider data fresh
  gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

export const useMostVisitedBeaches = (query: {
  country_code?: string;
  continent_code?: string;
  region_code?: string;
  island_code?: string;
  city_code?: string;
  limit?: number;
}) => {

  const { data, isLoading, error } = useQuery({
    ...getMostVisitedBeachesOptions({
      query,
    }),
    ...MOST_VISITED_CACHE,
  });

  return {
    data: data?.data ?? [],
    loading: isLoading,
    error,
  };
};

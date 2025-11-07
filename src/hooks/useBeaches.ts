'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBeachesOptions } from '@/lib/api-client/@tanstack/react-query.gen';

export const useBeaches = (filters?: {
  continent?: string;
  country?: string;
  type?: string;
}) => {
  // Fetch all beaches using TanStack Query
  const { data, isLoading, error } = useQuery(getBeachesOptions());

  // Apply client-side filtering with useMemo for performance
  const beaches = useMemo(() => {
    const allBeaches = data?.data ?? [];
    let filteredBeaches = allBeaches;

    if (filters?.continent) {
      filteredBeaches = filteredBeaches.filter(
        (beach) => beach.continent_code === filters.continent,
      );
    }
    if (filters?.country) {
      filteredBeaches = filteredBeaches.filter(
        (beach) => beach.country_code === filters.country,
      );
    }
    if (filters?.type) {
      filteredBeaches = filteredBeaches.filter(
        (beach) => beach.slug?.includes(filters.type ?? ''),
      );
    }

    return filteredBeaches;
  }, [data?.data, filters?.continent, filters?.country, filters?.type]);

  return {
    beaches,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch beaches') : null,
  };
};

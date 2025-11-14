'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountriesOptions } from '@/lib/api-client/@tanstack/react-query.gen';

export const useCountries = (continentCode?: string) => {
  // Fetch countries using TanStack Query
  const { data, isLoading, error } = useQuery(
    getCountriesOptions({
      query: continentCode ? { continent: continentCode } : undefined,
    })
  );

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

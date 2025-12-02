'use client';

import { getMostVisitedBeachesOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

export const useMostVisitedBeaches = (query: {
  country_code?: string;
  continent_code?: string;
  region_code?: string;
  island_code?: string;
  city_code?: string;
  limit?: number;
}) => {

  const { data, isLoading, error } = useQuery(
    getMostVisitedBeachesOptions({
      query,
    })
  );

  return {
    data: data?.data ?? [],
    loading: isLoading,
    error,
  };
};

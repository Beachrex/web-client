// src/hooks/useRegions.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getRegionsOptions } from '@/lib/api-client/@tanstack/react-query.gen';

/**
 * Fetches list of regions for a given country.
 *
 * Endpoint:
 * GET /api/v1/regions?country_code=HR
 *
 * @param countryCode ISO code (HR, IT, SI...)
 */
export const useRegions = (countryCode: string) => {
  const { data, isLoading, error } = useQuery(
    getRegionsOptions({
      query: { country_code: countryCode },
    }),
  );

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

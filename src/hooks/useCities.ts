'use client';

import { getCitiesOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches list of regions for a given country.
 *
 * Endpoint:
 * GET /api/v1/regions?country_code=HR
 *
 * @param countryCode ISO code (HR, IT, SI...)
 */

export const useCities = (countryCode?: string, regionCode?: string, islandCode?: string,) => {
  const { data, isLoading, error } = useQuery(
    getCitiesOptions({
      query: {
        ...(countryCode ? { country_code: countryCode } : {}),
        ...(regionCode ? { region_code: regionCode } : {}),
        ...(islandCode ? { island_code: islandCode } : {}),
      },
    })
  );

  return {
    cities: data?.data ?? [],
    loading: isLoading,
    error: error ? 'Failed to fetch cities' : null,
  };
};


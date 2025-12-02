'use client';

import { getIslandsOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches list of islands for a given country or region.
 *
 * Examples:
 *  /api/v1/islands?country_code=HR
 *  /api/v1/islands?region_code=dalmatia-split
 */
export const useIslands = (countryCode?: string, regionCode?: string) => {
  const { data, isLoading, error } = useQuery(
    getIslandsOptions({
      query: {
        ...(countryCode ? { country_code: countryCode } : {}),
        ...(regionCode ? { region_code: regionCode } : {}),
      },
    })
  );

  return {
    islands: data?.data ?? [],
    loading: isLoading,
    error: error ? 'Failed to fetch islands' : null,
  };
};

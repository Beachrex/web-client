// src/hooks/useCountryDetails.ts
'use client';

import { getCountryOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

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
        // Country endpoint expects a code in path
        code: String(code),
      },
    }),
    enabled: enabled && !!code,
  });

  return {
    countryDetails: data?.data,
    loading: isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Failed to fetch country details'
      : null,
  };
};

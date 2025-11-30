'use client';

import { getRegionOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch region details by slug
 *
 * @param slug        Region slug (e.g. "istria")
 * @param countryCode Optional ISO country code (e.g. "HR") used as additional filter/guard
 * @param enabled     Whether the query should run (default: true)
 *
 * @example
 * const { regionDetails, loading, error } = useRegionDetails('istria', 'HR');
 */
export const useRegionDetails = (
  slug: string,
  countryCode?: string,
  enabled = true,
) => {
  const { data, isLoading, error } = useQuery({
    ...getRegionOptions({
      path: {
        // In OpenAPI this is { slug: string }
        slug: String(slug),
      },
      // country_code is an optional filter in Swagger
      ...(countryCode
        ? {
            query: {
              country_code: countryCode,
            },
          }
        : {}),
    }),
    // Only run the query when slug is present and enabled is true
    enabled: enabled && Boolean(slug),
  });

  return {
    // Full region payload from API (details + country + badges + navigation ...)
    regionDetails: data?.data,
    loading: isLoading,
    error:
      error instanceof Error
        ? error.message
        : error
        ? 'Failed to fetch region details'
        : null,
  };
};

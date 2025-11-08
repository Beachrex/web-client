'use client';

import { useQuery } from '@tanstack/react-query';
import { getBeachesOptions, getBeachesWithinRadiusOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import type { BeachSchema } from '@/lib/api-client/types.gen';

// Radius search filters
export interface RadiusSearchFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
}

export const useBeaches = (filters?: RadiusSearchFilters) => {
  // Determine if we should use radius search
  const useRadiusSearch =
    filters?.latitude !== undefined &&
    filters?.longitude !== undefined &&
    filters?.radius !== undefined;

  // Fetch all beaches (disabled when using radius search)
  const allBeachesQuery = useQuery({
    ...getBeachesOptions(),
    enabled: !useRadiusSearch,
  });

  // Fetch beaches within radius (disabled when not using radius search)
  const radiusQuery = useQuery({
    ...getBeachesWithinRadiusOptions({
      query: {
        latitude: Number(filters?.latitude ?? 0),
        longitude: Number(filters?.longitude ?? 0),
        radius: Number(filters?.radius ?? 1),
        limit: filters?.limit ? Number(filters.limit) : undefined,
      },
    }),
    enabled: useRadiusSearch,
  });

  // Use the appropriate query result
  const { data, isLoading, error } = useRadiusSearch ? radiusQuery : allBeachesQuery;

  // Extract beaches array from API response
  const beaches = (data as { data?: BeachSchema[] })?.data ?? [];

  return {
    beaches,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch beaches') : null,
  };
};

'use client';

import { useQuery } from '@tanstack/react-query';
import { getBeachesOptions, getBeachesWithinRadiusOptions, getBeachesInBoundingBoxOptions, getBeachesMapBoundsOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import type { BeachSchema, BeachBoundingBoxResponseSchema, BeachMapBoundsResponse } from '@/lib/api-client/types.gen';

type FilterInputValue = string | number | boolean | undefined;

type NormalizedFiltersMap = Record<string, string | number | boolean>;

const normalizeFilterValues = (
  filters?: Record<string, FilterInputValue>
): NormalizedFiltersMap => {
  const normalized: NormalizedFiltersMap = {};

  if (!filters) {
    return normalized;
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      normalized[key] = value;
      return;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }

      const lower = trimmed.toLowerCase();
      if (lower === 'true' || trimmed === '1') {
        normalized[key] = true;
        return;
      }
      if (lower === 'false' || trimmed === '0') {
        normalized[key] = false;
        return;
      }

      const numericValue = Number(trimmed);
      if (!Number.isNaN(numericValue)) {
        normalized[key] = numericValue;
        return;
      }

      normalized[key] = trimmed;
      return;
    }

    normalized[key] = String(value);
  });

  return normalized;
};

// Common filter parameters supported by radius search
export type CommonBeachFilters = Record<string, FilterInputValue>;

// All beaches filter parameters (supports all filters from /api/v1/beaches)
export type AllBeachesFilters = Record<string, FilterInputValue>;

// Radius search filters
export type RadiusSearchFilters = CommonBeachFilters & {
  latitude: FilterInputValue;
  longitude: FilterInputValue;
  radius: FilterInputValue;
  limit?: FilterInputValue;
};

// Bounding box search filters (supports all filters from /api/v1/spatial/beaches/bounding-box)
export type BoundingBoxSearchFilters = CommonBeachFilters & {
  min_lat: FilterInputValue;
  min_lon: FilterInputValue;
  max_lat: FilterInputValue;
  max_lon: FilterInputValue;
};

interface BeachesResult {
  beaches: BeachSchema[];
  loading: boolean;
  error: string | null;
  meta?: Record<string, unknown>;
}

/**
 * Hook to fetch all beaches with optional filters
 */
export function useAllBeaches(filters?: AllBeachesFilters, enabled = true): BeachesResult {
  const normalizedFilters = filters
    ? normalizeFilterValues(filters as Record<string, FilterInputValue>)
    : undefined;

  const { data, isLoading, error } = useQuery({
    ...getBeachesOptions({
      query: normalizedFilters as AllBeachesFilters | undefined,
    }),
    enabled,
  });

  const beaches = data?.data ?? [];
  const metaData = data?.meta ?? {};

  return {
    beaches,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch beaches') : null,
    meta: metaData,
  };
}

/**
 * Hook to fetch beaches within a radius from a center point
 */
export function useBeachesRadius(filters: RadiusSearchFilters, enabled = true): BeachesResult {
  const normalizedFilters = normalizeFilterValues(
    filters as unknown as Record<string, FilterInputValue>
  );

  const { data, isLoading, error } = useQuery({
    ...getBeachesWithinRadiusOptions({
      query: {
        latitude: Number(filters.latitude),
        longitude: Number(filters.longitude),
        radius: Number(filters.radius),
        ...normalizedFilters,
      },
    }),
    enabled,
  });

  const beaches = data?.data ?? [];
  const metaData = data?.meta ?? {};

  return {
    beaches,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch beaches') : null,
    meta: metaData,
  };
}

/**
 * Hook to fetch beaches within a bounding box with optional filters
 * OPTIMIZATION: Added staleTime to reduce redundant API calls
 */
export function useBeachesBoundingBox(filters: BoundingBoxSearchFilters, enabled = true): {
  data: BeachBoundingBoxResponseSchema | undefined;
  loading: boolean;
  error: string | null;
} {
  const normalizedFilters = normalizeFilterValues(
    filters as unknown as Record<string, FilterInputValue>
  );

  const { data, isLoading, error } = useQuery({
    ...getBeachesInBoundingBoxOptions({
      query: {
        min_lat: Number(filters.min_lat),
        min_lon: Number(filters.min_lon),
        max_lat: Number(filters.max_lat),
        max_lon: Number(filters.max_lon),
        ...normalizedFilters,
      },
    }),
    enabled,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  return {
    data,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch beaches') : null,
  };
}

/**
 * Hook to fetch map bounds for all active beaches (used for initial map load)
 * OPTIMIZATION: Map bounds rarely change, cache aggressively
 */
export function useBeachesMapBounds(enabled = true): {
  data: BeachMapBoundsResponse | undefined;
  loading: boolean;
  error: string | null;
} {
  const { data, isLoading, error } = useQuery({
    ...getBeachesMapBoundsOptions(),
    enabled,
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes (bounds rarely change)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  return {
    data,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch map bounds') : null,
  };
}


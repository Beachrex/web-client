/**
 * Query Key Factory for React Query
 *
 * Centralized query key management for better cache control and invalidation.
 * Following TanStack Query best practices for query key structure.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

export const queryKeys = {
  // Geographic hierarchy
  continents: {
    all: ['continents'] as const,
    lists: () => [...queryKeys.continents.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.continents.lists(), filters] as const,
    details: () => [...queryKeys.continents.all, 'detail'] as const,
    detail: (code: string) => [...queryKeys.continents.details(), code] as const,
  },

  countries: {
    all: ['countries'] as const,
    lists: () => [...queryKeys.countries.all, 'list'] as const,
    list: (filters?: { continent?: string }) =>
      [...queryKeys.countries.lists(), filters] as const,
    details: () => [...queryKeys.countries.all, 'detail'] as const,
    detail: (code: string) => [...queryKeys.countries.details(), code] as const,
  },

  regions: {
    all: ['regions'] as const,
    lists: () => [...queryKeys.regions.all, 'list'] as const,
    list: (filters?: { country_code?: string }) =>
      [...queryKeys.regions.lists(), filters] as const,
    details: () => [...queryKeys.regions.all, 'detail'] as const,
    detail: (code: string) => [...queryKeys.regions.details(), code] as const,
  },

  islands: {
    all: ['islands'] as const,
    lists: () => [...queryKeys.islands.all, 'list'] as const,
    list: (filters?: { country_code?: string; region_code?: string }) =>
      [...queryKeys.islands.lists(), filters] as const,
    details: () => [...queryKeys.islands.all, 'detail'] as const,
    detail: (code: string) => [...queryKeys.islands.details(), code] as const,
  },

  cities: {
    all: ['cities'] as const,
    lists: () => [...queryKeys.cities.all, 'list'] as const,
    list: (filters?: { country_code?: string; region_code?: string; island_code?: string }) =>
      [...queryKeys.cities.lists(), filters] as const,
    details: () => [...queryKeys.cities.all, 'detail'] as const,
    detail: (code: string) => [...queryKeys.cities.details(), code] as const,
  },

  beaches: {
    all: ['beaches'] as const,
    lists: () => [...queryKeys.beaches.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.beaches.lists(), filters] as const,
    details: () => [...queryKeys.beaches.all, 'detail'] as const,
    detail: (identifier: string | number) =>
      [...queryKeys.beaches.details(), identifier] as const,
    mostVisited: (filters?: {
      country_code?: string;
      continent_code?: string;
      region_code?: string;
      island_code?: string;
      city_code?: string;
      limit?: number;
    }) => [...queryKeys.beaches.all, 'most-visited', filters] as const,
    withinRadius: (filters: {
      latitude: number;
      longitude: number;
      radius: number;
    }) => [...queryKeys.beaches.all, 'within-radius', filters] as const,
    boundingBox: (filters: {
      min_latitude: number;
      max_latitude: number;
      min_longitude: number;
      max_longitude: number;
    }) => [...queryKeys.beaches.all, 'bounding-box', filters] as const,
    filters: (filters?: Record<string, unknown>) =>
      [...queryKeys.beaches.all, 'filters', filters] as const,
  },

  weather: {
    all: ['weather'] as const,
    beach: (identifier: string | number, locale: string) =>
      [...queryKeys.weather.all, 'beach', identifier, locale] as const,
    city: (code: string, locale: string) =>
      [...queryKeys.weather.all, 'city', code, locale] as const,
    region: (code: string, locale: string) =>
      [...queryKeys.weather.all, 'region', code, locale] as const,
    island: (code: string, locale: string) =>
      [...queryKeys.weather.all, 'island', code, locale] as const,
    country: (code: string, locale: string) =>
      [...queryKeys.weather.all, 'country', code, locale] as const,
  },

  search: {
    all: ['search'] as const,
    global: (query: string, limit?: number) =>
      [...queryKeys.search.all, 'global', query, limit] as const,
  },
} as const;

/**
 * Helper function to invalidate all queries for a specific entity type
 *
 * @example
 * // Invalidate all country queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
 *
 * // Invalidate specific country detail
 * queryClient.invalidateQueries({ queryKey: queryKeys.countries.detail('hr') });
 *
 * // Invalidate all beach lists (but not details)
 * queryClient.invalidateQueries({ queryKey: queryKeys.beaches.lists() });
 */


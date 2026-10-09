/**
 * Prefetching utilities for React Query
 *
 * Provides helper functions to prefetch data on hover/interaction
 * to improve perceived performance and reduce loading states.
 */

import type { QueryClient } from '@tanstack/react-query';
import {
  getCountryOptions,
  getRegionOptions,
  getIslandOptions,
  getCityOptions,
  getBeachDetailsOptions,
  getMostVisitedBeachesOptions,
} from '@/lib/api-client/@tanstack/react-query.gen';
import { NOT_A_VIEW_HEADERS } from '@/lib/utils/beach-views';

/**
 * Cache settings for prefetched data
 * Shorter staleTime since we're prefetching speculatively
 */
const PREFETCH_CACHE = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;

/**
 * Prefetch country details when hovering over a country card
 */
export const prefetchCountryDetails = async (
  queryClient: QueryClient,
  countryCode: string
) => {
  await queryClient.prefetchQuery({
    ...getCountryOptions({
      path: { codeOrSlug: countryCode },
    }),
    ...PREFETCH_CACHE,
  });
};

/**
 * Prefetch region details when hovering over a region card
 */
export const prefetchRegionDetails = async (
  queryClient: QueryClient,
  regionSlug: string
) => {
  await queryClient.prefetchQuery({
    ...getRegionOptions({
      path: { slug: regionSlug },
    }),
    ...PREFETCH_CACHE,
  });
};

/**
 * Prefetch island details when hovering over an island card
 */
export const prefetchIslandDetails = async (
  queryClient: QueryClient,
  islandSlug: string
) => {
  await queryClient.prefetchQuery({
    ...getIslandOptions({
      path: { slug: islandSlug },
    }),
    ...PREFETCH_CACHE,
  });
};

/**
 * Prefetch city details when hovering over a city card
 */
export const prefetchCityDetails = async (
  queryClient: QueryClient,
  citySlug: string
) => {
  await queryClient.prefetchQuery({
    ...getCityOptions({
      path: { slug: citySlug },
    }),
    ...PREFETCH_CACHE,
  });
};

/**
 * Prefetch beach details when hovering over a beach card
 */
export const prefetchBeachDetails = async (
  queryClient: QueryClient,
  beachIdentifier: string | number
) => {
  await queryClient.prefetchQuery({
    ...getBeachDetailsOptions({
      path: { identifier: beachIdentifier },
      headers: NOT_A_VIEW_HEADERS, // a hover is not a visit
    }),
    ...PREFETCH_CACHE,
  });
};

/**
 * Prefetch most visited beaches for a country
 * Useful when hovering over country cards
 */
export const prefetchMostVisitedBeaches = async (
  queryClient: QueryClient,
  filters: {
    country_code?: string;
    continent_code?: string;
    region_code?: string;
    island_code?: string;
    city_code?: string;
    limit?: number;
  }
) => {
  await queryClient.prefetchQuery({
    ...getMostVisitedBeachesOptions({
      query: filters,
    }),
    ...PREFETCH_CACHE,
  });
};

/**
 * Debounced prefetch helper to avoid excessive prefetching
 * Only prefetches if user hovers for at least 200ms
 */
let prefetchTimeout: NodeJS.Timeout | null = null;

export const debouncedPrefetch = (
  prefetchFn: () => Promise<void>,
  delay = 200
) => {
  if (prefetchTimeout) {
    clearTimeout(prefetchTimeout);
  }

  prefetchTimeout = setTimeout(() => {
    void prefetchFn();
  }, delay);
};

/**
 * Cancel pending prefetch
 */
export const cancelPrefetch = () => {
  if (prefetchTimeout) {
    clearTimeout(prefetchTimeout);
    prefetchTimeout = null;
  }
};

/**
 * Prefetch multiple queries in parallel
 * Useful for prefetching related data together
 */
export const prefetchMultiple = async (
  queryClient: QueryClient,
  prefetchFns: (() => Promise<void>)[]
) => {
  await Promise.all(prefetchFns.map(fn => fn()));
};


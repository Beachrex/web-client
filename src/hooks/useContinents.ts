'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getContinentsOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { continentCodeToKey } from '@/lib/constants/mappings';
import { getContinentIcon } from '@/lib/utils/icons';
import type { ContinentWithUI } from '@/types/domain';

/**
 * Reference data cache settings
 * Continents are static data, cache very aggressively
 */
const REFERENCE_DATA_CACHE = {
  staleTime: 60 * 60 * 1000, // 1 hour - consider data fresh
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache
  refetchOnMount: false, // Don't refetch on component mount
  refetchOnWindowFocus: false, // Don't refetch on window focus
} as const;

export const useContinents = () => {
  // Fetch continents using TanStack Query
  const { data, isLoading, error } = useQuery({
    ...getContinentsOptions(),
    ...REFERENCE_DATA_CACHE,
  });

  // Transform API data to UI format
  const continents = useMemo(() => {
    const apiContinents = data?.data ?? [];

    // Fallback to static data if API fails
    if (error) {
      const fallbackContinents: ContinentWithUI[] = [
        { key: 'europe', code: 'EU', name: 'Europe', slug: 'europe', icon: '/images/continents/evropa.png', beaches_count: 0 },
        { key: 'africa', code: 'AF', name: 'Africa', slug: 'africa', icon: '/images/continents/africa.png', beaches_count: 0 },
        { key: 'asia', code: 'AS', name: 'Asia', slug: 'asia', icon: '/images/continents/asia.png', beaches_count: 0 },
        { key: 'northAmerica', code: 'NA', name: 'North America', slug: 'north-america', icon: '/images/continents/north-america.png', beaches_count: 0 },
        { key: 'southAmerica', code: 'SA', name: 'South America', slug: 'south-america', icon: '/images/continents/south-america.png', beaches_count: 0 },
        { key: 'australia', code: 'OC', name: 'Australia', slug: 'oceania', icon: '/images/continents/australia.png', beaches_count: 0 },
      ];
      return fallbackContinents;
    }

    return apiContinents.map((continent) => {
      if (!continent.code) return null;
      const key = continentCodeToKey[continent.code ?? ''] ?? continent.code.toLowerCase();
      return {
        key,
        code: continent.code ?? '',
        name: continent.name ?? '',
        slug: continent.slug ?? '', // Use slug from API (localized)
        icon: getContinentIcon(key),
        beaches_count: continent.beaches_count ?? 0,
      };
    }).filter((continent): continent is ContinentWithUI => continent !== null);
  }, [data?.data, error]);

  return {
    continents,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch continents') : null,
  };
};

/**
 * Hook to get a specific continent by slug
 * Useful for continent detail pages
 */
export const useContinentBySlug = (slug: string) => {
  const { continents, loading, error } = useContinents();

  const continent = useMemo(() => {
    return continents.find(c => c.slug?.toLowerCase() === slug.toLowerCase());
  }, [continents, slug]);

  return {
    continent,
    continents,
    loading,
    error,
  };
};

/**
 * Hook to get a specific continent by code
 * Useful when you have a continent code
 */
export const useContinentByCode = (code: string) => {
  const { continents, loading, error } = useContinents();

  const continent = useMemo(() => {
    return continents.find(c => c.code === code);
  }, [continents, code]);

  return {
    continent,
    continents,
    loading,
    error,
  };
};

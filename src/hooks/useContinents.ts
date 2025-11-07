'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getContinentsOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { continentCodeToKey } from '@/lib/constants/mappings';
import { getContinentIcon } from '@/lib/utils/icons';
import type { ContinentWithUI } from '@/types/domain';

export const useContinents = () => {
  // Fetch continents using TanStack Query
  const { data, isLoading, error } = useQuery(getContinentsOptions());

  // Transform API data to UI format
  const continents = useMemo(() => {
    const apiContinents = data?.data ?? [];

    // Fallback to static data if API fails
    if (error) {
      const fallbackContinents: ContinentWithUI[] = [
        { key: 'europe', code: 'EU', name: 'Europe', icon: '/images/continents/evropa.png', beaches_count: 0 },
        { key: 'africa', code: 'AF', name: 'Africa', icon: '/images/continents/africa.png', beaches_count: 0 },
        { key: 'asia', code: 'AS', name: 'Asia', icon: '/images/continents/asia.png', beaches_count: 0 },
        { key: 'northAmerica', code: 'NA', name: 'North America', icon: '/images/continents/north-america.png', beaches_count: 0 },
        { key: 'southAmerica', code: 'SA', name: 'South America', icon: '/images/continents/south-america.png', beaches_count: 0 },
        { key: 'australia', code: 'OC', name: 'Australia', icon: '/images/continents/australia.png', beaches_count: 0 },
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

'use client';

import { useEffect, useState, useMemo } from 'react';
import { getContinents } from '@/lib/api-client/sdk.gen';
import type { GetContinentsResponse } from '@/lib/api-client/types.gen';
import { continentCodeToKey } from '@/lib/constants/mappings';
import { getContinentIcon } from '@/lib/utils/icons';
import type { ContinentWithUI } from '@/types/domain';

export const useContinents = () => {
  const [data, setData] = useState<GetContinentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContinents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getContinents({
          throwOnError: true,
        });

        if (response.data) {
          setData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch continents');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchContinents();
  }, []);

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
  }, [data, error]);

  return {
    continents,
    loading: isLoading,
    error,
  };
};

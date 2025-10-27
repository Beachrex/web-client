'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { initOpenAPIClient } from '@/lib/api-client/core/init';
import { ContinentsService } from '@/lib/api-client/services/ContinentsService';
import { continentCodeToKey } from '@/lib/constants/mappings';
import { getContinentIcon } from '@/lib/utils/icons';
import type { ContinentWithUI } from '@/types/domain';

export const useContinents = () => {
  const [continents, setContinents] = useState<ContinentWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    // Initialize OpenAPI client with current locale
    initOpenAPIClient(locale);

    const fetchContinents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the auto-generated ContinentsService
        const response = await ContinentsService.getContinents();
        const apiContinents = response.data ?? [];

        // Transform API data to UI format
        const transformedContinents: ContinentWithUI[] = apiContinents.map((continent) => {
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

        setContinents(transformedContinents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch continents';
        setError(errorMessage);
        console.error('Error fetching continents:', err);

        // Fallback to static data if API fails
        const fallbackContinents: ContinentWithUI[] = [
          { key: 'europe', code: 'EU', name: 'Europe', icon: '/images/continents/evropa.png', beaches_count: 0 },
          { key: 'africa', code: 'AF', name: 'Africa', icon: '/images/continents/africa.png', beaches_count: 0 },
          { key: 'asia', code: 'AS', name: 'Asia', icon: '/images/continents/asia.png', beaches_count: 0 },
          { key: 'northAmerica', code: 'NA', name: 'North America', icon: '/images/continents/north-america.png', beaches_count: 0 },
          { key: 'southAmerica', code: 'SA', name: 'South America', icon: '/images/continents/south-america.png', beaches_count: 0 },
          { key: 'australia', code: 'OC', name: 'Australia', icon: '/images/continents/australia.png', beaches_count: 0 },
        ];
        setContinents(fallbackContinents);
      } finally {
        setLoading(false);
      }
    };

    void fetchContinents();
  }, [locale]);

  return { continents, loading, error };
};

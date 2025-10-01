'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { continentService, continentCodeToKey, getContinentIcon } from '@/app/services/continentService';
import { type Continent } from '@/app/types/api';

export interface ContinentWithUI {
  key: string;
  code: string;
  name: string;
  icon: string;
  beaches_count: number;
}

export const useContinents = () => {
  const [continents, setContinents] = useState<ContinentWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    const fetchContinents = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiContinents = await continentService.getContinents(locale);

        // Transform API data to UI format
        const transformedContinents: ContinentWithUI[] = apiContinents.map((continent: Continent) => {
          const key = continentCodeToKey[continent.code] ?? continent.code.toLowerCase();
          return {
            key,
            code: continent.code,
            name: continent.name,
            icon: getContinentIcon(key),
            beaches_count: continent.beaches_count,
          };
        });

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

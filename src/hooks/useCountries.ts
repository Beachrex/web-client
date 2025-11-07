'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCountries } from '@/lib/api-client/sdk.gen';
import type { GetCountriesResponse } from '@/lib/api-client/types.gen';
import { transformCountryToUI } from '@/lib/utils/transformers';

export type { CountryWithUI } from '@/types/domain';

export const useCountries = (continentCode?: string) => {
  const [data, setData] = useState<GetCountriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getCountries({
          query: continentCode ? { continent: continentCode } : undefined,
          throwOnError: true,
        });

        if (response.data) {
          setData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCountries();
  }, [continentCode]);

  // Transform API data to UI format using utility function
  const countries = useMemo(() => {
    const apiCountries = data?.data ?? [];
    return apiCountries.map(transformCountryToUI);
  }, [data]);

  return {
    countries,
    loading: isLoading,
    error,
  };
};

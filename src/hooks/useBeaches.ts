'use client';

import { useEffect, useState } from 'react';
import { getBeaches } from '@/lib/api-client/sdk.gen';
import type { BeachSchema } from '@/lib/api-client/types.gen';

export const useBeaches = (filters?: {
  continent?: string;
  country?: string;
  type?: string;
}) => {
  const [allBeaches, setAllBeaches] = useState<BeachSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeaches = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getBeaches({
          throwOnError: true,
        });

        if (response.data) {
          setAllBeaches(response.data.data ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch beaches');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBeaches();
  }, []);

  // Apply client-side filtering
  let beaches = allBeaches;

  if (filters?.continent) {
    beaches = allBeaches.filter(
      (beach) => beach.continent_code === filters.continent,
    );
  }
  if (filters?.country) {
    beaches = beaches.filter(
      (beach) => beach.country_code === filters.country,
    );
  }

  if (filters?.type) {
    beaches = beaches.filter(
      (beach) => beach.slug?.includes(filters.type ?? ''),
    );
  }

  return {
    beaches,
    loading: isLoading,
    error,
  };
};

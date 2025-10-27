'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { initOpenAPIClient } from '@/lib/api-client/core/init';
import { BeachesService } from '@/lib/api-client/services/BeachesService';
import type { BeachSchema } from '@/lib/api-client/models/BeachSchema';

export const useBeaches = (filters?: {
  continent?: string;
  country?: string;
  type?: string;
}) => {
  const [beaches, setBeaches] = useState<BeachSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    // Initialize OpenAPI client with current locale
    initOpenAPIClient(locale);

    const fetchBeaches = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all beaches from API
        const response = await BeachesService.getBeaches();
        const apiBeaches = response ?? [];

        console.log('🏖️ [useBeaches] Total beaches:', apiBeaches.length);

        // Apply client-side filtering if needed
        let filteredBeaches = apiBeaches;

        if (filters?.continent) {
          filteredBeaches = apiBeaches.filter(
            (beach: BeachSchema) => beach.status === filters.continent,
          );
        }

        setBeaches(filteredBeaches);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch beaches';
        setError(errorMessage);
        console.error('Error fetching beaches:', err);
        setBeaches([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchBeaches();
  }, [locale, filters?.continent, filters?.country, filters?.type]);

  return { beaches, loading, error };
};


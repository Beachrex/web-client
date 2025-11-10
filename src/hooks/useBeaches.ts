'use client';

import { initOpenAPIClient } from '@/lib/api-client/core/init';
import type { BeachSchema } from '@/lib/api-client/models/BeachSchema';
import { BeachesService } from '@/lib/api-client/services/BeachesService';
import { type BeachUI, transformBeachToUI } from '@/lib/utils/transformers';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

/**
 * Custom hook for fetching and transforming beaches data
 */
export const useBeaches = (filters?: {
  continent?: string;
  country?: string;
  type?: string;
}) => {
  const [beaches, setBeaches] = useState<BeachUI[]>([]);
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

        // Fetch all beaches from API (pass locale as Accept-Language)
        // Ensure locale matches the API's allowed locales; default to 'en' if unknown.
        const apiLocale = (
          locale && ['en', 'si', 'hr', 'de', 'it', 'fr'].includes(locale)
            ? (locale as 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr')
            : 'en'
        ) as 'en' | 'si' | 'hr' | 'de' | 'it' | 'fr' | undefined;
        const response = await BeachesService.getBeaches(apiLocale);
        const apiBeaches: BeachSchema[] = response.data ?? [];

        // Transform to UI-ready format
        let transformed = apiBeaches.map(transformBeachToUI);


        // Optional client-side filtering
        if (filters?.continent) {
          transformed = transformed.filter(
            (b) => b.continentCode === filters.continent,
          );
        }
        if (filters?.country) {
          transformed = transformed.filter(
            (b) => b.countryCode === filters.country,
          );
        }
        // if (filters?.type) { ... } // add when API supports "type"

        setBeaches(transformed);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch beaches';
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

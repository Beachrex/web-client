'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { initOpenAPIClient } from '@/lib/api-client/core/init';
import { CountriesService } from '@/lib/api-client/services/CountriesService';
import { transformCountryToUI } from '@/lib/utils/transformers';
import type { CountryWithUI } from '@/types/domain';

// Re-export for backwards compatibility
export type { CountryWithUI } from '@/types/domain';

export const useCountries = (continentCode?: string) => {
  const [countries, setCountries] = useState<CountryWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    // Initialize OpenAPI client with current locale
    initOpenAPIClient(locale);

    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await CountriesService.getCountries(continentCode);
        const apiCountries = response.data ?? [];

        // Transform API data to UI format using utility function
        const transformedCountries = apiCountries.map(transformCountryToUI);

        setCountries(transformedCountries);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch countries';
        setError(errorMessage);
        console.error('Error fetching countries:', err);

        // No fallback data - just keep empty array
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchCountries();
  }, [locale, continentCode]);

  return { countries, loading, error };
};

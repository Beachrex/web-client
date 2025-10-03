'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { countryService, countryCodeToKey } from '@/app/services/countryService';
import type { Country } from '@/app/types/api';

export interface CountryWithUI {
  nameKey: string;
  code: string;
  name: string;
  full_name: string;
  image: string;
  beachCount: number;
  continent_code: string;
  // Placeholder data that API doesn't provide yet
  accomodationCount: number;
  priceKey: string;
}

export const useCountries = (continentCode?: string) => {
  const [countries, setCountries] = useState<CountryWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        let apiCountries: Country[];
        if (continentCode) {
          apiCountries = await countryService.getCountriesByContinent(continentCode, locale);
        } else {
          apiCountries = await countryService.getCountries(locale);
        }

        // Transform API data to UI format
        const transformedCountries: CountryWithUI[] = apiCountries.map((country: Country) => {
          const nameKey = countryCodeToKey[country.code] ?? country.code.toLowerCase();
          return {
            nameKey,
            code: country.code,
            name: country.name,
            full_name: country.full_name,
            image: '/images/topdestination/spain.jpg', // Default image since API doesn't provide images yet
            beachCount: country.beaches_count,
            continent_code: country.continent_code,
            // Placeholder data - will be replaced with real API data later
            accomodationCount: 5,
            priceKey: 'priceFrom',
          };
        });

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

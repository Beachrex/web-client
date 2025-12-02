// src/hooks/useWeather.ts
import {
  getBeachWeather,
  getCityWeather,
  getIslandWeather,
  getRegionWeather,
} from '@/lib/api-client';
import type {
  BeachWeatherResponse,
  GetBeachWeatherData,
  GetCityWeatherData,
  GetCityWeatherResponse,
  GetIslandWeatherData,
  GetIslandWeatherResponse,
  GetRegionWeatherData,
  GetRegionWeatherResponse,
} from '@/lib/api-client/types.gen';
import { useQuery } from '@tanstack/react-query';

const WEATHER_QUERY_DEFAULTS = {
  staleTime: 60 * 60 * 1000,
  gcTime: 2 * 60 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 2,
} as const;

// BEACH
type BeachLocale = NonNullable<GetBeachWeatherData['headers']>['Accept-Language'];

export function useBeachWeather({ identifier, locale, enabled = true }: {
  identifier: string | number;
  locale?: string;
  enabled?: boolean;
}) {
  return useQuery<BeachWeatherResponse>({
    queryKey: ['beach-weather', identifier, locale],
    queryFn: async () => {
      const response = await getBeachWeather({
        path: { identifier: String(identifier) },
        headers: locale ? { 'Accept-Language': locale as BeachLocale } : undefined,
      });

      if (!response.data) {
        throw new Error('No weather data received');
      }

      return response.data;
    },
    enabled: enabled && !!identifier,
    ...WEATHER_QUERY_DEFAULTS,
  });
}

// CITY
type CityLocale = NonNullable<GetCityWeatherData['headers']>['Accept-Language'];

export function useCityWeather({ slug, countryCode, locale, enabled = true }: {
  slug: string;
  countryCode: string;
  locale?: string;
  enabled?: boolean;
}) {
  return useQuery<GetCityWeatherResponse>({
    queryKey: ['city-weather', slug, countryCode, locale],
    queryFn: async () => {
      const response = await getCityWeather({
        path: { slug },
        query: { country_code: countryCode },
        headers: locale ? { 'Accept-Language': locale as CityLocale } : undefined,
      });

      if (!response.data) {
        throw new Error('No city weather data received');
      }

      return response.data;
    },
    enabled: enabled && !!slug && !!countryCode,
    ...WEATHER_QUERY_DEFAULTS,
  });
}

// REGION
type RegionLocale = NonNullable<GetRegionWeatherData['headers']>['Accept-Language'];

export function useRegionWeather({
  slug,
  countryCode,
  locale,
  enabled = true,
}: {
  slug: string;
  countryCode: string;
  locale?: string;
  enabled?: boolean;
}) {
  return useQuery<GetRegionWeatherResponse>({
    queryKey: ['region-weather', slug, countryCode, locale],
    queryFn: async () => {
      const response = await getRegionWeather({
        path: { slug },
        query: { country_code: countryCode },
        headers: locale
          ? { 'Accept-Language': locale as RegionLocale }
          : undefined,
      });

      if (!response.data) {
        throw new Error('No region weather data received');
      }

      return response.data;
    },
    enabled: enabled && !!slug && !!countryCode,
    ...WEATHER_QUERY_DEFAULTS,
  });
}

// ISLAND
type IslandLocale = NonNullable<GetIslandWeatherData['headers']>['Accept-Language'];

export function useIslandWeather({ slug, locale, enabled = true }: {
  slug: string;
  locale?: string;
  enabled?: boolean;
}) {
  return useQuery<GetIslandWeatherResponse>({
    queryKey: ['island-weather', slug, locale],
    queryFn: async () => {
      const response = await getIslandWeather({
        path: { slug },
        headers: locale ? { 'Accept-Language': locale as IslandLocale } : undefined,
      });

      if (!response.data) {
        throw new Error('No island weather data received');
      }

      return response.data;
    },
    enabled: enabled && !!slug,
    ...WEATHER_QUERY_DEFAULTS,
  });
}

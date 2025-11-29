import { getBeachWeather } from '@/lib/api-client';
import type { BeachWeatherResponse, GetBeachWeatherData } from '@/lib/api-client/types.gen';
import { useQuery } from '@tanstack/react-query';

type AcceptedLocale = NonNullable<GetBeachWeatherData['headers']>['Accept-Language'];

interface UseBeachWeatherOptions {
  identifier: string | number;
  locale?: string;
  enabled?: boolean;
}

/**
 * Custom hook to fetch beach weather data from the API
 *
 * @param identifier - Beach ID (number) or slug (string)
 * @param locale - Language code (e.g., 'en', 'hr', 'es')
 * @param enabled - Whether to enable the query (default: true)
 * @returns React Query result with weather data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBeachWeather({
 *   identifier: 'beach-livade-i-obatnice',
 *   locale: 'en'
 * });
 *
 * if (data?.success) {
 *   const weather = data.data.weather;
 *   const seaTemp = data.data.sea_temperature;
 * }
 * ```
 */
export function useBeachWeather({
  identifier,
  locale,
  enabled = true,
}: UseBeachWeatherOptions) {
  return useQuery<BeachWeatherResponse>({
    queryKey: ['beach-weather', identifier, locale],
    queryFn: async () => {
      const response = await getBeachWeather({
        path: {
          identifier: String(identifier),
        },
        headers: locale
          ? {
              'Accept-Language': locale as AcceptedLocale,
            }
          : undefined,
      });

      if (!response.data) {
        throw new Error('No weather data received');
      }

      return response.data;
    },
    enabled: enabled && !!identifier,
    staleTime: 60 * 60 * 1000, // 1 hour (matches backend cache)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours (keep in cache longer than stale time)
    refetchOnWindowFocus: false, // Don't refetch on window focus (weather doesn't change that fast)
    refetchOnMount: false, // Don't refetch on mount if data is still fresh
    retry: 2, // Retry failed requests twice
  });
}


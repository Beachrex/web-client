'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api-client/client.gen';
import { useEffect, useState } from 'react';

interface ApiClientProviderProps {
  children: React.ReactNode;
  locale: string;
}

export function ApiClientProvider({ children, locale }: ApiClientProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - map data doesn't change frequently
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
            refetchOnWindowFocus: false,
            retry: 1, // Only retry once on failure to avoid request pile-up
            retryDelay: 1000, // Wait 1 second before retrying
          },
        },
      })
  );

  useEffect(() => {
    client.setConfig({
      headers: {
        'Accept-Language': locale,
      },
    });

    void queryClient.resetQueries();

  }, [locale, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


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
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
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


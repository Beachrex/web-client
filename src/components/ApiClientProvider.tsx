'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api-client/client.gen';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

interface ApiClientProviderProps {
  children: React.ReactNode;
}

export function ApiClientProvider({ children }: ApiClientProviderProps) {
  const locale = useLocale();

  // Create a QueryClient instance - use useState to ensure it's only created once
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
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
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


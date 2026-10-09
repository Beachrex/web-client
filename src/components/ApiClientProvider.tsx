'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api-client/client.gen';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { env } from '@/env';

interface ApiClientProviderProps {
  children: React.ReactNode;
  locale: string;
}

/** Browser only: on the server the shared client must not get one visitor's headers. */
function configureClient(locale: string, token: string | null) {
  if (typeof window === 'undefined') return;
  const headers: Record<string, string> = { 'Accept-Language': locale };
  // Inject Bearer token if user is authenticated
  if (token) headers.Authorization = `Bearer ${token}`;
  client.setConfig({ baseUrl: env.NEXT_PUBLIC_API_ENDPOINT, headers });
}

export function ApiClientProvider({ children, locale }: ApiClientProviderProps) {
  const { token } = useAuth();

  // Configure before the first render of the children, so their first queries already carry the locale.
  // (Configuring in an effect ran after the children's effects: every query went out once without
  // Accept-Language and again after a reset.)
  const [queryClient] = useState(() => {
    configureClient(locale, token);
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes - map data doesn't change frequently
          gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
          refetchOnWindowFocus: false,
          retry: 1, // Only retry once on failure to avoid request pile-up
          retryDelay: 1000, // Wait 1 second before retrying
        },
      },
    });
  });

  const applied = useRef({ locale, token });
  if (applied.current.locale !== locale || applied.current.token !== token) {
    configureClient(locale, token);
  }

  useEffect(() => {
    const previous = applied.current;
    applied.current = { locale, token };
    // Public data is the same with or without a token; only a language change needs fresh data.
    if (previous.locale !== locale) void queryClient.resetQueries();
  }, [locale, token, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

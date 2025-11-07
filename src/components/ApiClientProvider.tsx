'use client';

import { client } from '@/lib/api-client/client.gen';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

interface ApiClientProviderProps {
  children: React.ReactNode;
}

export function ApiClientProvider({ children }: ApiClientProviderProps) {
  const locale = useLocale();

  useEffect(() => {
    client.setConfig({
      headers: {
        'Accept-Language': locale,
      },
    });
  }, [locale]);

  return <>{children}</>;
}


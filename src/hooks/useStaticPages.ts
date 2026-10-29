'use client';

import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage, StaticPageFooter } from '@/lib/api-client/types.gen';

/**
 * CMS pages flagged for the footer, localized by Accept-Language (EN fallback on the backend).
 * Shared by the footer and the menu, so both use one cached request. Returns [] on error.
 */
export function useFooterStaticPages(): StaticPageFooter[] {
  const locale = useLocale();
  const { data } = useQuery<StaticPageFooter[]>({
    queryKey: ['static-pages', 'footer', locale],
    queryFn: async () => {
      try {
        const { data } = await getStaticPagesForFooter({
          headers: { 'Accept-Language': locale as AcceptLanguage },
        });
        return data?.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1h — matches backend cache + ISR
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });
  return data ?? [];
}

/** Locale-prefixed URL of a CMS page by its stable `code` (e.g. `about-us`), or null if it is not published. */
export function staticPageUrl(pages: StaticPageFooter[], code: string, locale: string): string | null {
  const page = pages.find((p) => p.code === code);
  return page?.slug ? `/${locale}/p/${page.slug}` : null;
}

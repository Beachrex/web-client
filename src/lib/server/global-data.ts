/**
 * Global data every page shows (continents and countries in the menu, CMS pages and most-visited beaches in the
 * footer), fetched once per language on the server and handed to React Query in the browser.
 *
 * Before (prod incident 2026-10-30, backend ADR "API performance"): every page load made the BROWSER fetch these
 * lists again (plus the 125 KB filter list for the menu), i.e. ~6 API calls per page view from every visitor and
 * every bot. Now the page HTML carries them (they are part of the ISR-cached page) and the browser makes none.
 *
 * The query keys must equal the ones the client hooks build (`useContinents`, `useCountries`,
 * `useFooterStaticPages`, `FooterMostViewedColumn`); `global-data.unit.spec.ts` checks that.
 */
import { dehydrate, QueryClient, type DehydratedState } from '@tanstack/react-query';
import { getContinentsQueryKey, getCountriesQueryKey } from '@/lib/api-client/@tanstack/react-query.gen';
import { env } from '@/env';
import { serverApiBaseUrl } from './api-base';

/** Seconds a fetched list may be reused by the server (Next data cache), like the backend micro-cache order. */
export const GLOBAL_DATA_REVALIDATE = 300;
export const GLOBAL_DATA_TAG = 'api-global';

/** React Query keys of the global lists, exactly as the browser builds them (public base URL, no query). */
export function globalQueryKeys(locale: string) {
  const publicBase = { baseUrl: env.NEXT_PUBLIC_API_ENDPOINT };
  return {
    continents: getContinentsQueryKey(publicBase),
    countries: getCountriesQueryKey(publicBase),
    footerPages: ['static-pages', 'footer', locale] as const,
    footerBeaches: ['beaches', 'footer', locale] as const,
  };
}

async function getJson(path: string, locale: string): Promise<{ data?: unknown } | null> {
  try {
    const res = await fetch(`${serverApiBaseUrl()}/api/v1/${path}`, {
      headers: { Accept: 'application/json', 'Accept-Language': locale },
      next: { revalidate: GLOBAL_DATA_REVALIDATE, tags: [GLOBAL_DATA_TAG] },
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return json && typeof json === 'object' ? (json as { data?: unknown }) : null;
  } catch {
    // The browser fetches whatever is missing, as before.
    return null;
  }
}

export async function fetchGlobalQueryState(locale: string): Promise<DehydratedState> {
  const keys = globalQueryKeys(locale);
  const [continents, countries, pages, beaches] = await Promise.all([
    getJson('continents', locale),
    getJson('countries', locale),
    getJson('static-pages', locale),
    getJson('beaches/footer', locale),
  ]);

  const queryClient = new QueryClient();
  // The SDK hooks keep the whole response body; the footer hooks keep its `data` array.
  if (continents) queryClient.setQueryData(keys.continents, continents);
  if (countries) queryClient.setQueryData(keys.countries, countries);
  if (Array.isArray(pages?.data)) queryClient.setQueryData(keys.footerPages, pages.data);
  if (Array.isArray(beaches?.data)) queryClient.setQueryData(keys.footerBeaches, beaches.data);

  return dehydrate(queryClient);
}

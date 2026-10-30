import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { getContinentsOptions, getCountriesOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import { client } from '@/lib/api-client/client.gen';
import { env } from '@/env';
import { fetchGlobalQueryState, globalQueryKeys } from '@/lib/server/global-data';
import { serverApiBaseUrl } from '@/lib/server/api-base';

/**
 * Menu/footer lists come from the server render (backend ADR 2026-10-30 "API performance"): the browser must find
 * them in React Query under exactly the keys its hooks use, or it fetches them again on every page view.
 */
test.describe('Global data from the server', () => {
  const src = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

  test('keys equal the ones the browser hooks build', () => {
    // The browser's client uses the public URL (ApiClientProvider); same default here.
    client.setConfig({ baseUrl: env.NEXT_PUBLIC_API_ENDPOINT });
    const keys = globalQueryKeys('de');
    expect(keys.continents).toEqual(getContinentsOptions().queryKey);
    expect(keys.countries).toEqual(getCountriesOptions({ query: undefined }).queryKey);

    // useContinents / useCountries (no continent) / footer hooks
    expect(src('src/hooks/useContinents.ts')).toContain('...getContinentsOptions(),');
    expect(src('src/hooks/useCountries.ts')).toContain("query: continentCode ? { continent: continentCode } : undefined");
    expect(src('src/hooks/useStaticPages.ts')).toContain("queryKey: ['static-pages', 'footer', locale]");
    expect(src('src/components/Footer/FooterMostViewedColumn.tsx')).toContain("queryKey: ['beaches', 'footer', locale]");
    expect(keys.footerPages).toEqual(['static-pages', 'footer', 'de']);
    expect(keys.footerBeaches).toEqual(['beaches', 'footer', 'de']);
  });

  test('the server render fetches each list once over the internal URL and dehydrates it', async () => {
    const calls: { url: string; lang: string | null }[] = [];
    const realFetch = globalThis.fetch;
    process.env.API_INTERNAL_URL = 'http://web_test/';
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, lang: new Headers(init?.headers).get('Accept-Language') });
      const body = url.endsWith('/continents') ? { success: true, data: [{ code: 'EU', name: 'Europa' }] }
        : url.endsWith('/countries') ? { success: true, data: [{ code: 'HR', name: 'Kroatien' }] }
          : url.endsWith('/static-pages') ? { success: true, data: [{ code: 'about-us', slug: 'ueber-uns' }] }
            : { success: true, data: [{ id: 1, name: 'Zlatni rat' }] };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;
    try {
      const state = await fetchGlobalQueryState('de');
      expect(calls.map((c) => c.url).sort()).toEqual([
        'http://web_test/api/v1/beaches/footer',
        'http://web_test/api/v1/continents',
        'http://web_test/api/v1/countries',
        'http://web_test/api/v1/static-pages',
      ]);
      expect(calls.every((c) => c.lang === 'de')).toBe(true);
      const byKey = new Map(state.queries.map((q) => [JSON.stringify(q.queryKey), q.state.data]));
      const keys = globalQueryKeys('de');
      expect(byKey.get(JSON.stringify(keys.continents))).toEqual({ success: true, data: [{ code: 'EU', name: 'Europa' }] });
      expect(byKey.get(JSON.stringify(keys.countries))).toEqual({ success: true, data: [{ code: 'HR', name: 'Kroatien' }] });
      expect(byKey.get(JSON.stringify(keys.footerPages))).toEqual([{ code: 'about-us', slug: 'ueber-uns' }]);
      expect(byKey.get(JSON.stringify(keys.footerBeaches))).toEqual([{ id: 1, name: 'Zlatni rat' }]);
    } finally {
      globalThis.fetch = realFetch;
      delete process.env.API_INTERNAL_URL;
    }
  });

  test('a failing API leaves the lists to the browser instead of breaking the page', async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response('down', { status: 502 })) as typeof fetch;
    try {
      expect((await fetchGlobalQueryState('en')).queries).toEqual([]);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  test('server calls use API_INTERNAL_URL when set, else the public URL', () => {
    delete process.env.API_INTERNAL_URL;
    expect(serverApiBaseUrl()).toBe(env.NEXT_PUBLIC_API_ENDPOINT);
    process.env.API_INTERNAL_URL = 'http://web_prod/';
    expect(serverApiBaseUrl()).toBe('http://web_prod');
    delete process.env.API_INTERNAL_URL;
  });

  test('the menu fetches the 125 KB filter list only when opened', () => {
    expect(src('src/components/Header/BurgerMenu.tsx')).toContain(
      'useQuery({ ...getBeachFiltersOptions({ query: {} as never }), enabled: isOpen })',
    );
  });
});

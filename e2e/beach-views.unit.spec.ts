import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_API_ENDPOINT = 'https://dev-api.beachrex.com';

/**
 * Beach pages are cached (ISR), so the server cannot count visitors; the browser reports the visit with
 * POST /beaches/{id}/view. Reads that are not visits (server render, hover prefetch, language switch) send
 * X-Beachrex-Client so the backend does not count them (backend 2026-10-09).
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('the browser reports a beach view with one POST', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const g = globalThis as unknown as { window?: unknown; fetch: typeof fetch };
  const originalFetch = g.fetch;
  g.window = {};
  g.fetch = ((url: string, init: RequestInit) => {
    calls.push({ url, init });
    return Promise.resolve(new Response(null, { status: 204 }));
  }) as typeof fetch;
  try {
    const { reportBeachView } = await import('@/lib/utils/beach-views');
    reportBeachView(123);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('https://dev-api.beachrex.com/api/v1/beaches/123/view');
    expect(calls[0]!.init.method).toBe('POST');
    expect(calls[0]!.init.keepalive).toBe(true);
  } finally {
    g.fetch = originalFetch;
    delete g.window;
  }
});

test('reads that are not visits identify themselves; the beach page reports the visit', () => {
  const route = read('src/app/[locale]/beaches/[continent]/[country]/[...segments]/page.tsx');
  expect(route.match(/getBeachDetails\(\{[\s\S]*?NOT_A_VIEW_HEADERS[\s\S]*?\}\);/g)).toHaveLength(2);
  expect(read('src/lib/prefetch-utils.ts')).toMatch(/getBeachDetailsOptions\(\{[\s\S]*?headers: NOT_A_VIEW_HEADERS/);
  expect(read('src/hooks/useLocalizedPath.ts')).toMatch(/getBeachDetails\(\{[\s\S]*?NOT_A_VIEW_HEADERS/);
  expect(read('src/components/Pages/BeachDetailPage.tsx')).toMatch(/useEffect\(\(\) => \{\s*if \(beachId !== null\) reportBeachView\(beachId\);/);
});

import { test, expect } from '@playwright/test';

import { locales } from '../src/app/config/locales';
import { loadPlaceSlugs, resetPlaceSlugsCache } from '../src/lib/seo/place-paths';

/** Dev slowdown 2026-10-26: place slugs (~19 MB of JSON) were re-read on every page render. */
function stubFetch(empty = false) {
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    calls++;
    const path = String(url);
    const rows = empty
      ? []
      : path.includes('countries')
        ? [{ code: 'HR', slug: 'croatia', continent_code: 'EU' }]
        : path.includes('continents')
          ? [{ code: 'EU', slug: 'europe' }]
          : [{ id: 1, slug: 'x' }];
    return new Response(JSON.stringify({ data: rows }), { status: 200 });
  }) as typeof fetch;
  return { calls: () => calls, restore: () => (globalThis.fetch = original) };
}

test('place slugs are loaded once and shared', async () => {
  resetPlaceSlugsCache();
  const stub = stubFetch();
  try {
    const [a, b] = await Promise.all([loadPlaceSlugs('http://api'), loadPlaceSlugs('http://api')]);
    await loadPlaceSlugs('http://api');
    expect(a).toBe(b);
    expect(stub.calls()).toBe(locales.length * 5);
    expect(a.si?.country.get('HR')).toBe('croatia');
  } finally {
    stub.restore();
    resetPlaceSlugsCache();
  }
});

test('an incomplete load is not kept for an hour', async () => {
  resetPlaceSlugsCache();
  const stub = stubFetch(true);
  try {
    await loadPlaceSlugs('http://api');
    await new Promise((r) => setTimeout(r, 0));
    expect(stub.calls()).toBe(locales.length * 5);
  } finally {
    stub.restore();
    resetPlaceSlugsCache();
  }
});

import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * cache-handler.cjs: the bounded in-memory Next.js cache (backend ADR 2026-10-30 "Bounded Next.js cache").
 * Prod 2026-10-30: the default handler wrote every ISR page and fetch response to disk and never deleted any
 * (~14 GB in the front_prod container in one day). Regression guards: nothing is written to disk, memory is
 * capped, 404/redirect pages (unbounded bot URLs) are not stored, and the config uses the handler.
 */
const requireCjs = createRequire(join(process.cwd(), 'package.json'));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Handler = requireCjs('./cache-handler.cjs');

function page(status: number | undefined, size = 1000) {
  return { kind: 'PAGE', html: `<html>${'x'.repeat(size)}</html>`, pageData: 'rsc', headers: { 'x-next-cache-tags': '_N_T_/en' }, status, postponed: undefined };
}

test.describe('ByteLru', () => {
  test('evicts the least recently used entries above the byte budget', () => {
    const lru = new Handler.ByteLru(1000);
    lru.set('a', 1, 40);
    lru.set('b', 2, 40);
    lru.get('a'); // a is now the most recently used
    for (let i = 0; i < 30; i += 1) lru.set(`k${i}`, i, 40);
    expect(lru.bytes).toBeLessThanOrEqual(1000);
    expect(lru.get('b')).toBeUndefined();
    expect(lru.evictions).toBeGreaterThan(0);
  });

  test('refuses an entry bigger than a tenth of the budget', () => {
    const lru = new Handler.ByteLru(1000);
    expect(lru.set('huge', 1, 101)).toBe(false);
    expect(lru.size).toBe(0);
  });
});

test.describe('BoundedCacheHandler', () => {
  test('stores 200 pages, fetches and routes compressed and returns them unchanged', async () => {
    const h = new Handler({ revalidatedTags: [] });
    const p = page(200, 50_000);
    await h.set('/en/beaches/x', p, {});
    const got = await h.get('/en/beaches/x', { kindHint: 'app' });
    expect(got.value).toEqual(p);
    expect(typeof got.lastModified).toBe('number');

    const fetchValue = { kind: 'FETCH', data: { headers: {}, body: 'e30=', url: 'http://api/x', status: 200 }, revalidate: 300 };
    await h.set('fetch-key', fetchValue, { tags: ['site-settings'] });
    expect((await h.get('fetch-key', { kindHint: 'fetch', tags: ['site-settings'] })).value).toEqual({ ...fetchValue });

    const route = { kind: 'ROUTE', body: Buffer.from('<urlset/>'), status: 200, headers: { 'content-type': 'application/xml' } };
    await h.set('/sitemap.xml', route, {});
    const r = (await h.get('/sitemap.xml', {})).value;
    expect(Buffer.isBuffer(r.body)).toBe(true);
    expect(r.body.toString()).toBe('<urlset/>');

    const stats = Handler.cacheStats();
    expect(stats.bytes).toBeLessThan(50_000); // gzip: the 50 KB page takes far less
  });

  test('does not store 404 or redirect pages (bot URLs are unbounded)', async () => {
    const h = new Handler({ revalidatedTags: [] });
    await h.set('/en/foo-1/bar', page(404), {});
    await h.set('/en/beaches/europe/croatia/x1/plaza-2', page(307), {});
    expect(await h.get('/en/foo-1/bar', {})).toBeNull();
    expect(await h.get('/en/beaches/europe/croatia/x1/plaza-2', {})).toBeNull();
    expect(Handler.isCacheable(page(undefined))).toBe(true);
    expect(Handler.isCacheable({ kind: 'IMAGE' })).toBe(false);
  });

  test('revalidateTag drops entries with that tag', async () => {
    const h = new Handler({ revalidatedTags: [] });
    await h.set('/en/tagged', page(200), {});
    await new Promise((r) => setTimeout(r, 5));
    await h.revalidateTag('_N_T_/en');
    expect(await h.get('/en/tagged', {})).toBeNull();
  });

  test('budget comes from NEXT_CACHE_MAX_MB, default 128 MB', () => {
    expect(Handler.budgetBytes(undefined)).toBe(128 * 1024 * 1024);
    expect(Handler.budgetBytes('256')).toBe(256 * 1024 * 1024);
    expect(Handler.budgetBytes('nonsense')).toBe(128 * 1024 * 1024);
  });

  test('never writes to disk (no fs writes in the handler)', () => {
    const src = readFileSync(join(process.cwd(), 'cache-handler.cjs'), 'utf8');
    expect(src).not.toMatch(/writeFile|mkdir|createWriteStream/);
    expect(src).toContain('flushToDisk: false');
  });

  test('next.config.js uses the handler and turns off Next’s own memory layer', () => {
    const config = readFileSync(join(process.cwd(), 'next.config.js'), 'utf8');
    expect(config).toContain('cacheHandler: fileURLToPath(new URL("./cache-handler.cjs", import.meta.url))');
    expect(config).toContain('cacheMaxMemorySize: 0');
  });
});

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Performance audit 2026-10-09: no `[locale]` page was ever cached. next-intl read the locale from `headers()`
 * (no `setRequestLocale`), the home page was `force-dynamic`, and dynamic segments without `generateStaticParams`
 * render on every request in Next 14. Now every page is ISR: rendered on the first visit, then served from cache.
 */
const root = process.cwd();
const appDir = join(root, 'src/app/[locale]');

function files(dir: string, name: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path, name);
    return entry === name ? [path] : [];
  });
}

const read = (p: string) => readFileSync(p, 'utf8');
const isClient = (source: string) => source.trimStart().startsWith("'use client'");

test('every server page and the locale layout call setRequestLocale', () => {
  const missing = [...files(appDir, 'page.tsx'), join(appDir, 'layout.tsx')]
    .filter((f) => !isClient(read(f)))
    .filter((f) => !f.endsWith(join('payment', 'cancel', 'page.tsx'))) // renders a client component only
    .filter((f) => !read(f).includes('setRequestLocale('))
    .map((f) => relative(root, f));
  expect(missing).toEqual([]);
});

test('the layout and every cached route with its own dynamic segment export generateStaticParams', () => {
  const routes = [join(appDir, 'layout.tsx'), ...files(appDir, 'page.tsx').filter((f) => /\[[^\]]+\]/.test(relative(appDir, f)))];
  // `[...rest]` (unknown URLs, old-site redirects) is force-dynamic on purpose: an ISR file per invented URL filled the
  // prod disk (backend ADR 2026-10-30 "Bounded Next.js cache").
  const missing = routes
    .filter((f) => !read(f).includes("export const dynamic = 'force-dynamic'"))
    .filter((f) => !read(f).includes('generateStaticParams'))
    .map((f) => relative(root, f));
  expect(missing).toEqual([]);
});

test('no page forces dynamic rendering of the home page; server code never reads the locale from headers', () => {
  expect(read(join(appDir, 'page.tsx'))).not.toContain("dynamic = 'force-dynamic'");
  const serverFiles = [...files(appDir, 'page.tsx'), ...files(appDir, 'not-found.tsx'), ...files(appDir, 'layout.tsx')]
    .filter((f) => !isClient(read(f)));
  for (const f of serverFiles) {
    // getTranslations('Ns') / getLocale() without a locale use headers() and break static rendering (500)
    expect(read(f), relative(root, f)).not.toMatch(/getTranslations\(\s*'|getLocale\(\)/);
  }
});

test('useSearchParams users render inside a Suspense boundary', () => {
  expect(read(join(root, 'src/components/DynamicSearchBeaches.tsx'))).toMatch(/<Suspense[\s\S]*<DynamicSearchBeachesInner/);
  for (const page of ['payment/success/page.tsx', 'auth/callback/page.tsx']) {
    expect(read(join(appDir, page)), page).toMatch(/<Suspense/);
  }
});

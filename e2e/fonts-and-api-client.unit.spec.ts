import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Performance audit 2026-10-09:
 * - Figtree and Damion came from a render-blocking Google Fonts `@import` in globals.css (CSS → CSS → font chain).
 * - ApiClientProvider set `Accept-Language` in an effect that ran after the children's effects, then reset all
 *   queries: every query went out twice on each page load (and again when the token loaded).
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('fonts are self-hosted with next/font, no Google Fonts @import', () => {
  expect(read('src/styles/globals.css')).not.toContain('fonts.googleapis.com');
  const layout = read('src/app/[locale]/layout.tsx');
  expect(layout).toMatch(/import \{[^}]*Figtree[^}]*\} from 'next\/font\/google'/);
  expect(layout).toMatch(/variable: '--font-figtree'/);
  expect(layout).toMatch(/variable: '--font-damion'/);
  expect(read('tailwind.config.ts')).toContain('var(--font-figtree)');
});

test('API client is configured before the first render; only a locale change resets queries', () => {
  const provider = read('src/components/ApiClientProvider.tsx');
  expect(provider).toMatch(/useState\(\(\) => \{\s*configureClient\(locale, token\);/);
  expect(provider).toMatch(/if \(previous\.locale !== locale\) void queryClient\.resetQueries\(\);/);
  expect(provider).toContain("typeof window === 'undefined'");
});

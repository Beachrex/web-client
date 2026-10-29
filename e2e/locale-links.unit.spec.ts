import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Guard for the locale jumps (dev review tracker QA #24, #25, #74).
 *
 * A plain `next/link` with a locale-less internal href such as "/" or "/beach-map" lets the
 * next-intl middleware pick the locale from the NEXT_LOCALE cookie or a stale prefetch, so users
 * landed on EN or another language. Internal hrefs must start with `/${locale}` (or use the URL
 * builders in src/lib/utils/beach-urls.ts and destination-url.ts).
 */

const SRC = join(process.cwd(), 'src');

// Known remaining offenders outside QA #24/#25/#74, listed in docs/HANDOFF.md (backend repo) open items.
const ALLOWED = new Set([
  // Imports both; its `/p/...` href is on the next-intl Link, which adds the locale.
  'components/Footer/FooterNewsletter.tsx',
]);

// href="/x", href={'/x'}, href={`/x...`} (but not href={`/${...`), and the old `return '/beach-map'`.
const LOCALE_LESS = [
  /href="\/[^"]*"/,
  /href=\{'\/[^']*'\}/,
  /href=\{`\/(?!\$\{)[^`]*`\}/,
  /['"`]\/beach-map['"`?]/,
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'api-client' ? [] : walk(path);
    return path.endsWith('.tsx') ? [path] : [];
  });
}

test('no locale-less internal hrefs on plain next/link components', () => {
  const offenders: string[] = [];

  for (const file of walk(SRC)) {
    const rel = relative(SRC, file);
    if (ALLOWED.has(rel)) continue;

    const source = readFileSync(file, 'utf8');
    // The next-intl Link (`@/i18n/routing`) adds the locale itself; only plain next/link is checked.
    if (!source.includes("from 'next/link'")) continue;

    source
      .split('\n')
      .forEach((line, i) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
        if (LOCALE_LESS.some((re) => re.test(line))) offenders.push(`${rel}:${i + 1}: ${line.trim()}`);
      });
  }

  expect(offenders).toEqual([]);
});

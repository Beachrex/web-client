import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner 2026-10-29: the 360° viewer `/vendor/pannellum-2.5.6/pannellum.htm` answered 404 on dev, because the locale
 * middleware turned it into `/en/vendor/…`. Public files must bypass the middleware.
 */
// Read the matcher from the source (importing the middleware needs the Next.js runtime).
const source = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');
const pattern = /matcher:\s*\[[\s\S]*?'([^']+)'/.exec(source)?.[1]?.replace(/\\\\/g, '\\') ?? '';
const matcher = new RegExp(`^${pattern}$`);

test('public files are not routed through the locale middleware', () => {
  for (const path of ['/vendor/pannellum-2.5.6/pannellum.htm', '/images/beachmedia/360-degree.svg', '/brand/x.zip', '/robots.txt']) {
    expect(matcher.test(path), path).toBe(false);
  }
});

test('pages still go through it', () => {
  for (const path of ['/en', '/si/plaze/evropa', '/de/strand-karte', '/vendors']) {
    expect(matcher.test(path), path).toBe(true);
  }
});

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/**
 * Owner, 2026-10-08: favicon.ico, phone icons and a share image for pages without their own,
 * from the brand package (CGP v1.0).
 */

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_BASE_URL = 'https://beachrex.com';

const pub = (p: string) => join(process.cwd(), 'public', p);

test('icon files, manifest and share image exist in public/', () => {
  for (const f of ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'android-chrome-192x192.png',
    'android-chrome-512x512.png', 'site.webmanifest', 'og-image.png']) {
    expect(existsSync(pub(f)), f).toBe(true);
  }
  const manifest = JSON.parse(readFileSync(pub('site.webmanifest'), 'utf8')) as { icons: { src: string }[] };
  for (const icon of manifest.icons) expect(existsSync(pub(icon.src)), icon.src).toBe(true);
});

test('pages without images get the default share image; own images are kept', async () => {
  const { buildCompleteMetadata, withDefaultShareImage } = await import('@/lib/utils/metadata-helpers');
  expect(withDefaultShareImage()).toEqual(['https://beachrex.com/og-image.png']);
  expect(withDefaultShareImage([])).toEqual(['https://beachrex.com/og-image.png']);
  expect(withDefaultShareImage(['https://cdn/x.jpg'])).toEqual(['https://cdn/x.jpg']);
  const meta = buildCompleteMetadata({ title: 'T', description: 'D', locale: 'en', path: '/' });
  expect(meta.openGraph?.images).toEqual(['https://beachrex.com/og-image.png']);
});

test('the locale middleware does not swallow icon and share image paths', () => {
  const src = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');
  const matcher = new RegExp(`^${/'(\/\(\(\?!.*?\)\.\*\))'/.exec(src)![1]!.replace(/\\\\/g, '\\')}$`);
  for (const p of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/android-chrome-192x192.png',
    '/site.webmanifest', '/og-image.png', '/brand/BeachRex_CGP.zip']) {
    expect(matcher.test(p), p).toBe(false);
  }
  expect(matcher.test('/si/plaze')).toBe(true);
});

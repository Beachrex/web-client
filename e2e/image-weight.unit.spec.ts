import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

process.env.SKIP_ENV_VALIDATION = '1';
process.env.NEXT_PUBLIC_CDN_TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
process.env.NEXT_PUBLIC_CDN_LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
process.env.NEXT_PUBLIC_CDN_ASSETS = 'https://beachrex.fra1.digitaloceanspaces.com/public/';

/**
 * Performance audit 2026-10-09: the home page loaded ~10 MB of unresized JPEGs (`bazen.jpg` 3.4 MB) and the
 * hero image was a CSS background set only after JavaScript and an extra API call; every destination card was
 * `priority`, competing with the hero for bandwidth.
 */
const root = process.cwd();
const kb = (p: string) => statSync(join(root, 'public', p)).size / 1024;

test('images used by pages stay small', () => {
  for (const p of ['images/categories/bazen.jpg', 'images/categories/river-beaches.jpg', 'images/categories/lake-beaches.jpg', 'images/categories/indoor-pool.jpg']) {
    expect(kb(p), p).toBeLessThan(120);
  }
  for (const p of ['images/categories/sea-beaches.jpg', 'images/topdestination/spain.jpg', 'images/hvar.jpg', 'images/beachmedia/live-cam.jpg']) {
    expect(kb(p), p).toBeLessThan(250);
  }
});

test('hero image is server-rendered with priority; destination cards are not priority', () => {
  const hero = readFileSync(join(root, 'src/components/Home/HeroSection.tsx'), 'utf8');
  expect(hero).not.toContain('backgroundImage: `url(');
  expect(hero).toMatch(/<Image[^>]*priority/);
  expect(readFileSync(join(root, 'src/app/[locale]/page.tsx'), 'utf8')).toContain('initialBackground={heroBackgroundUrl(');
  expect(readFileSync(join(root, 'src/components/DestinationCard.tsx'), 'utf8')).not.toMatch(/\bpriority\b(?!:)/);
});

test('hero background picks the background_image collection, then primary, then first', async () => {
  const { heroBackgroundUrl } = await import('@/lib/utils/hero-image');
  expect(heroBackgroundUrl(null)).toBe('');
  expect(heroBackgroundUrl([{ url: 'a.jpg' }, { url: 'b.jpg', is_primary: true }, { url: 'c.jpg', collection: 'background_image' }])).toContain('c.jpg');
  expect(heroBackgroundUrl([{ url: 'a.jpg' }, { url: 'b.jpg', is_primary: true }])).toContain('b.jpg');
  expect(heroBackgroundUrl([{ url: 'a.jpg' }])).toContain('a.jpg');
});

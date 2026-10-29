import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import imagorLoader from '@/lib/imagor-loader';

/**
 * Performance, owner 2026-10-29: the home page sent the hero as a 2800 px JPEG and beach cards as 800 px JPEGs
 * to every device (`images.unoptimized`), and preloaded 7 font files. Now `next/image` gets a responsive WebP
 * srcset from Imagor, never larger than the endpoint, and Figtree is not preloaded.
 */
const LARGE = 'https://s3.beachrex.com/unsafe/fit-in/2800x2800/';
const TEASER = 'https://s3.beachrex.com/unsafe/fit-in/800x800/';
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('Imagor URLs get the requested width as WebP', () => {
  expect(imagorLoader({ src: `${LARGE}img/first-page/hero-bg.jpg`, width: 828 })).toBe(
    'https://s3.beachrex.com/unsafe/fit-in/828x828/filters:format(webp):quality(75)/img/first-page/hero-bg.jpg',
  );
  expect(imagorLoader({ src: `${TEASER}img/beaches/hr-3-o-rab/a.jpg`, width: 384, quality: 80 })).toBe(
    'https://s3.beachrex.com/unsafe/fit-in/384x384/filters:format(webp):quality(80)/img/beaches/hr-3-o-rab/a.jpg',
  );
});

test('the width never exceeds the endpoint size (no image gets larger than before)', () => {
  expect(imagorLoader({ src: `${TEASER}img/beaches/x/a.jpg`, width: 1920 })).toContain('/fit-in/800x800/');
  expect(imagorLoader({ src: `${LARGE}img/first-page/hero-bg.jpg`, width: 2800 })).toContain('/fit-in/2800x2800/');
});

test('existing filters such as the mobile-photo watermark are kept; format and quality are replaced', () => {
  const src = `${TEASER}filters:watermark(img/watermark/beachrex-watermark-v1.png,-3p,-4p,0,20,30)/img/beaches_mobile/x/a.jpg`;
  expect(imagorLoader({ src, width: 640 })).toBe(
    'https://s3.beachrex.com/unsafe/fit-in/640x640/filters:format(webp):quality(75):watermark(img/watermark/beachrex-watermark-v1.png,-3p,-4p,0,20,30)/img/beaches_mobile/x/a.jpg',
  );
  const jpeg = `${TEASER}filters:format(jpeg):quality(90)/img/a.jpg`;
  expect(imagorLoader({ src: jpeg, width: 480 })).toBe(
    'https://s3.beachrex.com/unsafe/fit-in/480x480/filters:format(webp):quality(75)/img/a.jpg',
  );
});

test('other sources pass through unchanged', () => {
  for (const src of [
    '/images/beach.png',
    '/brand/BeachRex_CGP/01_Logo/Horizontal/SVG/beachrex_horizontal_color.svg',
    'https://beachrex.fra1.digitaloceanspaces.com/public/img/icon/map.svg',
    'https://s3.beachrex.com/unsafe/1200x630/smart/filters:format(jpeg):quality(85)/img/a.jpg',
  ]) {
    expect(imagorLoader({ src, width: 640 })).toBe(src);
  }
});

test('next.config uses the Imagor loader; Figtree is not preloaded', () => {
  const config = read('next.config.js');
  expect(config).toContain('loaderFile: "./src/lib/imagor-loader.ts"');
  expect(config).not.toMatch(/unoptimized:\s*true/);
  expect(read('src/app/[locale]/layout.tsx')).toMatch(/Figtree\(\{[^}]*preload: false/);
});

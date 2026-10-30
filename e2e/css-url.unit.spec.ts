import { readFileSync } from 'fs';
import { test, expect } from '@playwright/test';
import { cssUrl } from '@/lib/utils/css-url';

// Regression (owner 2026-10-30): banners with a watermarked mobile photo showed no image, because the Imagor URL
// has parentheses and `url(...)` without quotes is invalid CSS.
test('cssUrl quotes URLs with parentheses so the declaration stays valid', () => {
  const imagor =
    'https://s3.beachrex.com/unsafe/fit-in/2800x2800/filters:watermark(img/watermark/beachrex-watermark-v1.png,-3p,-4p,0,20,30)/img/beaches_mobile/a/b.jpg';
  expect(cssUrl(imagor)).toBe(`url("${imagor}")`);
  expect(cssUrl('https://x/a"b.jpg')).toBe('url("https://x/a\\"b.jpg")');
});

test('no component builds an unquoted url(${…}) background', () => {
  for (const f of [
    'src/components/BannerSection/BannerSection.tsx',
    'src/components/WorldPage/WorldBanner/WorldBannerSection.tsx',
    'src/app/[locale]/gregor-balazic/page.tsx',
  ]) {
    const src = readFileSync(f, 'utf8');
    expect(src, f).not.toMatch(/url\(\$\{/);
    expect(src, f).toContain('cssUrl(');
  }
});

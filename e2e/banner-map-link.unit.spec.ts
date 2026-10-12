import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

/** Owner 2026-10-12 (Bretagne): the map thumbnail in the banner was not clickable on any page. */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('the map thumbnail links to the beach map of the place', () => {
  expect(read('src/components/BannerSection/MapWidget.tsx')).toContain('<Link href={href} aria-label={label}');
  for (const banner of ['src/components/BannerSection/BannerSection.tsx', 'src/components/Beach/BeachBanner/BeachBannerSection.tsx']) {
    const source = read(banner);
    expect(source, banner).toContain("<MapWidget href={buildMapUrl()} label={tWorldTopBar('mapButton')} />");
    expect(source, banner).not.toContain('<MapWidget />');
  }
});

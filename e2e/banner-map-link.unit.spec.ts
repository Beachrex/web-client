import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/**
 * Owner 2026-10-29 (Kvarner): the banner showed the map twice — the banner-map.png thumbnail
 * and the floating map icon on the right edge, both opening the same beach map. The thumbnail
 * is gone from the place banners (continent/country/region/island/city) and the beach banner;
 * the floating icon stays and still links to the map of the place.
 */
test('place and beach banners render only the floating map icon, not the map thumbnail', () => {
  for (const banner of ['src/components/BannerSection/BannerSection.tsx', 'src/components/Beach/BeachBanner/BeachBannerSection.tsx']) {
    const source = read(banner);
    expect(source, banner).not.toContain('MapWidget');
    expect(source, banner).not.toContain('banner-map.png');
    expect(source, banner).toMatch(/<Link\s+href=\{buildMapUrl\(\)\}/);
  }
  expect(read('src/components/BannerSection/BannerSection.tsx')).toContain('src="/images/common/map-icon.svg"');
});

test('the place banner does not render an empty widget row on continent and country pages', () => {
  const source = read('src/components/BannerSection/BannerSection.tsx');
  expect(source).toContain("const showWeather = variant !== 'country' && variant !== 'continent';");
  expect(source).toContain('{(showWeather || rightWidgets) && (');
});

test('the world banner keeps its map thumbnail (it has no floating map icon)', () => {
  const source = read('src/components/WorldPage/WorldBanner/WorldBannerSection.tsx');
  expect(source).toContain('<MapWidget />');
  expect(source).toContain('href={buildBeachMapUrl(locale)}');
});

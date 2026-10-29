import { test, expect } from '@playwright/test';
import { locales } from '@/app/config/locales';
import { hasMainImage } from '@/lib/utils/beach-cards';
import { getBeachesWord } from '@/lib/utils/beach-urls';
import { buildDestinationUrl } from '@/lib/utils/destination-url';

/**
 * Regression tests for the continent/country page crashes (dev review tracker QA #19, #53, #55, #56, #60, #77).
 *
 * - A beach without `main_image` made DynamicSearchBeaches throw while rendering, and the continent
 *   page passed a null image to next/image. Both crashed the page after it loaded.
 * - buildDestinationUrl threw for a city or island without a region, which crashed the country page.
 * - destination-url.ts had its own 14-locale "beaches" map, so da/pt/nl/el/sq links used "beaches".
 */

const europeHr = { continent_slug: 'europe', country_slug: 'croatia' };

test.describe('hasMainImage', () => {
  test('keeps beaches with an image and drops the rest', () => {
    const beaches = [
      { id: 1, main_image: 'img/beaches/a/a.jpg' },
      { id: 2, main_image: null },
      { id: 3 },
      { id: 4, main_image: '' },
      { id: 5, main_image: '   ' },
    ];
    expect(beaches.filter(hasMainImage).map((b) => b.id)).toEqual([1]);
  });

  test('empty list stays empty', () => {
    expect([].filter(hasMainImage)).toEqual([]);
  });
});

test.describe('buildDestinationUrl', () => {
  test('city without a region does not throw and skips the region segment', () => {
    const url = buildDestinationUrl({
      locale: 'en',
      type: 'city',
      slug: 'zagreb',
      location: { ...europeHr, region_slug: null, island_slug: null },
    });
    expect(url).toBe('/en/beaches/europe/croatia/zagreb');
  });

  test('island without a region does not throw and skips the region segment', () => {
    const url = buildDestinationUrl({
      locale: 'si',
      type: 'island',
      slug: 'krk',
      location: { ...europeHr, region_slug: null },
    });
    expect(url).toBe('/si/plaze/europe/croatia/krk');
  });

  test('city with region and island keeps the full path', () => {
    const url = buildDestinationUrl({
      locale: 'en',
      type: 'city',
      slug: 'bol',
      location: { ...europeHr, region_slug: 'dalmatia', island_slug: 'brac' },
    });
    expect(url).toBe('/en/beaches/europe/croatia/dalmatia/brac/bol');
  });

  test('region uses its own slug when region_slug is missing', () => {
    expect(
      buildDestinationUrl({ locale: 'en', type: 'region', slug: 'istria', location: europeHr }),
    ).toBe('/en/beaches/europe/croatia/istria');
  });

  test('country URL uses the localized beaches word for all 19 locales', () => {
    expect(locales).toHaveLength(19);
    for (const locale of locales) {
      expect(
        buildDestinationUrl({ locale, type: 'country', slug: 'croatia', location: europeHr }),
      ).toBe(`/${locale}/${getBeachesWord(locale)}/europe/croatia`);
    }
    expect(
      buildDestinationUrl({ locale: 'da', type: 'country', slug: 'croatia', location: europeHr }),
    ).toBe('/da/straande/europe/croatia');
  });
});

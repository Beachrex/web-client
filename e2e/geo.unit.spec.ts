import { test, expect } from '@playwright/test';
import { formatCoordinates, googleMapsNavigationUrl, parseCoordinates } from '@/lib/utils/geo';

/** Owner 2026-10-28: beach page shows "GPS location" + a Navigation button to Google Maps. */
test.describe('beach GPS', () => {
  test('parses the API strings and formats them for people', () => {
    const p = parseCoordinates('45.54170000', '13.65600000');
    expect(p).toEqual({ lat: 45.5417, lng: 13.656 });
    expect(formatCoordinates(p!)).toBe('45.54170, 13.65600');
    expect(formatCoordinates(parseCoordinates('-33.8908', '151.2743')!)).toBe('-33.89080, 151.27430');
  });

  test('no block for missing or impossible positions', () => {
    for (const [lat, lng] of [[null, null], ['', ''], ['abc', '13'], ['0', '0'], ['91', '10'], ['45', '181'], [undefined, '13']]) {
      expect(parseCoordinates(lat, lng), `${lat},${lng}`).toBeNull();
    }
  });

  test('navigation opens Google Maps directions to the beach', () => {
    const url = new URL(googleMapsNavigationUrl({ lat: 45.5417, lng: 13.656 }));
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toBe('45.541700,13.656000');
  });
});

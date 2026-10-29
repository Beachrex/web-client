import { test, expect } from '@playwright/test';
import { formatDistance, parseDistanceKm } from '@/lib/utils/distance';
import { mapBeachToProperty } from '@/lib/mappers/mapBeachToProperty';

/** Owner 2026-10-29: "Nearby beaches" on the beach page show the distance, like the app. */
test.describe('nearby beach distance', () => {
  test('metres under 1 km, rounded to 10 m (min 10 m)', () => {
    expect(formatDistance(0.35, 'en')).toBe('350 m');
    expect(formatDistance(0.354, 'en')).toBe('350 m');
    expect(formatDistance(0.355, 'en')).toBe('360 m');
    expect(formatDistance(0, 'en')).toBe('10 m');
    expect(formatDistance(0.004, 'si')).toBe('10 m');
    expect(formatDistance(0.99, 'en')).toBe('990 m');
  });

  test('just under 1 km that rounds to 1000 m reads as 1 km', () => {
    expect(formatDistance(0.996, 'en')).toBe('1 km');
    expect(formatDistance(1, 'en')).toBe('1 km');
  });

  test('one decimal under 10 km, whole km from 10 km, localized', () => {
    expect(formatDistance(4.23, 'en')).toBe('4.2 km');
    expect(formatDistance(4.23, 'si')).toBe('4,2 km');
    expect(formatDistance(4.23, 'de')).toBe('4,2 km');
    expect(formatDistance(4.0, 'en')).toBe('4 km');
    expect(formatDistance(9.94, 'en')).toBe('9.9 km');
    expect(formatDistance(10, 'en')).toBe('10 km');
    expect(formatDistance(12.4, 'si')).toBe('12 km');
    expect(formatDistance(12.6, 'en')).toBe('13 km');
  });

  test('nothing for impossible values', () => {
    expect(formatDistance(-1, 'en')).toBe('');
    expect(formatDistance(Number.NaN, 'en')).toBe('');
    expect(formatDistance(Number.POSITIVE_INFINITY, 'en')).toBe('');
  });

  test('parses the API value (number or numeric string), null otherwise', () => {
    expect(parseDistanceKm(4.23)).toBe(4.23);
    expect(parseDistanceKm('4.23')).toBe(4.23);
    expect(parseDistanceKm(0)).toBe(0);
    for (const v of [null, undefined, '', ' ', 'abc', -0.5, Number.NaN, {}]) {
      expect(parseDistanceKm(v), String(v)).toBeNull();
    }
  });

  test('the beach card mapper carries distance_km from the within-radius response', () => {
    const beach = { id: 7, name: 'Fiesa', slug: 'fiesa', main_image: 'img/beach/fiesa.jpg', country_slug: 'slovenia' };
    expect(mapBeachToProperty({ ...beach, distance_km: 1.37 }, { locale: 'en' })?.distanceKm).toBe(1.37);
    expect(mapBeachToProperty(beach, { locale: 'en' })?.distanceKm).toBeNull();
  });
});

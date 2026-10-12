import { test, expect } from '@playwright/test';
import type { BeachSchema } from '../src/lib/api-client/types.gen';
import { hasMainImage, withMainImage } from '../src/lib/utils/beach-cards';

/**
 * Owner 2026-10-12 (Bretagne): mobile-app beaches came with `main_image: null` but gallery photos, and every
 * card list skipped them, so French region and city pages showed no beaches.
 */
const verger = {
  id: 2920,
  name: 'Plage du Verger',
  main_image: null,
  media: { gallery: [{ url: 'img/beaches_mobile/cancale-plage-du-verger_5/cancale-plage-du-verger_572-sl1.jpg' }] },
} as unknown as BeachSchema;

test('a beach without a main image uses its first gallery photo', () => {
  const card = withMainImage(verger);
  expect(hasMainImage(card)).toBe(true);
  expect(card.main_image).toBe('img/beaches_mobile/cancale-plage-du-verger_5/cancale-plage-du-verger_572-sl1.jpg');
});

test('a beach with a main image keeps it; one without any photo is still skipped', () => {
  const own = { ...verger, main_image: 'img/beaches/hr/own.jpg' } as BeachSchema;
  expect(withMainImage(own).main_image).toBe('img/beaches/hr/own.jpg');
  const none = { ...verger, media: { gallery: [] } } as unknown as BeachSchema;
  expect(hasMainImage(withMainImage(none))).toBe(false);
});

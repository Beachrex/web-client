import { test, expect } from '@playwright/test';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildBeachBadges, MAX_BEACH_BADGES } from '@/lib/utils/beach-badges';

/**
 * QA #45 / #46: the beach page showed the same hardcoded badges (stony, family,
 * parking, easy access, windsurfing) on every beach, repeated to fill 9 slots.
 * Badges now come from the beach's own data.
 */

const named = (code: string, name = code) => ({ id: 1, code, name });

test.describe('buildBeachBadges', () => {
  test('sand beach shows a sand badge, not stony (QA #46)', () => {
    const badges = buildBeachBadges({
      characteristics: { beach_type: named('sand', 'Pesek') },
    } as BeachDetailsSchema);

    expect(badges).toEqual([
      { key: 'beach_type:sand', icon: '/images/categories/sand-castle.png', label: 'Pesek' },
    ]);
  });

  test('beach without matching data gets no badges (QA #45)', () => {
    expect(buildBeachBadges({} as BeachDetailsSchema)).toEqual([]);
    expect(buildBeachBadges(undefined)).toEqual([]);
    expect(
      buildBeachBadges({
        activities: { user_types: [named('youth')] },
        accessibility: { accessibility: named('difficult'), parking_capacity: named('0') },
      } as BeachDetailsSchema),
    ).toEqual([]);
  });

  test('family, parking, easy access and windsurfing only when the data says so', () => {
    const keys = buildBeachBadges({
      characteristics: { beach_type: named('rock_beach') },
      activities: {
        user_types: [named('family')],
        sporting_activities: [named('swimming'), named('windsurfing')],
      },
      facilities: { location_infrastructure: [named('wc')] },
      accessibility: { accessibility: named('easy'), parking_capacity: named('50') },
    } as BeachDetailsSchema).map((b) => b.key);

    expect(keys).toEqual([
      'beach_type:rock_beach',
      'user_type:family',
      'parking',
      'easy_access',
      'sport:windsurfing',
    ]);
  });

  test('parking from infrastructure; private parking alone is not parking', () => {
    const fromInfra = buildBeachBadges({
      facilities: { location_infrastructure: [named('parking')] },
    } as BeachDetailsSchema);
    expect(fromInfra.map((b) => b.key)).toEqual(['parking']);
    expect(fromInfra[0].labelKey).toBe('parking');

    const privateOnly = buildBeachBadges({
      accessibility: { parking_capacity: named('private_parking_only') },
    } as BeachDetailsSchema);
    expect(privateOnly).toEqual([]);
  });

  test('no duplicates and at most the maximum (QA #46)', () => {
    const badges = buildBeachBadges({
      characteristics: { beach_type: named('sand') },
      activities: {
        user_types: [named('family'), named('family')],
        sporting_activities: [named('windsurfing'), named('windsurfing')],
      },
      facilities: {
        location_infrastructure: [
          named('parking'),
          named('access_for_disabled'),
          named('dog_friendly'),
          named('swimming_pool'),
          named('waterslide'),
          named('dance_floor'),
          named('dog_friendly'),
        ],
      },
      accessibility: { accessibility: named('easy') },
    } as BeachDetailsSchema);

    const keys = badges.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(badges.length).toBe(MAX_BEACH_BADGES);
  });
});

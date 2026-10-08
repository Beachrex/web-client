import { test, expect } from '@playwright/test';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildBeachBadges, buildCardFeatureIcons, MAX_BEACH_BADGES } from '@/lib/utils/beach-badges';

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
      { key: 'beach_type:sand', icon: 'js/assets/images/categories_icons/beach_type-sand.png', label: 'Pesek' },
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
    expect(fromInfra[0]?.labelKey).toBe('parking');

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

/**
 * QA #45 (cards): every list/map card showed the same stones / family / parking
 * icons. The icons now follow the API's `features`.
 */
test.describe('buildCardFeatureIcons', () => {
  test('only the features the beach has', () => {
    expect(
      buildCardFeatureIcons({ beach_type: { code: 'sand', name: 'Pesek' }, family: false, parking: true }).map((i) => i.key),
    ).toEqual(['beach_type:sand', 'parking']);

    expect(buildCardFeatureIcons({ beach_type: null, family: false, parking: false })).toEqual([]);
    expect(buildCardFeatureIcons(undefined)).toEqual([]);
  });

  test('each beach type has its own icon from the CDN set; labels come from the API or the badge keys', () => {
    const icons = buildCardFeatureIcons({ beach_type: { code: 'rock_beach', name: 'Skalnata' }, family: true, parking: false });
    expect(icons).toEqual([
      { key: 'beach_type:rock_beach', icon: 'js/assets/images/categories_icons/beach_type-rocks.png', label: 'Skalnata' },
      { key: 'family', icon: 'js/assets/images/categories_icons/user_type-family.png', labelKey: 'familyFriendly' },
    ]);
  });
});

test('every beach type code in the DB maps to a beach_type-*.png icon (QA #45)', () => {
  const expected: Record<string, string> = {
    sand: 'beach_type-sand.png',
    brown_sand: 'beach_type-sand.png',
    black_sand: 'beach_type-sand.png',
    small_stones: 'beach_type-fine_gravel.png',
    big_stones: 'beach_type-gravel.png',
    rock_beach: 'beach_type-rocks.png',
    grass_beach: 'beach_type-grass.png',
    concrete: 'beach_type-concrete.png',
  };
  for (const [code, file] of Object.entries(expected)) {
    const [icon] = buildCardFeatureIcons({ beach_type: { code, name: code } });
    expect(icon?.icon).toBe(`js/assets/images/categories_icons/${file}`);
  }
});

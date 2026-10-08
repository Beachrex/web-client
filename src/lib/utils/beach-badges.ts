import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

/**
 * Beach page badges (the icon strip under the banner), built from the beach's
 * real data. Labels come from the API (already translated via Accept-Language);
 * `labelKey` marks the two badges without an API name, which the component
 * translates from `BottomBadgesBeach.badges`.
 */
export interface BeachBadge {
  key: string;
  icon: string;
  label?: string;
  labelKey?: 'parking' | 'easyAccess';
}

export const MAX_BEACH_BADGES = 9;

const BEACH_TYPE_ICONS: Record<string, string> = {
  sand: '/images/categories/sand-castle.png',
  brown_sand: '/images/categories/sand-castle.png',
  black_sand: '/images/categories/sand-castle.png',
  small_stones: '/images/categories/stones-blue.png',
  big_stones: '/images/categories/stones-blue.png',
  rock_beach: '/images/categories/stones-blue.png',
  grass_beach: '/images/categories/grass-beach.png',
  concrete: '/images/categories/path.png',
};

const USER_TYPE_ICONS: Record<string, string> = {
  family: '/images/categories/parents.png',
};

const INFRASTRUCTURE_ICONS: Record<string, string> = {
  access_for_disabled: '/images/categories/disability.png',
  dog_friendly: '/images/categories/pets.png',
  swimming_pool: '/images/categories/swimming-pool.png',
  waterslide: '/images/categories/water-slide.png',
  dance_floor: '/images/categories/dance.png',
};

const SPORT_ICONS: Record<string, string> = {
  windsurfing: '/images/categories/windsurfing.png',
};

// Parking capacity codes that mean "no public parking".
const NO_PARKING_CAPACITY = new Set(['0', 'private_parking_only']);

type Named = { code?: string; name?: string } | null | undefined;

function asNamed(value: unknown): Named {
  return value && typeof value === 'object' ? (value as Named) : null;
}

export function buildBeachBadges(beach: BeachDetailsSchema | undefined): BeachBadge[] {
  if (!beach) return [];

  const badges: BeachBadge[] = [];
  const add = (badge: BeachBadge) => {
    if (!badges.some((b) => b.key === badge.key)) badges.push(badge);
  };

  const beachType = beach.characteristics?.beach_type;
  if (beachType?.code && BEACH_TYPE_ICONS[beachType.code]) {
    add({
      key: `beach_type:${beachType.code}`,
      icon: BEACH_TYPE_ICONS[beachType.code],
      label: beachType.name ?? beachType.code,
    });
  }

  for (const userType of beach.activities?.user_types ?? []) {
    if (userType.code && USER_TYPE_ICONS[userType.code]) {
      add({
        key: `user_type:${userType.code}`,
        icon: USER_TYPE_ICONS[userType.code],
        label: userType.name ?? userType.code,
      });
    }
  }

  const infrastructure = beach.facilities?.location_infrastructure ?? [];
  const accessibility = beach.accessibility ?? {};
  const capacity = asNamed(accessibility.parking_capacity);
  const hasParking =
    infrastructure.some((i) => i.code === 'parking') ||
    (!!capacity?.code && !NO_PARKING_CAPACITY.has(capacity.code));
  if (hasParking) {
    add({
      key: 'parking',
      icon: '/images/categories/parking-blue-full.png',
      labelKey: 'parking',
    });
  }

  if (asNamed(accessibility.accessibility)?.code === 'easy') {
    add({
      key: 'easy_access',
      icon: '/images/categories/arrow-path.svg',
      labelKey: 'easyAccess',
    });
  }

  for (const item of infrastructure) {
    if (item.code && INFRASTRUCTURE_ICONS[item.code]) {
      add({
        key: `infrastructure:${item.code}`,
        icon: INFRASTRUCTURE_ICONS[item.code],
        label: item.name ?? item.code,
      });
    }
  }

  for (const sport of beach.activities?.sporting_activities ?? []) {
    if (sport.code && SPORT_ICONS[sport.code]) {
      add({
        key: `sport:${sport.code}`,
        icon: SPORT_ICONS[sport.code],
        label: sport.name ?? sport.code,
      });
    }
  }

  return badges.slice(0, MAX_BEACH_BADGES);
}

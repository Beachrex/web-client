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
  labelKey?: 'parking' | 'easyAccess' | 'familyFriendly' | 'adventurer' | 'partyBeach';
}

export const MAX_BEACH_BADGES = 9;

/**
 * Beach type icons from the CDN set the old site used (owner, 2026-10-08):
 * `public/js/assets/images/categories_icons/beach_type-<kind>.png` on Spaces.
 * Paths without a leading slash are CDN-relative; resolve them with
 * `resolveBadgeIcon()` (beach-badge-icons.ts). Paths with a leading slash are
 * local `/public` files.
 */
const CDN_ICONS = 'js/assets/images/categories_icons';

export const BEACH_TYPE_ICONS: Record<string, string> = {
  sand: `${CDN_ICONS}/beach_type-sand.png`,
  brown_sand: `${CDN_ICONS}/beach_type-sand.png`,
  black_sand: `${CDN_ICONS}/beach_type-sand.png`,
  small_stones: `${CDN_ICONS}/beach_type-fine_gravel.png`,
  big_stones: `${CDN_ICONS}/beach_type-gravel.png`,
  rock_beach: `${CDN_ICONS}/beach_type-rocks.png`,
  grass_beach: `${CDN_ICONS}/beach_type-grass.png`,
  concrete: `${CDN_ICONS}/beach_type-concrete.png`,
};

const FAMILY_ICON = `${CDN_ICONS}/user_type-family.png`;
// Same CDN set and naming as the family icon (user type codes `adventurer`, `youth` = party beach).
const ADVENTURER_ICON = `${CDN_ICONS}/user_type-adventurer.png`;
const YOUTH_ICON = `${CDN_ICONS}/user_type-youth.png`;
const PARKING_ICON = `${CDN_ICONS}/parking.png`;

const USER_TYPE_ICONS: Record<string, string> = {
  family: FAMILY_ICON,
  adventurer: ADVENTURER_ICON,
  youth: YOUTH_ICON,
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
  const beachTypeIcon = beachType?.code ? BEACH_TYPE_ICONS[beachType.code] : undefined;
  if (beachType?.code && beachTypeIcon) {
    add({
      key: `beach_type:${beachType.code}`,
      icon: beachTypeIcon,
      label: beachType.name ?? beachType.code,
    });
  }

  for (const userType of beach.activities?.user_types ?? []) {
    const icon = userType.code ? USER_TYPE_ICONS[userType.code] : undefined;
    if (userType.code && icon) {
      add({
        key: `user_type:${userType.code}`,
        icon,
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
      icon: PARKING_ICON,
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
    const icon = item.code ? INFRASTRUCTURE_ICONS[item.code] : undefined;
    if (item.code && icon) {
      add({
        key: `infrastructure:${item.code}`,
        icon,
        label: item.name ?? item.code,
      });
    }
  }

  for (const sport of beach.activities?.sporting_activities ?? []) {
    const icon = sport.code ? SPORT_ICONS[sport.code] : undefined;
    if (sport.code && icon) {
      add({
        key: `sport:${sport.code}`,
        icon,
        label: sport.name ?? sport.code,
      });
    }
  }

  return badges.slice(0, MAX_BEACH_BADGES);
}

/**
 * List/map card icons (QA #45, cards). The API returns `features` on every
 * beach item (same rules as the badges above); before, every card showed the
 * same stones / family / parking icons.
 */
export interface BeachCardFeatures {
  beach_type?: { code?: string | null; name?: string | null } | null;
  family?: boolean | null;
  adventurer?: boolean | null;
  youth?: boolean | null;
  parking?: boolean | null;
}

export function buildCardFeatureIcons(features: BeachCardFeatures | null | undefined): BeachBadge[] {
  if (!features) return [];

  const icons: BeachBadge[] = [];
  const type = features.beach_type;
  const typeIcon = type?.code ? BEACH_TYPE_ICONS[type.code] : undefined;
  if (type?.code && typeIcon) {
    icons.push({ key: `beach_type:${type.code}`, icon: typeIcon, label: type.name ?? type.code });
  }
  if (features.family) {
    icons.push({ key: 'family', icon: FAMILY_ICON, labelKey: 'familyFriendly' });
  }
  if (features.adventurer) {
    icons.push({ key: 'adventurer', icon: ADVENTURER_ICON, labelKey: 'adventurer' });
  }
  if (features.youth) {
    icons.push({ key: 'youth', icon: YOUTH_ICON, labelKey: 'partyBeach' });
  }
  if (features.parking) {
    icons.push({ key: 'parking', icon: PARKING_ICON, labelKey: 'parking' });
  }
  return icons;
}

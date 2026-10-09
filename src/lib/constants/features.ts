/**
 * Features hidden for launch (owner decision 2026-10-08, TASK-004).
 *
 * Each flag hides a feature that only had placeholder UI (dead buttons, 404 links or fake data).
 * The list of what is hidden and what is needed to bring it back is in the backend repo:
 * `docs/features/hidden-for-launch.md`. Turn a flag on only together with the real feature.
 */
export const FEATURES = {
  /** Accommodation: menu CTA, search bar icon, home section and stat, page sections, counters. */
  accommodation: false,
  /** GetYourGuide activities section on the beach page. */
  getYourGuide: false,
  /** Favorites (top bar heart button). */
  favorites: false,
  /** My account (top bar user button). */
  account: false,
  /** Shop (header search bar icon). */
  shop: false,
  /** Blog (home "Browse blog" button). */
  blog: false,
  /** City page category tiles (sandy, pebble, pool, dogs, ...): no click action yet (owner 2026-10-09). */
  cityCategoryTiles: false,
} as const;

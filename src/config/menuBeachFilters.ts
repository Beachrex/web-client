/**
 * Burger menu groups of pre-filtered beaches (owner, 2026-10-09: "stranski meni bi lahko napolnili
 * s predfiltriranimi plažami — za mlade, peščene … in peljemo na mapo ob kliku").
 *
 * Each item opens the beach map with one filter. Labels come from `GET /beaches/filters` in the
 * visitor's language; an option the API does not return is left out (see `resolveQuickFilters`).
 */
import type { QuickFilterPick } from '@/config/mapQuickFilters';
import { BEACH_TYPE_ICONS } from '@/lib/utils/beach-badges';
import { resolveBadgeIcon } from '@/lib/utils/beach-badge-icons';

/** Every option the API returns for one filter, in API order (new options appear automatically). */
export interface MenuAllOptions {
  filterKey: string;
  /** Icon per option code; codes without one use `fallbackIcon`. */
  icons: Record<string, string>;
  fallbackIcon: string;
}

export type MenuFilterGroup = {
  /** Key in the `Menu` messages namespace. */
  labelKey: 'beachTypes' | 'beachesFor' | 'onTheBeach';
  icon: string;
} & ({ picks: QuickFilterPick[]; allOptions?: never } | { allOptions: MenuAllOptions; picks?: never });

export const MENU_FILTER_GROUPS: MenuFilterGroup[] = [
  {
    labelKey: 'beachTypes',
    icon: '/images/categories/sand-castle.png',
    // All beach types (owner 2026-10-29: the menu showed only 3 of the 6).
    allOptions: {
      filterKey: 'beach_type',
      // Same icons as the beach cards and the beach page badges (owner 2026-10-29: the menu used other icons,
      // and "Concrete" had none).
      icons: Object.fromEntries(
        Object.entries(BEACH_TYPE_ICONS).map(([code, icon]) => [code, resolveBadgeIcon(icon)])
      ),
      fallbackIcon: '/images/menu/world.svg',
    },
  },
  {
    labelKey: 'beachesFor',
    icon: '/images/categories/parents.png',
    picks: [
      { filterKey: 'user_type', optionCode: 'family', icon: '/images/categories/parents.png' },
      { filterKey: 'user_type', optionCode: 'youth', icon: '/images/categories/dance.png' },
      { filterKey: 'user_type', optionCode: 'adventurer', icon: '/images/categories/windsurfing.png' },
      { filterKey: 'location_infrastructure', optionCode: 'dog_friendly', icon: '/images/categories/pets.png' },
      { filterKey: 'location_infrastructure', optionCode: 'access_for_disabled', icon: '/images/categories/disability.png' },
    ],
  },
  {
    labelKey: 'onTheBeach',
    icon: '/images/categories/swimming-pool.png',
    picks: [
      { filterKey: 'location_infrastructure', optionCode: 'swimming_pool', icon: '/images/categories/swimming-pool.png' },
      { filterKey: 'location_infrastructure', optionCode: 'waterslide', icon: '/images/categories/water-slide.png' },
      { filterKey: 'culinary_offer', optionCode: 'beach_bar', icon: '/images/categories/stall.png' },
      { filterKey: 'natural_location_condition', optionCode: 'natural_shade', icon: '/images/categories/tree.png' },
      { filterKey: 'location_infrastructure', optionCode: 'children_playground', icon: '/images/categories/slider.png' },
      { filterKey: 'location_infrastructure', optionCode: 'parking', icon: '/images/categories/parking.png' },
    ],
  },
];

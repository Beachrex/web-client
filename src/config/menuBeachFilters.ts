/**
 * Burger menu groups of pre-filtered beaches (owner, 2026-10-09: "stranski meni bi lahko napolnili
 * s predfiltriranimi plažami — za mlade, peščene … in peljemo na mapo ob kliku").
 *
 * Each item opens the beach map with one filter. Labels come from `GET /beaches/filters` in the
 * visitor's language; an option the API does not return is left out (see `resolveQuickFilters`).
 */
import type { QuickFilterPick } from '@/config/mapQuickFilters';

export interface MenuFilterGroup {
  /** Key in the `Menu` messages namespace. */
  labelKey: 'beachTypes' | 'beachesFor' | 'onTheBeach';
  icon: string;
  picks: QuickFilterPick[];
}

export const MENU_FILTER_GROUPS: MenuFilterGroup[] = [
  {
    labelKey: 'beachTypes',
    icon: '/images/categories/sand-castle.png',
    picks: [
      { filterKey: 'beach_type', optionCode: 'sand', icon: '/images/categories/sand-castle.png' },
      { filterKey: 'beach_type', optionCode: 'small_stones', icon: '/images/categories/stones.png' },
      { filterKey: 'beach_type', optionCode: 'grass_beach', icon: '/images/categories/grass-beach.png' },
    ],
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

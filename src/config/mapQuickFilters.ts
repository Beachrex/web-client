/**
 * Quick filters on the beach map sidebar, shown while the advanced filters are off.
 *
 * Owner, 2026-10-08 (map design "basic filters"): the options and their labels come from the
 * backend (`GET /beaches/filters`); this list only picks which options to show, in the design
 * order, with the local icon. An option the API does not return is not shown.
 *
 * Not shown yet (no backend filter or no icon): free beach, parking nearby, wide beach,
 * naturist beach. See docs/features/hidden-for-launch.md in the backend repo.
 */

export interface QuickFilterPick {
  filterKey: string;
  optionCode: string;
  icon: string;
}

export const MAP_QUICK_FILTERS: QuickFilterPick[] = [
  { filterKey: 'beach_type', optionCode: 'sand', icon: '/images/categories/sand-castle.png' },
  { filterKey: 'beach_type', optionCode: 'small_stones', icon: '/images/categories/stones.png' },
  { filterKey: 'beach_type', optionCode: 'grass_beach', icon: '/images/categories/grass-beach.png' },
  { filterKey: 'location_infrastructure', optionCode: 'swimming_pool', icon: '/images/categories/swimming-pool.png' },
  { filterKey: 'natural_location_condition', optionCode: 'natural_shade', icon: '/images/categories/tree.png' },
  { filterKey: 'location_infrastructure', optionCode: 'waterslide', icon: '/images/categories/water-slide.png' },
  { filterKey: 'user_type', optionCode: 'youth', icon: '/images/categories/dance.png' },
  { filterKey: 'culinary_offer', optionCode: 'beach_bar', icon: '/images/categories/stall.png' },
  { filterKey: 'location_infrastructure', optionCode: 'children_playground', icon: '/images/categories/slider.png' },
  { filterKey: 'location_infrastructure', optionCode: 'sports_fields', icon: '/images/categories/tennis-court.png' },
  { filterKey: 'location_infrastructure', optionCode: 'parking', icon: '/images/categories/parking.png' },
  { filterKey: 'accommodation_around', optionCode: 'autocamping', icon: '/images/categories/van.png' },
  { filterKey: 'location_infrastructure', optionCode: 'dog_friendly', icon: '/images/categories/pets.png' },
  { filterKey: 'location_infrastructure', optionCode: 'access_for_disabled', icon: '/images/categories/disability.png' },
  { filterKey: 'user_type', optionCode: 'family', icon: '/images/categories/parents.png' },
];

/**
 * Top Filter Picks - Most popular beach filters to display on homepage
 * Curated list of 12 most commonly used filters for quick access
 */

export interface TopFilterPick {
  filterKey: string;
  optionCode: string;
  icon: string;
  priority: number; // Lower number = higher priority
}

/**
 * Top 12 most popular beach filters
 * Based on user behavior and common search patterns
 */
export const TOP_FILTER_PICKS: TopFilterPick[] = [
  // Beach Types (most essential)
  {
    filterKey: 'beach_type',
    optionCode: 'sand',
    icon: '/images/categories/sand-castle.png',
    priority: 1,
  },
  {
    filterKey: 'beach_type',
    optionCode: 'small_stones',
    icon: '/images/categories/stones.png',
    priority: 2,
  },
  {
    filterKey: 'beach_type',
    optionCode: 'grass_beach',
    icon: '/images/categories/grass-beach.png',
    priority: 3,
  },

  // Infrastructure (highly searched)
  {
    filterKey: 'location_infrastructure',
    optionCode: 'parking',
    icon: '/images/categories/parking.png',
    priority: 4,
  },
  {
    filterKey: 'location_infrastructure',
    optionCode: 'swimming_pool',
    icon: '/images/categories/swimming-pool.png',
    priority: 5,
  },
  {
    filterKey: 'location_infrastructure',
    optionCode: 'dog_friendly',
    icon: '/images/categories/pets.png',
    priority: 6,
  },
  {
    filterKey: 'location_infrastructure',
    optionCode: 'access_for_disabled',
    icon: '/images/categories/disability.png',
    priority: 7,
  },
  {
    filterKey: 'location_infrastructure',
    optionCode: 'waterslide',
    icon: '/images/categories/water-slide.png',
    priority: 8,
  },
  {
    filterKey: 'location_infrastructure',
    optionCode: 'children_playground',
    icon: '/images/categories/slider.png',
    priority: 9,
  },

  // Natural Conditions
  {
    filterKey: 'natural_location_condition',
    optionCode: 'natural_shade',
    icon: '/images/categories/tree.png',
    priority: 10,
  },

  // Accommodation
  {
    filterKey: 'accommodation_around',
    optionCode: 'autocamping',
    icon: '/images/categories/van.png',
    priority: 11,
  },

  // Culinary
  {
    filterKey: 'location_infrastructure',
    optionCode: 'restaurants',
    icon: '/images/categories/stall.png',
    priority: 12,
  },
];

/**
 * Check if a filter option is in top picks
 */
export const isTopPick = (filterKey: string, optionCode: string): boolean => {
  return TOP_FILTER_PICKS.some(
    (pick) => pick.filterKey === filterKey && pick.optionCode === optionCode
  );
};

/**
 * Get icon for a top pick filter
 */
export const getTopPickIcon = (filterKey: string, optionCode: string): string | null => {
  const pick = TOP_FILTER_PICKS.find(
    (p) => p.filterKey === filterKey && p.optionCode === optionCode
  );
  return pick?.icon ?? null;
};


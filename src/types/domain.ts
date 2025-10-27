// Frontend-only domain types (not from backend API)

// UI-specific continent with display properties
export interface ContinentWithUI {
  key: string;
  code: string;
  name: string;
  icon: string;
  beaches_count: number;
}

// UI-specific country with display properties
export interface CountryWithUI {
  nameKey: string;
  code: string;
  name: string;
  full_name: string;
  image: string;
  beachCount: number;
  continent_code: string;
  accomodationCount: number;
  priceKey: string;
}

// Map-related types
export interface MapViewport {
  center: [number, number];
  zoom: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapMarker {
  id: number;
  position: [number, number];
  label: string;
}

// Filter types
export interface BeachFilter {
  beachType: string[];
  userType: string[];
  continent?: string;
  country?: string;
}

export interface FilterState {
  isExpanded: boolean;
  beachType: string[];
  userType: string[];
  searchQuery: string;
}

// Search types
export interface SearchParams {
  query?: string;
  beachType?: string;
  userType?: string;
  continent?: string;
  country?: string;
}


// Icon and image path utilities

// Continent Icons
export const getContinentIcon = (key: string): string => {
  const iconMap: Record<string, string> = {
    'europe': '/images/continents/evropa.png',
    'africa': '/images/continents/africa.png',
    'asia': '/images/continents/asia.png',
    'northAmerica': '/images/continents/north-america.png',
    'southAmerica': '/images/continents/south-america.png',
    'australia': '/images/continents/australia.png',
  };

  return iconMap[key] ?? '/images/continents/default.png';
};

// Country Icons
export const getDefaultCountryImage = (): string => {
  return '/images/topdestination/spain.jpg';
};

// Map Marker Icons
export type MarkerType = 'beach' | 'hotel' | 'restaurant' | 'parking' | 'default';

export const getMarkerIcon = (type: MarkerType = 'beach'): string => {
  const markerMap: Record<MarkerType, string> = {
    beach: '/images/markers/beach-marker.svg',
    hotel: '/images/markers/hotel-marker.svg',
    restaurant: '/images/markers/restaurant-marker.svg',
    parking: '/images/markers/parking-marker.svg',
    default: '/images/markers/beach-marker.svg',
  };

  return markerMap[type] ?? markerMap.default;
};

// Legacy function for backward compatibility
export const getBeachMarkerIcon = (): string => {
  return getMarkerIcon('beach');
};


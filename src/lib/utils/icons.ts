// Icon and image path utilities
export const getContinentIcon = (value = ''): string => {
  const key = value.toLowerCase();

  const iconMap: Record<string, string> = {
    eu: '/images/continents/evropa.png',
    europe: '/images/continents/evropa.png',

    af: '/images/continents/africa.png',
    africa: '/images/continents/africa.png',

    as: '/images/continents/asia.png',
    asia: '/images/continents/asia.png',

    na: '/images/continents/north-america.png',
    'north-america': '/images/continents/north-america.png',

    sa: '/images/continents/south-america.png',
    'south-america': '/images/continents/south-america.png',

    oc: '/images/continents/australia.png',
    australia: '/images/continents/australia.png',
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


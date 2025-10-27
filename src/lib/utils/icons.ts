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


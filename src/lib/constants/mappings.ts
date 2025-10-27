// Mapping constants for countries and continents
// These map API codes to translation keys and vice versa

// Continent Mappings
export const continentCodeToKey: Record<string, string> = {
  'EU': 'europe',
  'AF': 'africa',
  'AS': 'asia',
  'NA': 'northAmerica',
  'SA': 'southAmerica',
  'OC': 'australia', // Oceania maps to australia in translations
};

export const continentKeyToCode: Record<string, string> = {
  'europe': 'EU',
  'africa': 'AF',
  'asia': 'AS',
  'northAmerica': 'NA',
  'southAmerica': 'SA',
  'australia': 'OC',
};

// Country Mappings
export const countryCodeToKey: Record<string, string> = {
  'HR': 'croatia',
  'IT': 'italy',
  'ES': 'spain',
  'GR': 'greece',
  'PT': 'portugal',
  'FR': 'france',
  'SI': 'slovenia',
  'US': 'usa',
  'BR': 'brazil',
  'AU': 'australia',
  'PH': 'philippines',
  'DE': 'germany',
  'GB': 'uk',
  'TR': 'turkey',
  'EG': 'egypt',
  'TH': 'thailand',
  'MX': 'mexico',
  'CA': 'canada',
};

export const countryKeyToCode: Record<string, string> = {
  'croatia': 'HR',
  'italy': 'IT',
  'spain': 'ES',
  'greece': 'GR',
  'portugal': 'PT',
  'france': 'FR',
  'slovenia': 'SI',
  'usa': 'US',
  'brazil': 'BR',
  'australia': 'AU',
  'philippines': 'PH',
  'germany': 'DE',
  'uk': 'GB',
  'turkey': 'TR',
  'egypt': 'EG',
  'thailand': 'TH',
  'mexico': 'MX',
  'canada': 'CA',
};


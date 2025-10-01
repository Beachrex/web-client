import { fetchApiData } from '@/app/utils/apiHelper';
import { type ApiResponse, type Continent } from '@/app/types/api';

export const continentService = {
  // Get all continents with beaches
  async getContinents(locale?: string): Promise<Continent[]> {
    const response = await fetchApiData<ApiResponse<Continent[]>>('/v1/continents', locale);
    return response.data;
  },

  // Get specific continent by code
  async getContinent(code: string, locale?: string): Promise<Continent> {
    const response = await fetchApiData<ApiResponse<Continent>>(`/v1/continents/${code}`, locale);
    return response.data;
  },
};

// Mapping from API continent codes to translation keys
export const continentCodeToKey: Record<string, string> = {
  'EU': 'europe',
  'AF': 'africa',
  'AS': 'asia',
  'NA': 'northAmerica',
  'SA': 'southAmerica',
  'OC': 'australia', // Oceania maps to australia in translations
};

// Mapping from translation keys to API continent codes
export const continentKeyToCode: Record<string, string> = {
  'europe': 'EU',
  'africa': 'AF',
  'asia': 'AS',
  'northAmerica': 'NA',
  'southAmerica': 'SA',
  'australia': 'OC',
};

// Get continent icon path based on translation key
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

import { fetchApiData } from '@/app/utils/apiHelper';
import type { ApiResponse, Country } from '@/app/types/api';

export const countryService = {
  // Get all countries with beaches
  async getCountries(locale?: string): Promise<Country[]> {
    const response = await fetchApiData<ApiResponse<Country[]>>('/v1/countries', locale);
    return response.data;
  },

  // Get countries filtered by continent
  async getCountriesByContinent(continentCode: string, locale?: string): Promise<Country[]> {
    const response = await fetchApiData<ApiResponse<Country[]>>(`/v1/countries?continent=${continentCode}`, locale);
    return response.data;
  },

  // Get specific country by code
  async getCountry(code: string, locale?: string): Promise<Country> {
    const response = await fetchApiData<ApiResponse<Country>>(`/v1/countries/${code}`, locale);
    return response.data;
  },
};

// Mapping from API country codes to translation keys
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

// Mapping from translation keys to API country codes
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

// Default image for all countries since API doesn't provide images yet
export const getDefaultCountryImage = (): string => {
  return '/images/topdestination/spain.jpg';
};

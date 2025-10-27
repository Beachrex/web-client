
import type { Country } from '@/lib/api-client/models/Country';
import type { Continent } from '@/lib/api-client/models/Continent';
import { countryCodeToKey } from '@/lib/constants/mappings';
import { getDefaultCountryImage } from './icons';
import type { ContinentWithUI, CountryWithUI } from '@/types/domain';

/**
 * Transform API Country model to UI-ready model
 */
export const transformCountryToUI = (country: Country): CountryWithUI => {
  const nameKey = countryCodeToKey[country.code ?? ''] ?? (country.code?.toLowerCase() ?? '');

  return {
    nameKey,
    code: country.code ?? '',
    name: country.name ?? '',
    full_name: country.full_name ?? '',
    image: getDefaultCountryImage(),
    beachCount: country.beaches_count ?? 0,
    continent_code: country.continent_code ?? '',
    accomodationCount: 5, // Placeholder
    priceKey: 'priceFrom', // Placeholder
  };
};

/**
 * Transform API Continent model to UI-ready model
 */
export const transformContinentToUI = (continent: Continent, key: string): ContinentWithUI => {
  return {
    key,
    code: continent.code ?? '',
    name: continent.name ?? '',
    icon: '', // Will be set by calling code
    beaches_count: continent.beaches_count ?? 0,
  };
};


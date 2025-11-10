import type { BeachSchema } from '@/lib/api-client/models/BeachSchema';
import type { Continent } from '@/lib/api-client/models/Continent';
import type { Country } from '@/lib/api-client/models/Country';
import { countryCodeToKey } from '@/lib/constants/mappings';
import type { ContinentWithUI, CountryWithUI } from '@/types/domain';
import { OpenAPI } from '../api-client/core/OpenAPI';


/**
 * Transform API Country model to UI-ready model
 */
export const transformCountryToUI = (country: Country): CountryWithUI => {
  const nameKey =
    countryCodeToKey[country.code ?? ''] ?? country.code?.toLowerCase() ?? '';

  return {
    nameKey,
    code: country.code ?? '',
    name: country.name ?? '',
    full_name: country.full_name ?? '',
    image: '/images/topdestination/spain.jpg', // Default image since API doesn't provide images yet
    beachCount: country.beaches_count ?? 0,
    continent_code: country.continent_code ?? '',
    // Placeholder data - will be replaced with real API data later
    accomodationCount: 5,
    priceKey: 'priceFrom',
  };
};

/**
 * Transform API Continent model to UI-ready model
 */
export const transformContinentToUI = (
  continent: Continent,
  key: string,
): ContinentWithUI => {
  return {
    key,
    code: continent.code ?? '',
    name: continent.name ?? '',
    icon: '', // Will be set by calling code
    beaches_count: continent.beaches_count ?? 0,
  };
};

/**
 * Transform API Beach model to UI-ready model
 * - Normalizes coordinates (string → number)
 * - Builds full image URL from relative path
 */
export const transformBeachToUI = (b: BeachSchema) => {
  const latNum =
    typeof b.latitude === 'string'
      ? parseFloat(b.latitude)
      : (b.latitude ?? null);
  const lngNum =
    typeof b.longitude === 'string'
      ? parseFloat(b.longitude)
      : (b.longitude ?? null);

  const mainImage =
  b.main_image?.trim()
    ? b.main_image.startsWith('/')
      ? `${OpenAPI.BASE}${b.main_image}`
      : b.main_image
    : '/images/propertycard/card-banner.jpg';

  return {
    id: b.id ?? 0,
    name: b.name ?? '',
    slug: b.slug ?? '',
    countryCode: b.country_code ?? '',
    countryName: b.country_name ?? '',
    continentCode: b.continent_code ?? '',
    lat: latNum,
    lng: lngNum,
    mainImage,
  };
};

export type BeachUI = ReturnType<typeof transformBeachToUI>;

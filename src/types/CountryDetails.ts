import type { Country, Badge, Article } from '@/lib/api-client/types.gen';

/**
 * CountryDetails
 *
 * API response returns a richer object than the generated Country type.
 * This type extends Country with fields that exist in the real API,
 * but are missing in the OpenAPI schema.
 */
export type CountryDetails = Country & {
  badges?: Badge[];
  articles?: Article[];
  navigation?: {
    previous?: {
      code?: string;
      name?: string;
      slug?: string;
      latitude?: string;
      longitude?: string;
      main_image?: string | null;
      location?: {
        continent_slug?: string | null;
      };
    } | null;
    next?: {
      code?: string;
      name?: string;
      slug?: string;
      latitude?: string;
      longitude?: string;
      main_image?: string | null;
      location?: {
        continent_slug?: string | null;
      };
    } | null;
  };
};

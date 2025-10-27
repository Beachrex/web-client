// Continent mapping utilities for URL handling

export interface ContinentMapping {
  code: string;
  slug: string;
  name: {
    en: string;
    si: string;
  };
}

export const continentMappings: ContinentMapping[] = [
  {
    code: 'EU',
    slug: 'europe',
    name: {
      en: 'Europe',
      si: 'Evropa',
    },
  },
  {
    code: 'AS',
    slug: 'asia',
    name: {
      en: 'Asia',
      si: 'Azija',
    },
  },
  {
    code: 'AF',
    slug: 'africa',
    name: {
      en: 'Africa',
      si: 'Afrika',
    },
  },
  {
    code: 'NA',
    slug: 'north-america',
    name: {
      en: 'North America',
      si: 'Severna Amerika',
    },
  },
  {
    code: 'SA',
    slug: 'south-america',
    name: {
      en: 'South America',
      si: 'Južna Amerika',
    },
  },
  {
    code: 'OC',
    slug: 'oceania',
    name: {
      en: 'Oceania',
      si: 'Oceanija',
    },
  },
];

/**
 * Convert continent URL slug to continent code
 */
export const getContinentCodeFromSlug = (slug: string): string | null => {
  const mapping = continentMappings.find(
    m => m.slug.toLowerCase() === slug.toLowerCase() ||
         m.slug.toLowerCase() === slug.toLowerCase().replace('-', '') ||
         m.code.toLowerCase() === slug.toLowerCase()
  );
  return mapping?.code ?? null;
};

/**
 * Convert continent code to URL slug
 */
export const getContinentSlugFromCode = (code: string): string | null => {
  const mapping = continentMappings.find(m => m.code === code.toUpperCase());
  return mapping?.slug ?? null;
};

/**
 * Get continent name by code and locale
 */
export const getContinentNameByCode = (code: string, locale: 'en' | 'si' = 'en'): string | null => {
  const mapping = continentMappings.find(m => m.code === code.toUpperCase());
  return mapping?.name[locale] ?? null;
};

/**
 * Get all continent slugs for static generation
 */
export const getAllContinentSlugs = (): string[] => {
  return continentMappings.map(m => m.slug);
};

/**
 * Validate if a continent slug is valid
 */
export const isValidContinentSlug = (slug: string): boolean => {
  return continentMappings.some(
    m => m.slug.toLowerCase() === slug.toLowerCase() ||
         m.code.toLowerCase() === slug.toLowerCase()
  );
};

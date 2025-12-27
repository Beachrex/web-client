// src/lib/ui/pageVariants.ts
export type PageVariant =
  | 'continent'
  | 'region'
  | 'island'
  | 'city'
  | 'country'
  | 'beach';


// Main accent color classes (background)
export const VARIANT_BG_CLASS: Record<PageVariant, string> = {
  continent: 'bg-[#5E1CA5]',
  region: 'bg-[#FF2877]',
  island: 'bg-[#FFC422]',
  city: 'bg-[#FF8000]',
  country: 'bg-[#DD0000]',
  beach: 'bg-[#0069AB]',
};

// Main accent color classes (text)
export const VARIANT_TEXT_CLASS: Record<PageVariant, string> = {
  continent: 'text-[#5E1CA5]',
  region: 'text-[#FF2877]',
  island: 'text-[#FFC422]',
  city: 'text-[#FF8000]',
  country: 'text-[#DD0000]',
  beach: 'text-[#0069AB]',
};

// TopBar pill label translation keys (TopBar namespace)
export const VARIANT_PILL_LABEL_KEY: Record<PageVariant, string> = {
  continent: 'continentLabel',
  region: 'regionLabel',
  island: 'islandLabel',
  city: 'cityLabel',
  country: 'countryLabel',
  beach: 'beachLabel',
};

// Banner big background text translation keys (BannerSection namespace)
export const VARIANT_CATEGORY_LABEL_KEY: Record<PageVariant, string> = {
  continent: 'categoryLabelContinent',
  region: 'categoryLabelRegion',
  island: 'categoryLabelIsland',
  city: 'categoryLabelCity',
  country: 'categoryLabelCountry',
  beach: 'categoryLabelBeach',
};

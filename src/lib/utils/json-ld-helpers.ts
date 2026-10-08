import type { BeachDetailsSchema, Country, Continent } from '@/lib/api-client/types.gen';
import { buildBeachImageUrl, buildCdnUrl } from '@/lib/utils/beach-images';
import { env } from '@/env';

const baseUrl = env.NEXT_PUBLIC_BASE_URL;

/**
 * Build Organization JSON-LD structured data
 * Used in the root layout for the entire site
 *
 * @param description - Localized organization description from translations
 * @returns Organization schema object
 */
export function buildOrganizationSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BeachRex',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description,
    sameAs: [
      // Add social media profiles when available
      // 'https://www.facebook.com/beachrex',
      // 'https://www.instagram.com/beachrex',
      // 'https://twitter.com/beachrex',
    ],
  };
}

/**
 * Build WebSite JSON-LD structured data
 * Used in the root layout for search box functionality
 *
 * @returns WebSite schema object
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BeachRex',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Build BreadcrumbList JSON-LD structured data
 *
 * @param items - Array of breadcrumb items with name and url
 * @returns BreadcrumbList schema object
 *
 * @example
 * buildBreadcrumbSchema([
 *   { name: homeLabel, url: 'https://beachrex.com/en' },
 *   { name: 'Europe', url: 'https://beachrex.com/en/beaches/europe' },
 *   { name: 'Croatia', url: 'https://beachrex.com/en/beaches/europe/croatia' },
 * ])
 */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build TouristAttraction JSON-LD structured data for a beach
 *
 * @param beach - Beach data from API
 * @param locale - Current locale
 * @param url - Full URL to the beach page
 * @returns TouristAttraction schema object
 *
 * @example
 * buildBeachSchema(beachData, 'en', 'https://beachrex.com/en/beaches/europe/croatia/split/bacvice-beach')
 */
/** Photos on Beachrex are works of MOJA PLAŽA, d.o.o. (terms of use §6). */
export const PHOTO_COPYRIGHT_HOLDER = 'MOJA PLAŽA, d.o.o.';

/** Licence and permission pages for image structured data (English CMS slugs, stable in the content files). */
const PHOTO_LICENSE_PATH = '/en/p/terms-of-use';
const PHOTO_ACQUIRE_LICENSE_PATH = '/en/p/media-kit';

export function buildBeachImageObjects(beach: BeachDetailsSchema, max = 5): Record<string, unknown>[] {
  const folderName = beach.basic_info?.folder_name;
  const mobileUpload = beach.basic_info?.mobile_upload ?? false;
  const gallery = beach.media?.gallery ?? [];
  if (!folderName || gallery.length === 0) return [];

  const ordered = [...gallery.filter((m) => m.is_primary), ...gallery.filter((m) => !m.is_primary)];
  const base = baseUrl;
  const holder = { '@type': 'Organization', name: PHOTO_COPYRIGHT_HOLDER };
  const name = beach.basic_info?.name ?? undefined;

  return ordered.slice(0, max).flatMap((item) => {
    const url = buildBeachImageUrl(folderName, item.file_name, mobileUpload, 'hero');
    if (!url) return [];
    return [{
      '@type': 'ImageObject',
      contentUrl: url,
      url,
      name,
      // Mobile uploads may be other authors' photos: no claim on those
      ...(mobileUpload ? {} : {
        creator: holder,
        copyrightHolder: holder,
        copyrightNotice: `© ${PHOTO_COPYRIGHT_HOLDER}`,
        creditText: 'Beachrex',
        license: `${base}${PHOTO_LICENSE_PATH}`,
        acquireLicensePage: `${base}${PHOTO_ACQUIRE_LICENSE_PATH}`,
      }),
    }];
  });
}

export function buildBeachSchema(beach: BeachDetailsSchema, locale: string, url: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: beach.basic_info?.name ?? 'Beach',
    description: beach.basic_info?.description ?? undefined,
    url,
  };

  // Add address if available
  const cityName = beach.location?.city?.name;
  const countryName = beach.location?.country?.name;
  if (cityName || countryName) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: cityName ?? undefined,
      addressCountry: countryName ?? undefined,
    };
  }

  // Add geo coordinates if available
  const latitude = beach.basic_info?.latitude;
  const longitude = beach.basic_info?.longitude;
  if (latitude && longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    };
  }

  // Photos as ImageObjects with author and licence (owner, 2026-10-08): Google Images shows the
  // creator, credit and licence details. Primary image first, up to 5, in the large size.
  const images = buildBeachImageObjects(beach);
  if (images.length > 0) {
    schema.image = images;
  }

  return schema;
}

/**
 * Build Place JSON-LD structured data for a country
 *
 * @param country - Country data from API
 * @param locale - Current locale
 * @param url - Full URL to the country page
 * @param description - Localized description from translations (optional)
 * @returns Place schema object
 */
export function buildCountrySchema(
  country: Country,
  locale: string,
  url: string,
  description?: string
) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: country.name,
    url,
  };

  // Add description if provided
  if (description) {
    schema.description = description;
  }

  // Add image if available
  if (country.main_image) {
    const imageUrl = buildCdnUrl(country.main_image, 'list');
    if (imageUrl) {
      schema.image = imageUrl;
    }
  }

  return schema;
}

/**
 * Build Place JSON-LD structured data for a continent
 *
 * @param continent - Continent data from API
 * @param locale - Current locale
 * @param url - Full URL to the continent page
 * @param description - Localized description from translations (optional)
 * @returns Place schema object
 */
export function buildContinentSchema(
  continent: Continent,
  locale: string,
  url: string,
  description?: string
) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: continent.name,
    url,
  };

  // Add description if provided
  if (description) {
    schema.description = description;
  }

  // Add image if available
  if (continent.main_image) {
    const imageUrl = buildCdnUrl(continent.main_image, 'list');
    if (imageUrl) {
      schema.image = imageUrl;
    }
  }

  return schema;
}

/**
 * Build Place JSON-LD for a region, island or city page.
 * `containedInPlace` names the country, so search engines know where the place is.
 */
export function buildDestinationSchema(options: {
  name: string;
  url: string;
  description?: string;
  mainImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  countryName?: string | null;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: options.name,
    url: options.url,
  };

  if (options.description) {
    schema.description = options.description;
  }

  const imageUrl = options.mainImage ? buildCdnUrl(options.mainImage, 'list') : null;
  if (imageUrl) {
    schema.image = imageUrl;
  }

  if (typeof options.latitude === 'number' && typeof options.longitude === 'number') {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: options.latitude,
      longitude: options.longitude,
    };
  }

  if (options.countryName) {
    schema.containedInPlace = { '@type': 'Country', name: options.countryName };
  }

  return schema;
}

/**
 * Build ItemList JSON-LD structured data for a list of beaches
 *
 * @param beaches - Array of beach data
 * @param locale - Current locale
 * @param listName - Name of the list (e.g., "Top Beaches in Croatia")
 * @param listUrl - URL of the list page
 * @returns ItemList schema object
 */
export function buildBeachListSchema(
  beaches: BeachDetailsSchema[],
  locale: string,
  listName: string,
  listUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    url: listUrl,
    numberOfItems: beaches.length,
    itemListElement: beaches.map((beach, index) => {
      const beachName = beach.basic_info?.name ?? 'Beach';
      const beachDescription = beach.basic_info?.description;
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'TouristAttraction',
          name: beachName,
          description: beachDescription ?? undefined,
        },
      };
    }),
  };
}

/**
 * Render JSON-LD script tag
 * Use this in page components to add structured data
 *
 * @param schema - Schema object(s) to render
 * @returns Script tag with JSON-LD data
 *
 * @example
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBeachSchema(...)) }}
 * />
 */
export function renderJsonLd(schema: Record<string, unknown> | Record<string, unknown>[]) {
  return JSON.stringify(schema);
}


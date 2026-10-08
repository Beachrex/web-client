/**
 * Metadata Helper Utilities
 *
 * Helper functions for generating Next.js metadata with localization support
 * Includes hreflang alternate language links, canonical URLs, and OpenGraph metadata
 */

import { locales } from '@/app/config/locales';
import { env } from '@/env';
import type { Metadata } from 'next';
import { getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_BASE_URL from environment variables
 * Defaults to localhost:3000 in development, should be set to production URL in production
 */
function getBaseUrlInternal(): string {
  return env.NEXT_PUBLIC_BASE_URL;
}

/**
 * Get the base URL for the application
 *
 * @returns Base URL (e.g., 'https://www.beachrex.com')
 */
export function getBaseUrl(): string {
  return getBaseUrlInternal();
}

/** Share image for pages without their own (brand package OG image, 1200×630). */
export const DEFAULT_OG_IMAGE_PATH = '/og-image.png';

/** The page's images, or the default share image when it has none (absolute URL for crawlers). */
export function withDefaultShareImage(images?: string[]): string[] {
  return images && images.length > 0 ? images : [`${getBaseUrl()}${DEFAULT_OG_IMAGE_PATH}`];
}

/**
 * Build alternate language links for hreflang tags
 * Generates links for all 14 supported locales
 *
 * @param path - Path without locale prefix (e.g., '/beaches/europe/croatia/split/bacvice-beach')
 * @returns Object with locale keys and full URLs
 *
 * @example
 * buildAlternateLanguages('/beaches/europe/croatia/split/bacvice-beach')
 * // Returns:
 * // {
 * //   'en': 'https://www.beachrex.com/en/beaches/europe/croatia/split/bacvice-beach',
 * //   'si': 'https://www.beachrex.com/si/plaze/europe/croatia/split/bacvice-beach',
 * //   'de': 'https://www.beachrex.com/de/strande/europe/croatia/split/bacvice-beach',
 * //   ...
 * // }
 */
export function buildAlternateLanguages(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  const baseUrl = getBaseUrlInternal();

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${normalizedPath}`;
  }

  // Add x-default for international users (defaults to English)
  alternates['x-default'] = `${baseUrl}/en${normalizedPath}`;

  return alternates;
}

/**
 * hreflang alternates for a page whose path differs per locale (e.g. the localized beaches word):
 * `pathFor(locale)` returns the path without the locale prefix.
 */
export function buildLocalizedAlternates(pathFor: (locale: string) => string): Record<string, string> {
  const baseUrl = getBaseUrlInternal();
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${pathFor(locale)}`;
  }
  alternates['x-default'] = alternates.en ?? `${baseUrl}/en${pathFor('en')}`;
  return alternates;
}

/**
 * Only the page itself as its language version. For pages with localized slugs (continent,
 * country, region, beach, CMS page) the other locales' slugs are unknown here, and
 * `buildAlternateLanguages(path)` would pair the slugs of one locale with every other locale,
 * producing wrong hreflang URLs (TASK-004 SEO). A missing hreflang is better than a wrong one.
 */
export function buildSelfAlternate(locale: string, path: string): Record<string, string> {
  return { [locale]: buildCanonicalUrl(locale, path) };
}

/**
 * Build canonical URL for a page
 *
 * @param locale - Current locale (e.g., 'en', 'si')
 * @param path - Path without locale prefix (e.g., '/beaches/europe/croatia')
 * @returns Full canonical URL
 *
 * @example
 * buildCanonicalUrl('en', '/beaches/europe/croatia')
 * // Returns: 'https://www.beachrex.com/en/beaches/europe/croatia'
 */
export function buildCanonicalUrl(locale: string, path: string): string {
  const baseUrl = getBaseUrlInternal();

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}/${locale}${normalizedPath}`;
}

/**
 * Build OpenGraph metadata object
 *
 * @param options - OpenGraph options
 * @returns OpenGraph metadata object for Next.js Metadata API
 *
 * @example
 * buildOpenGraphMetadata({
 *   title: 'Bačvice Beach - Split, Croatia',
 *   description: 'Discover the beautiful Bačvice Beach...',
 *   url: 'https://www.beachrex.com/en/beaches/europe/croatia/split/bacvice-beach',
 *   images: ['https://cdn.beachrex.com/img/beaches/bacvice.jpg'],
 *   locale: 'en',
 *   type: 'website'
 * })
 */
export function buildOpenGraphMetadata(options: {
  title: string;
  description: string;
  url: string;
  images?: string[];
  locale?: string;
  type?: 'website' | 'article';
  siteName?: string;
}): Metadata['openGraph'] {
  return {
    title: options.title,
    description: options.description,
    url: options.url,
    siteName: options.siteName ?? 'BeachRex',
    locale: options.locale ?? 'en',
    type: options.type ?? 'website',
    images: withDefaultShareImage(options.images),
  };
}

/**
 * Build Twitter Card metadata object
 *
 * @param options - Twitter Card options
 * @returns Twitter Card metadata object for Next.js Metadata API
 *
 * @example
 * buildTwitterCardMetadata({
 *   title: 'Bačvice Beach - Split, Croatia',
 *   description: 'Discover the beautiful Bačvice Beach...',
 *   images: ['https://cdn.beachrex.com/img/beaches/bacvice.jpg'],
 *   card: 'summary_large_image'
 * })
 */
export function buildTwitterCardMetadata(options: {
  title: string;
  description: string;
  images?: string[];
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  creator?: string;
  site?: string;
}): Metadata['twitter'] {
  return {
    card: options.card ?? 'summary_large_image',
    title: options.title,
    description: options.description,
    images: withDefaultShareImage(options.images),
    creator: options.creator,
    site: options.site ?? '@BeachRex',
  };
}

/**
 * Build complete metadata object with all SEO tags
 * Includes title, description, canonical URL, hreflang, OpenGraph, and Twitter Card
 *
 * @param options - Metadata options
 * @returns Complete Metadata object for Next.js
 *
 * @example
 * buildCompleteMetadata({
 *   title: 'Bačvice Beach - Split, Croatia | BeachRex',
 *   description: 'Discover the beautiful Bačvice Beach in Split, Croatia...',
 *   locale: 'en',
 *   path: '/beaches/europe/croatia/split/bacvice-beach',
 *   images: ['https://cdn.beachrex.com/img/beaches/bacvice.jpg'],
 *   type: 'website'
 * })
 */
export function buildCompleteMetadata(options: {
  title: string;
  description: string;
  locale: string;
  path: string;
  images?: string[];
  type?: 'website' | 'article';
  keywords?: string[];
  author?: string;
  alternateLanguages?: Record<string, string>;
}): Metadata {
  const canonicalUrl = buildCanonicalUrl(options.locale, options.path);
  const alternateLanguages = options.alternateLanguages ?? buildAlternateLanguages(options.path);

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    authors: options.author ? [{ name: options.author }] : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: buildOpenGraphMetadata({
      title: options.title,
      description: options.description,
      url: canonicalUrl,
      images: options.images,
      locale: options.locale,
      type: options.type,
    }),
    twitter: buildTwitterCardMetadata({
      title: options.title,
      description: options.description,
      images: options.images,
    }),
  };
}

/**
 * Build beach-specific alternate language links
 * Handles localized "beaches" word in URLs
 *
 * @param beachSlug - Beach slug (e.g., 'bacvice-beach')
 * @param continentSlug - Continent slug (e.g., 'europe')
 * @param countrySlug - Country slug (e.g., 'croatia')
 * @param regionSlug - Region slug (optional, e.g., 'dalmatia')
 * @param islandSlug - Island slug (optional, e.g., 'hvar')
 * @param citySlug - City slug (optional, e.g., 'split')
 * @returns Object with locale keys and full URLs
 *
 * @example
 * buildBeachAlternateLanguages('bacvice-beach', 'europe', 'croatia', null, null, 'split')
 * // Returns:
 * // {
 * //   'en': 'https://www.beachrex.com/en/beaches/europe/croatia/split/bacvice-beach',
 * //   'si': 'https://www.beachrex.com/si/plaze/europe/croatia/split/bacvice-beach',
 * //   ...
 * // }
 */
export function buildBeachAlternateLanguages(
  beachSlug: string,
  continentSlug: string,
  countrySlug: string,
  regionSlug?: string | null,
  islandSlug?: string | null,
  citySlug?: string | null
): Record<string, string> {
  const alternates: Record<string, string> = {};
  const baseUrl = getBaseUrlInternal();

  for (const locale of locales) {
    // Use the centralized getBeachesWord function to avoid duplication
    const beachesWord = getBeachesWord(locale);

    // Build path segments
    const segments = [beachesWord, continentSlug, countrySlug];

    // Add optional segments if they exist
    if (regionSlug) segments.push(regionSlug);
    if (islandSlug) segments.push(islandSlug);
    if (citySlug) segments.push(citySlug);

    // Add beach slug
    segments.push(beachSlug);

    // Build full URL
    alternates[locale] = `${baseUrl}/${locale}/${segments.join('/')}`;
  }

  // Add x-default (English)
  const enSegments = ['beaches', continentSlug, countrySlug];
  if (regionSlug) enSegments.push(regionSlug);
  if (islandSlug) enSegments.push(islandSlug);
  if (citySlug) enSegments.push(citySlug);
  enSegments.push(beachSlug);

  alternates['x-default'] = `${baseUrl}/en/${enSegments.join('/')}`;

  return alternates;
}


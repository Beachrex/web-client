// Initialize OpenAPI client with locale headers
// This should be called before making API requests

import { OpenAPI } from './OpenAPI';

/**
 * Initialize the OpenAPI client with the current locale
 * @param locale - Current locale (e.g., 'en', 'si')
 */
export function initOpenAPIClient(locale = 'en') {
  // Map 'si' to 'sl' for API (Slovenian locale)
  const apiLocale = locale === 'si' ? 'sl' : locale;

  // Set headers with Accept-Language
  OpenAPI.HEADERS = {
    'Accept-Language': apiLocale,
  };
}

/**
 * Update locale headers for subsequent requests
 * @param locale - New locale to use
 */
export function updateLocale(locale: string) {
  initOpenAPIClient(locale);
}


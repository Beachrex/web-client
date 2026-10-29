/**
 * Server-side data for the region, island and city pages.
 *
 * These pages used to fetch everything in the browser (react-query hooks), so the server HTML had
 * no name, no h1 and no beach cards (TASK-004 SEO follow-up). The page route now loads the same
 * data with the same queries the hooks used and passes it to the page components as props.
 */

import {
  getBeaches,
  getCities,
  getCity,
  getIsland,
  getIslands,
  getMostVisitedBeaches,
  getRegion,
} from '@/lib/api-client';
import type {
  AcceptLanguage,
  BeachListResponseSchema,
  BeachSchema,
  City,
  GetCityResponse,
  GetIslandResponse,
  GetRegionResponse,
  Island,
} from '@/lib/api-client/types.gen';
import { BEACH_PAGE_SIZE, placeFilterValue } from '@/lib/utils/beach-list';

export type RegionDetails = NonNullable<GetRegionResponse['data']>;
export type IslandDetails = NonNullable<GetIslandResponse['data']>;
export type CityDetails = NonNullable<GetCityResponse['data']>;

/** Same limit as the client hooks used for the "popular beaches" section. */
export const MOST_VISITED_LIMIT = 20;

export interface RegionPageData {
  details: RegionDetails;
  cities: City[];
  islands: Island[];
  mostVisited: BeachSchema[];
  /** Filters of the "Browse all beaches" list (place code) and its first page, rendered on the server. */
  listFilters: Record<string, string | number>;
  firstPage: BeachListResponseSchema | null;
}

export interface IslandPageData {
  details: IslandDetails;
  cities: City[];
  mostVisited: BeachSchema[];
  /** Filters of the "Browse all beaches" list (place code) and its first page, rendered on the server. */
  listFilters: Record<string, string | number>;
  firstPage: BeachListResponseSchema | null;
}

export interface CityPageData {
  details: CityDetails;
  mostVisited: BeachSchema[];
  /** Filters of the "Browse all beaches" list (place code) and its first page, rendered on the server. */
  listFilters: Record<string, string | number>;
  firstPage: BeachListResponseSchema | null;
}

const languageHeaders = (locale: string) => ({ 'Accept-Language': locale as AcceptLanguage });

/** Region details only (metadata). `null` when the API has no such region. */
export async function fetchRegionDetails(slug: string, locale: string): Promise<RegionDetails | null> {
  const response = await getRegion({ path: { slug }, headers: languageHeaders(locale) });
  return response.data?.data ?? null;
}

export async function fetchIslandDetails(slug: string, locale: string): Promise<IslandDetails | null> {
  const response = await getIsland({ path: { slug }, headers: languageHeaders(locale) });
  return response.data?.data ?? null;
}

export async function fetchCityDetails(slug: string, locale: string): Promise<CityDetails | null> {
  const response = await getCity({ path: { slug }, headers: languageHeaders(locale) });
  return response.data?.data ?? null;
}

/** First page of the "Browse all beaches" list for these filters (same query as the client's page 1). */
export async function fetchFirstBeachPage(
  filters: Record<string, string | number>,
  locale: string,
): Promise<BeachListResponseSchema | null> {
  const response = await getBeaches({
    query: { ...filters, page: 1, per_page: BEACH_PAGE_SIZE, sort: 'popular' } as never,
    headers: languageHeaders(locale),
  });
  return response.data ?? null;
}

export async function fetchRegionPageData(slug: string, locale: string): Promise<RegionPageData | null> {
  const headers = languageHeaders(locale);
  const details = await fetchRegionDetails(slug, locale);
  if (!details) return null;

  const code = details.code ?? slug;
  const listFilters = { region: placeFilterValue(details, slug) };
  const [cities, islands, mostVisited, firstPage] = await Promise.all([
    getCities({ query: { region_code: slug }, headers }),
    getIslands({ query: { region_code: slug }, headers }),
    getMostVisitedBeaches({ query: { region_code: code, limit: MOST_VISITED_LIMIT }, headers }),
    fetchFirstBeachPage(listFilters, locale),
  ]);

  return {
    details,
    cities: cities.data?.data ?? [],
    islands: islands.data?.data ?? [],
    mostVisited: mostVisited.data?.data ?? [],
    listFilters,
    firstPage,
  };
}

export async function fetchIslandPageData(slug: string, locale: string): Promise<IslandPageData | null> {
  const headers = languageHeaders(locale);
  const details = await fetchIslandDetails(slug, locale);
  if (!details) return null;

  const code = details.code ?? slug;
  const listFilters = { island: placeFilterValue(details, slug) };
  const [cities, mostVisited, firstPage] = await Promise.all([
    getCities({ query: { island_code: slug }, headers }),
    getMostVisitedBeaches({ query: { island_code: code, limit: MOST_VISITED_LIMIT }, headers }),
    fetchFirstBeachPage(listFilters, locale),
  ]);

  return {
    details,
    cities: cities.data?.data ?? [],
    mostVisited: mostVisited.data?.data ?? [],
    listFilters,
    firstPage,
  };
}

export async function fetchCityPageData(slug: string, locale: string): Promise<CityPageData | null> {
  const details = await fetchCityDetails(slug, locale);
  if (!details) return null;

  const listFilters = { city: placeFilterValue(details, slug) };
  const [mostVisited, firstPage] = await Promise.all([
    getMostVisitedBeaches({
      query: { city_code: details.code ?? slug, limit: MOST_VISITED_LIMIT },
      headers: languageHeaders(locale),
    }),
    fetchFirstBeachPage(listFilters, locale),
  ]);

  return {
    details,
    mostVisited: mostVisited.data?.data ?? [],
    listFilters,
    firstPage,
  };
}

/**
 * Server-side data for the region, island and city pages.
 *
 * These pages used to fetch everything in the browser (react-query hooks), so the server HTML had
 * no name, no h1 and no beach cards (TASK-004 SEO follow-up). The page route now loads the same
 * data with the same queries the hooks used and passes it to the page components as props.
 */

import {
  getCities,
  getCity,
  getIsland,
  getIslands,
  getMostVisitedBeaches,
  getRegion,
} from '@/lib/api-client';
import type {
  AcceptLanguage,
  BeachSchema,
  City,
  GetCityResponse,
  GetIslandResponse,
  GetRegionResponse,
  Island,
} from '@/lib/api-client/types.gen';

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
}

export interface IslandPageData {
  details: IslandDetails;
  cities: City[];
  mostVisited: BeachSchema[];
}

export interface CityPageData {
  details: CityDetails;
  mostVisited: BeachSchema[];
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

export async function fetchRegionPageData(slug: string, locale: string): Promise<RegionPageData | null> {
  const headers = languageHeaders(locale);
  const [details, cities, islands, mostVisited] = await Promise.all([
    fetchRegionDetails(slug, locale),
    getCities({ query: { region_code: slug }, headers }),
    getIslands({ query: { region_code: slug }, headers }),
    getMostVisitedBeaches({ query: { region_code: slug, limit: MOST_VISITED_LIMIT }, headers }),
  ]);

  if (!details) return null;

  return {
    details,
    cities: cities.data?.data ?? [],
    islands: islands.data?.data ?? [],
    mostVisited: mostVisited.data?.data ?? [],
  };
}

export async function fetchIslandPageData(slug: string, locale: string): Promise<IslandPageData | null> {
  const headers = languageHeaders(locale);
  const [details, cities, mostVisited] = await Promise.all([
    fetchIslandDetails(slug, locale),
    getCities({ query: { island_code: slug }, headers }),
    getMostVisitedBeaches({ query: { island_code: slug, limit: MOST_VISITED_LIMIT }, headers }),
  ]);

  if (!details) return null;

  return {
    details,
    cities: cities.data?.data ?? [],
    mostVisited: mostVisited.data?.data ?? [],
  };
}

export async function fetchCityPageData(slug: string, locale: string): Promise<CityPageData | null> {
  const [details, mostVisited] = await Promise.all([
    fetchCityDetails(slug, locale),
    getMostVisitedBeaches({
      query: { city_code: slug, limit: MOST_VISITED_LIMIT },
      headers: languageHeaders(locale),
    }),
  ]);

  if (!details) return null;

  return {
    details,
    mostVisited: mostVisited.data?.data ?? [],
  };
}

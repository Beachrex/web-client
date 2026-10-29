import { locales, toHtmlLang } from '@/app/config/locales';
import { getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * Pre-launch SEO (2026-10-23): one URL per beach/place and language, and hreflang for all 19 languages.
 *
 * Continent, country and island slugs are translated ("europe/croatia" → "evropa/hrvaska", "sardinia" →
 * "sardinija"); region, city and beach slugs are the same in every language. Pages and sitemaps used to
 * pair one language's slugs with every other language, which produced duplicate URLs (both
 * /si/plaze/europe/croatia/… and /si/plaze/evropa/hrvaska/… answered) and wrong hreflang links.
 *
 * The slugs per language come from the list endpoints (continents, countries, regions, islands, cities),
 * fetched once per language and cached for a day.
 */
export interface PlaceRef {
  continent?: string | null; // continent code, e.g. EU
  country?: string | null; // country code, e.g. HR
  regionId?: number | null;
  islandId?: number | null;
  cityId?: number | null;
  beach?: string | null; // beach slug (same in every language)
}

export interface LocaleSlugs {
  continent: Map<string, string>;
  country: Map<string, string>;
  countryContinent: Map<string, string>;
  region: Map<number, string>;
  island: Map<number, string>;
  city: Map<number, string>;
}

export type PlaceSlugs = Record<string, LocaleSlugs>;

interface Row {
  code?: string;
  id?: number;
  slug?: string | null;
  continent_code?: string | null;
}

const DAY = 86400;

async function list(apiEndpoint: string, path: string, locale: string): Promise<Row[]> {
  try {
    const res = await fetch(`${apiEndpoint}/api/v1/${path}`, {
      headers: { 'Accept-Language': locale, Accept: 'application/json' },
      next: { revalidate: DAY },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Row[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

const HOUR_MS = 3_600_000;
const RETRY_MS = 60_000;
let memo: { endpoint: string; until: number; value: Promise<PlaceSlugs> } | null = null;

/**
 * Slugs of every continent, country, region, island and city in every language, kept in memory for an hour.
 *
 * Dev slowdown 2026-10-26: every beach and place render (page and metadata) re-read the lists, about 19 MB of
 * JSON (the cities list is ~1 MB per language), and built the maps again. The front container grew to ~3 GB,
 * garbage collection stalled every request for seconds and the process restarted. One shared copy per process
 * now; a load where a list came back empty (API hiccup) is retried after a minute instead of an hour.
 */
export function loadPlaceSlugs(apiEndpoint: string): Promise<PlaceSlugs> {
  const now = Date.now();
  if (memo?.endpoint === apiEndpoint && memo.until > now) return memo.value;
  const value = fetchPlaceSlugs(apiEndpoint);
  const entry = { endpoint: apiEndpoint, until: now + HOUR_MS, value };
  memo = entry;
  value.then(
    (slugs) => {
      if (!isComplete(slugs)) entry.until = Date.now() + RETRY_MS;
    },
    () => {
      if (memo === entry) memo = null;
    },
  );
  return value;
}

/** Every language has countries and cities (an empty list means the API did not answer). */
export function isComplete(slugs: PlaceSlugs): boolean {
  return locales.every((l) => (slugs[l]?.country.size ?? 0) > 0 && (slugs[l]?.city.size ?? 0) > 0);
}

/** Test hook: forget the cached slugs. */
export function resetPlaceSlugsCache(): void {
  memo = null;
}

/** The five list requests per language behind `loadPlaceSlugs`. */
async function fetchPlaceSlugs(apiEndpoint: string): Promise<PlaceSlugs> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const [continents, countries, regions, islands, cities] = await Promise.all([
        list(apiEndpoint, 'continents', locale),
        list(apiEndpoint, 'countries', locale),
        list(apiEndpoint, 'regions', locale),
        list(apiEndpoint, 'islands', locale),
        list(apiEndpoint, 'cities?limit=5000', locale),
      ]);
      const byCode = (rows: Row[]) => {
        const map = new Map<string, string>();
        for (const r of rows) if (r.code && r.slug) map.set(r.code, r.slug);
        return map;
      };
      const byId = (rows: Row[]) => {
        const map = new Map<number, string>();
        for (const r of rows) if (typeof r.id === 'number' && r.slug) map.set(r.id, r.slug);
        return map;
      };
      const countryContinent = new Map<string, string>();
      for (const r of countries) if (r.code && r.continent_code) countryContinent.set(r.code, r.continent_code);
      const slugs: LocaleSlugs = {
        continent: byCode(continents),
        country: byCode(countries),
        countryContinent,
        region: byId(regions),
        island: byId(islands),
        city: byId(cities),
      };
      return [locale, slugs] as const;
    }),
  );
  return Object.fromEntries(entries);
}

/**
 * The path of a place in one language, without the locale prefix: `/plaze/evropa/hrvaska/istra/duba/spina`.
 * Null when a slug is unknown in that language (better no hreflang than a wrong one).
 */
export function placePath(slugs: PlaceSlugs, locale: string, ref: PlaceRef): string | null {
  const s = slugs[locale];
  if (!s || (!ref.country && !ref.continent)) return null;
  const continentCode = ref.continent ?? (ref.country ? s.countryContinent.get(ref.country) : undefined);
  const parts: string[] = [getBeachesWord(locale)];

  const continent = continentCode ? s.continent.get(continentCode) : undefined;
  if (!continent) return null;
  parts.push(continent);
  if (!ref.country) return `/${parts.join('/')}`; // continent page
  const country = s.country.get(ref.country);
  if (!country) return null;
  parts.push(country);

  for (const [id, map] of [
    [ref.regionId, s.region],
    [ref.islandId, s.island],
    [ref.cityId, s.city],
  ] as const) {
    if (id === null || id === undefined) continue;
    const slug = map.get(id);
    if (!slug) return null;
    parts.push(slug);
  }
  if (ref.beach) parts.push(ref.beach);
  return `/${parts.join('/')}`;
}

/** hreflang → absolute URL for every language the place has a path in, plus x-default (English). */
export function placeAlternates(slugs: PlaceSlugs, ref: PlaceRef, baseUrl: string): Record<string, string> {
  const base = baseUrl.replace(/\/$/, '');
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    const path = placePath(slugs, locale, ref);
    if (path) alternates[toHtmlLang(locale)] = `${base}/${locale}${path}`;
  }
  if (alternates.en) alternates['x-default'] = alternates.en;
  return alternates;
}

type Loc = { code?: string | null; id?: number | null; slug?: string | null } | null | undefined;

/** A beach from the beach-details API as a place reference (region/island/city only when in the path). */
export function beachPlaceRef(beach: {
  basic_info?: { slug?: string | null } | null;
  location?: { continent?: Loc; country?: Loc; region?: Loc; island?: Loc; city?: Loc } | null;
}): PlaceRef {
  const l = beach.location;
  const id = (p: Loc) => (p?.slug && typeof p.id === 'number' ? p.id : null);
  return {
    continent: l?.continent?.code ?? null,
    country: l?.country?.code ?? null,
    regionId: id(l?.region),
    islandId: id(l?.island),
    cityId: id(l?.city),
    beach: beach.basic_info?.slug ?? null,
  };
}

/** A region, island or city from its details API as a place reference. */
export function destinationPlaceRef(kind: 'region' | 'island' | 'city', details: Record<string, unknown>): PlaceRef {
  const n = (v: unknown) => (typeof v === 'number' ? v : null);
  const country =
    (typeof details.country_code === 'string' && details.country_code) ||
    ((details.country as { code?: string } | undefined)?.code ?? null);
  return {
    country,
    regionId: kind === 'region' ? n(details.id) : n(details.region_id),
    islandId: kind === 'island' ? n(details.id) : kind === 'city' ? n(details.island_id) : null,
    cityId: kind === 'city' ? n(details.id) : null,
  };
}

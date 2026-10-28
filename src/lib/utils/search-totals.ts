/**
 * Owner 2026-10-28: "France" showed "Beaches 10" although France has ~400 beaches: the tab badges counted the items
 * returned (10 per type). The API now sends the real totals in `meta` (backend ADR 2026-10-28 "Search counts are real
 * totals; a place name scopes the result").
 *
 * The generated API client (`src/lib/api-client`) does not have these fields yet (`yarn generate:api` drifts, see
 * backend docs/HANDOFF.md open items), so they are read here with a small typed parser.
 */
import { intlLocale } from '@/lib/utils/itinerary';
import type { SearchResultType } from '@/lib/utils/search-tabs';

export type SearchTotals = Partial<Record<SearchResultType, number>>;

/** The place the query names exactly; the lower result types are limited to it. */
export interface SearchPlace {
  type: Exclude<SearchResultType, 'beach'>;
  id: number;
  code: string | null;
  name: string;
}

export interface SearchMeta {
  totals: SearchTotals | null;
  place: SearchPlace | null;
}

/** API group key → result type. */
const GROUP_TYPE: Record<string, SearchResultType> = {
  beaches: 'beach',
  cities: 'city',
  islands: 'island',
  regions: 'region',
  countries: 'country',
};

const PLACE_TYPES = ['country', 'region', 'island', 'city'] as const;

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

/** Reads `meta.totals_by_type` and `meta.place`; anything missing or malformed → null (old API: item counts). */
export function parseSearchMeta(meta: unknown): SearchMeta {
  const m = (meta && typeof meta === 'object' ? meta : {}) as Record<string, unknown>;

  let totals: SearchTotals | null = null;
  const rawTotals = m.totals_by_type;
  if (rawTotals && typeof rawTotals === 'object') {
    totals = {};
    for (const [group, value] of Object.entries(rawTotals as Record<string, unknown>)) {
      const type = GROUP_TYPE[group];
      if (type && isCount(value)) totals[type] = value;
    }
  }

  let place: SearchPlace | null = null;
  const p = m.place as Record<string, unknown> | null | undefined;
  if (
    p && typeof p === 'object'
    && (PLACE_TYPES as readonly string[]).includes(p.type as string)
    && typeof p.id === 'number'
    && typeof p.name === 'string' && p.name !== ''
  ) {
    place = {
      type: p.type as SearchPlace['type'],
      id: p.id,
      code: typeof p.code === 'string' && p.code !== '' ? p.code : null,
      name: p.name,
    };
  }

  return { totals, place };
}

/** Badge number: "87", "412", "1.2K" / "1,2 tis." (localized, compact from 1 000 on). */
export function formatCount(count: number, locale: string): string {
  const loc = intlLocale(locale);
  try {
    if (count < 1000) return new Intl.NumberFormat(loc).format(count);
    return new Intl.NumberFormat(loc, { notation: 'compact', maximumFractionDigits: 1 }).format(count);
  } catch {
    return String(count);
  }
}

/**
 * Owner 2026-10-22: the search dropdown mixed beaches, cities, regions and the country in one long list
 * ("albanija" listed the country last). Results are now grouped into tabs, and the "All" tab puts the
 * closest name matches first.
 */
export type SearchResultType = 'beach' | 'city' | 'island' | 'region' | 'country';
export type SearchTab = 'all' | SearchResultType;

/** Tab order after "All". */
export const SEARCH_TYPE_ORDER: SearchResultType[] = ['beach', 'city', 'island', 'region', 'country'];

export interface SearchTabInfo {
  tab: SearchTab;
  count: number;
}

/** Lowercase, without diacritics and surrounding spaces: "Drač " → "drac". */
export function normalizeSearchText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** 0 = the name is the query, 1 = the name starts with it, 2 = a word starts with it, 3 = anything else. */
export function matchRank(name: string, query: string): number {
  const n = normalizeSearchText(name);
  const q = normalizeSearchText(query);
  if (!q) return 3;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(/[\s\-–,./()]+/).some((w) => w.startsWith(q))) return 2;
  return 3;
}

/**
 * "All": closest name matches first; equal matches keep the API order (beaches, cities, islands, regions,
 * countries). A type tab: only that type, in the API order.
 */
export function resultsForTab<T extends { type: SearchResultType; name: string }>(
  results: T[],
  tab: SearchTab,
  query: string,
): T[] {
  if (tab !== 'all') return results.filter((r) => r.type === tab);
  return results
    .map((r, i) => ({ r, i, rank: matchRank(r.name, query) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((x) => x.r);
}

/**
 * "All" plus one tab per type that has results; no tabs (empty list) when there is only one type.
 * `totals` (API `meta.totals_by_type`, owner 2026-10-28) are the real match counts; without them a tab counts the
 * items returned. A total is never shown below the items listed. "All" is the sum of the tab counts.
 */
export function searchTabs(
  results: { type: SearchResultType }[],
  totals?: Partial<Record<SearchResultType, number>> | null,
): SearchTabInfo[] {
  const counts = SEARCH_TYPE_ORDER
    .map((type) => {
      const shown = results.filter((r) => r.type === type).length;
      return { tab: type as SearchTab, shown, count: Math.max(shown, totals?.[type] ?? 0) };
    })
    .filter((t) => t.shown > 0)
    .map(({ tab, count }) => ({ tab, count }));
  if (counts.length < 2) return [];
  return [{ tab: 'all', count: counts.reduce((sum, t) => sum + t.count, 0) }, ...counts];
}

/**
 * The type tab (or the only type, when there are no tabs) has more matches than it lists → what to tell the visitor
 * ("10 of 412"); null otherwise.
 */
export function moreMatches(
  results: { type: SearchResultType }[],
  totals: Partial<Record<SearchResultType, number>> | null | undefined,
  tab: SearchTab,
): { type: SearchResultType; shown: number; total: number } | null {
  const present = SEARCH_TYPE_ORDER.filter((type) => results.some((r) => r.type === type));
  const type = tab !== 'all' ? tab : present.length === 1 ? present[0] : null;
  if (!type) return null;
  const shown = results.filter((r) => r.type === type).length;
  const total = totals?.[type] ?? 0;
  return shown > 0 && total > shown ? { type, shown, total } : null;
}

/** Map filter key per place type (`?country=GR`, `?region=attiki`, …), see the beach map filters. */
export const MAP_FILTER_KEY: Record<Exclude<SearchResultType, 'beach'>, string> = {
  country: 'country',
  region: 'region',
  island: 'island',
  city: 'city',
};

/**
 * Owner 2026-10-22, "Show all" in the search dropdown: the place the query names (exact or prefix match on a
 * country, region, island or city, closest first), or null when the query only matches beaches.
 */
export function showAllTarget<T extends { type: SearchResultType; name: string; code?: string }>(
  results: T[],
  query: string,
): (T & { type: Exclude<SearchResultType, 'beach'>; code: string }) | null {
  const place = resultsForTab(results, 'all', query).find(
    (r) => r.type !== 'beach' && Boolean(r.code) && matchRank(r.name, query) <= 1,
  );
  return (place as (T & { type: Exclude<SearchResultType, 'beach'>; code: string }) | undefined) ?? null;
}

/** Query string for the beach map filtered to that place. */
export function showAllQuery(target: { type: Exclude<SearchResultType, 'beach'>; code: string }): string {
  return new URLSearchParams({ [MAP_FILTER_KEY[target.type]]: target.code }).toString();
}

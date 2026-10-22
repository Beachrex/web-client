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

/** "All" plus one tab per type that has results; no tabs (empty list) when there is only one type. */
export function searchTabs(results: { type: SearchResultType }[]): SearchTabInfo[] {
  const counts = SEARCH_TYPE_ORDER
    .map((type) => ({ tab: type as SearchTab, count: results.filter((r) => r.type === type).length }))
    .filter((t) => t.count > 0);
  if (counts.length < 2) return [];
  return [{ tab: 'all', count: results.length }, ...counts];
}

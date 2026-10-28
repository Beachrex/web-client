/**
 * Sort order for destination lists (countries, regions, cities, islands).
 * Used by the continent/world countries list and the sub-lists on country, region and island pages.
 */
export type DestinationSort = 'name' | 'beaches_desc' | 'beaches_asc';

export const DESTINATION_SORTS: readonly DestinationSort[] = ['name', 'beaches_desc', 'beaches_asc'];

/** Default order: alphabetical (same as the original continent countries list). */
export const DEFAULT_DESTINATION_SORT: DestinationSort = 'name';

// App locale codes that differ from BCP 47 (used for alphabetical collation)
const COLLATION_LOCALE: Record<string, string> = { si: 'sl', ua: 'uk' };

export function collationLocale(locale: string): string {
  return COLLATION_LOCALE[locale] ?? locale;
}

export function isDestinationSort(value: unknown): value is DestinationSort {
  return typeof value === 'string' && (DESTINATION_SORTS as readonly string[]).includes(value);
}

interface Sortable {
  name?: string | null;
  beaches_count?: number | null;
}

/**
 * Returns a new sorted array. Alphabetical uses a locale-aware collator (š/č/ž in their proper place);
 * beach-count sorts fall back to the name on ties. Missing counts count as 0.
 */
export function sortDestinations<T extends Sortable>(items: readonly T[], sort: DestinationSort, locale: string): T[] {
  const collator = new Intl.Collator(collationLocale(locale), { sensitivity: 'base' });
  const byName = (a: T, b: T) => collator.compare(a.name ?? '', b.name ?? '');

  return [...items].sort((a, b) => {
    if (sort === 'name') return byName(a, b);
    const diff = (a.beaches_count ?? 0) - (b.beaches_count ?? 0);
    if (diff !== 0) return sort === 'beaches_asc' ? diff : -diff;
    return byName(a, b);
  });
}

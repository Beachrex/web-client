/** Cards per page of the "Browse all beaches" list (server-side pages of GET /beaches). */
export const BEACH_PAGE_SIZE = 16;

/**
 * Value for the `city` / `region` / `island` list filters: the place's code (or id). The API filters by
 * code; slugs are per language and only sometimes equal the code (Risskov worked, most places did not).
 */
export function placeFilterValue(
  place: { code?: string | null; id?: number | null },
  fallback: string,
): string | number {
  return place.code ?? place.id ?? fallback;
}

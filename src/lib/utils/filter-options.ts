/** One option of a /beaches/filters group. Boolean filters (parking, has_swimming_pool) used to send only `value`. */
export interface FilterOptionLike {
  id?: number;
  code?: string;
  slug?: string;
  value?: string;
}

/**
 * Whether a selected filter value belongs to an option: by code, slug, id or value.
 * Matching only code/slug/id dropped the parking and swimming-pool filters (mobile report 2026-10-09).
 */
export function optionMatches(option: FilterOptionLike, selected: string | number | boolean): boolean {
  const v = String(selected);
  return (
    option.code === v ||
    option.slug === v ||
    (option.id !== undefined && String(option.id) === v) ||
    option.value === v
  );
}

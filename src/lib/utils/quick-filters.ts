import type { QuickFilterPick } from '@/config/mapQuickFilters';

type FilterValue = string | number | boolean | undefined;

/** A group of GET /beaches/filters; option shapes differ per group, so only code and name are read. */
interface FilterGroup {
  options?: Record<string, unknown>[];
}

export interface QuickFilterTile {
  filterKey: string;
  code: string;
  label: string;
  icon: string;
}

/** The picks the API offers, labelled with the API option name (in the request locale). */
export function resolveQuickFilters(
  picks: QuickFilterPick[],
  filterOptions: Record<string, FilterGroup | undefined> | null | undefined
): QuickFilterTile[] {
  if (!filterOptions) return [];
  return picks.flatMap((pick) => {
    const option = filterOptions[pick.filterKey]?.options?.find((o) => o.code === pick.optionCode);
    const label = option?.name;
    if (typeof label !== 'string' || label === '') return [];
    return [{ filterKey: pick.filterKey, code: pick.optionCode, label, icon: pick.icon }];
  });
}

/** Every option of one filter group, in API order, labelled with the API name; unnamed options are skipped. */
export function resolveAllFilterOptions(
  filterKey: string,
  icons: Record<string, string>,
  fallbackIcon: string,
  filterOptions: Record<string, FilterGroup | undefined> | null | undefined
): QuickFilterTile[] {
  return (filterOptions?.[filterKey]?.options ?? []).flatMap((option) => {
    const { code, name } = option;
    if (typeof code !== 'string' || code === '' || typeof name !== 'string' || name === '') return [];
    return [{ filterKey, code, label: name, icon: icons[code] ?? fallbackIcon }];
  });
}

const splitValues = (value: FilterValue): string[] =>
  value === undefined || value === '' ? [] : String(value).split(',').filter(Boolean);

export function isQuickFilterSelected(filters: Record<string, FilterValue>, filterKey: string, code: string): boolean {
  return splitValues(filters[filterKey]).includes(code);
}

/** Adds or removes one code in a comma-separated filter value; undefined when nothing is left. */
export function toggleFilterValue(value: FilterValue, code: string): string | undefined {
  const values = splitValues(value);
  const next = values.includes(code) ? values.filter((v) => v !== code) : [...values, code];
  return next.length > 0 ? next.join(',') : undefined;
}

/** True when every selected value is a quick filter, so the quick view can show the whole selection. */
export function onlyQuickFilters(filters: Record<string, FilterValue>, picks: QuickFilterPick[]): boolean {
  return Object.entries(filters).every(([key, value]) =>
    splitValues(value).every((code) => picks.some((p) => p.filterKey === key && p.optionCode === code))
  );
}

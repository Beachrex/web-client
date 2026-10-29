import { toggleFilterValue } from '@/lib/utils/quick-filters';

/**
 * Owner 2026-10-23: one selected filter value could not be removed without resetting the whole selection
 * (a collapsed section hid it). Every selected value is shown as a chip with its own ✕.
 */
type Value = string | number | boolean | null | undefined;

interface OptionLike {
  code?: string;
  slug?: string;
  value?: string;
  name?: string;
  label?: string;
  id?: number;
}

interface GroupLike {
  title?: string | null;
  options?: OptionLike[] | null;
}

export interface FilterChip {
  filterKey: string;
  value: string;
  label: string;
  group: string;
}

/** Map keys that are view state, not filters (map position, the highlighted beach). */
const NOT_FILTERS = new Set(['beach_id', 'lat', 'lng', 'zoom', 'page', 'sort', 'view']);

export function selectedValues(value: Value): string[] {
  if (value === undefined || value === null || value === '' || value === false) return [];
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * One chip per selected value, in the order of the filter groups (then any key the groups do not list).
 * The label comes from the group's options; a value the options do not know shows as itself.
 */
export function filterChips(
  filters: Record<string, Value>,
  groups: Record<string, GroupLike | null | undefined> | null | undefined,
): FilterChip[] {
  const keys = [
    ...Object.keys(groups ?? {}).filter((k) => k in filters),
    ...Object.keys(filters).filter((k) => !(groups && k in groups)),
  ];
  const chips: FilterChip[] = [];
  for (const key of keys) {
    if (NOT_FILTERS.has(key)) continue;
    const group = groups?.[key];
    for (const value of selectedValues(filters[key])) {
      const option = group?.options?.find(
        (o) => o.code === value || o.slug === value || o.value === value || String(o.id) === value,
      );
      chips.push({
        filterKey: key,
        value,
        label: option?.name ?? option?.label ?? (value === '1' || value === 'true' ? (group?.title ?? key) : value),
        group: group?.title ?? key,
      });
    }
  }
  return chips;
}

/** The filter value without one chip's value (undefined when nothing is left). */
export function withoutChip(filters: Record<string, Value>, chip: FilterChip): string | undefined {
  const current = selectedValues(filters[chip.filterKey]);
  if (!current.includes(chip.value)) return current.length ? current.join(',') : undefined;
  return toggleFilterValue(current.join(','), chip.value);
}

/**
 * Owner 2026-10-29: "filter bi mogli razbit na notranji in zunanji bazen". The "Water body" filter lists
 * sea, lake, river and pool; indoor and outdoor pools are the API's separate `pool_type` filter (QA #70,
 * matched on the admin's indoor/outdoor pool counts). The filter UIs show the two pool types nested under
 * "Pool" in the water body group instead of a separate "Pool type" group.
 *
 * URL parameters stay as they are: `waterbody=pool` (every pool place, indoor and outdoor) and
 * `pool_type=indoor|outdoor|indoor,outdoor` (what the home page tiles send).
 */
import { selectedValues } from '@/lib/utils/filter-chips';
import { toggleFilterValue } from '@/lib/utils/quick-filters';

export const WATERBODY_KEY = 'waterbody';
export const POOL_TYPE_KEY = 'pool_type';
export const POOL_WATERBODY = 'pool';

type Value = string | number | boolean | null | undefined;

interface OptionLike {
  id?: number;
  code?: string;
  slug?: string;
  value?: string;
  name?: string;
  label?: string;
}

interface GroupLike {
  options?: OptionLike[] | null;
}

export interface WaterbodyChoice {
  filterKey: typeof WATERBODY_KEY | typeof POOL_TYPE_KEY;
  code: string;
  label: string;
  /** A pool type shown under "Pool". */
  nested: boolean;
}

const codeOf = (o: OptionLike): string => String(o.code ?? o.slug ?? o.value ?? '');
const labelOf = (o: OptionLike): string => String(o.name ?? o.label ?? codeOf(o));

/** True when the pool types are shown inside the water body group (both groups exist and it has "pool"). */
export function mergesPoolTypes(groups: Record<string, GroupLike | null | undefined> | null | undefined): boolean {
  const waterbody = groups?.[WATERBODY_KEY]?.options ?? [];
  const poolTypes = groups?.[POOL_TYPE_KEY]?.options ?? [];
  return poolTypes.length > 0 && waterbody.some((o) => codeOf(o) === POOL_WATERBODY);
}

/** The water body options with the pool types right after "pool"; without "pool" only the water bodies. */
export function waterbodyChoices(
  groups: Record<string, GroupLike | null | undefined> | null | undefined,
): WaterbodyChoice[] {
  const merge = mergesPoolTypes(groups);
  const poolTypes = groups?.[POOL_TYPE_KEY]?.options ?? [];
  return (groups?.[WATERBODY_KEY]?.options ?? []).flatMap((o) => {
    const code = codeOf(o);
    if (!code) return [];
    const own: WaterbodyChoice = { filterKey: WATERBODY_KEY, code, label: labelOf(o), nested: false };
    if (!merge || code !== POOL_WATERBODY) return [own];
    return [
      own,
      ...poolTypes
        .filter((p) => codeOf(p) !== '')
        .map((p): WaterbodyChoice => ({ filterKey: POOL_TYPE_KEY, code: codeOf(p), label: labelOf(p), nested: true })),
    ];
  });
}

export function isChoiceSelected(filters: Record<string, Value>, choice: WaterbodyChoice): boolean {
  return selectedValues(filters[choice.filterKey]).includes(choice.code);
}

/** The new value of the choice's own parameter after ticking or unticking it (undefined = remove it). */
export function toggleChoice(filters: Record<string, Value>, choice: WaterbodyChoice): string | undefined {
  return toggleFilterValue(selectedValues(filters[choice.filterKey]).join(','), choice.code);
}

/** Selected values in the merged group, for the section's counter. */
export function waterbodySelectedCount(filters: Record<string, Value>, merged: boolean): number {
  return (
    selectedValues(filters[WATERBODY_KEY]).length + (merged ? selectedValues(filters[POOL_TYPE_KEY]).length : 0)
  );
}

/* ---------- single choice (the listing pages' select) ---------- */

const POOL_TYPE_PREFIX = `${POOL_TYPE_KEY}:`;

/** Select value of a choice: water bodies by code, pool types as `pool_type:<code>`. */
export function choiceSelectValue(choice: WaterbodyChoice): string {
  return choice.filterKey === POOL_TYPE_KEY ? `${POOL_TYPE_PREFIX}${choice.code}` : choice.code;
}

/** The select's current value; a water body wins, then a single pool type; '' for none or several. */
export function waterbodySelectValue(filters: Record<string, Value>): string {
  const waterbody = selectedValues(filters[WATERBODY_KEY]);
  if (waterbody.length > 0) return waterbody.join(',');
  const poolTypes = selectedValues(filters[POOL_TYPE_KEY]);
  return poolTypes.length === 1 ? `${POOL_TYPE_PREFIX}${poolTypes[0]}` : '';
}

/** Both parameters after choosing one select value (the other one is cleared). */
export function waterbodyFromSelectValue(value: string): { waterbody?: string; pool_type?: string } {
  if (!value) return { waterbody: undefined, pool_type: undefined };
  if (value.startsWith(POOL_TYPE_PREFIX)) {
    return { waterbody: undefined, pool_type: value.slice(POOL_TYPE_PREFIX.length) || undefined };
  }
  return { waterbody: value, pool_type: undefined };
}

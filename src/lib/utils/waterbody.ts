/**
 * Owner 2026-10-23: a beach page always said "sea" (banner pill "Morska plaža", "Temperatura morja",
 * "Morsko dno"), also on lake, river and pool beaches. The beach's waterbody code
 * (`characteristics.waterbody.code`: sea | lake | river | pool) picks the right wording.
 */
export type WaterKind = 'sea' | 'lake' | 'river' | 'pool';

const KINDS: readonly WaterKind[] = ['sea', 'lake', 'river', 'pool'];

/** Unknown or missing codes count as sea, the wording the pages used before. */
export function waterKind(code?: string | null): WaterKind {
  const normalized = (code ?? '').trim().toLowerCase();
  return (KINDS as readonly string[]).includes(normalized) ? (normalized as WaterKind) : 'sea';
}

/** TopBar namespace key for the beach pill. */
export function beachPillKey(kind: WaterKind): string {
  return {
    sea: 'beachLabel',
    lake: 'beachLabelLake',
    river: 'beachLabelRiver',
    pool: 'beachLabelPool',
  }[kind];
}

/** BeachDetails.labels key for the bottom ("seabed") row. */
export function seabedLabelKey(kind: WaterKind): string {
  return { sea: 'seabed', lake: 'seabedLake', river: 'seabedRiver', pool: 'seabedPool' }[kind];
}

/**
 * The banner's water temperature comes from a marine (sea) model, so it only describes sea beaches.
 * On a lake, river or pool it would be the nearest sea's temperature, or nothing; the widget is hidden there.
 */
export function showsSeaTemperature(kind: WaterKind): boolean {
  return kind === 'sea';
}

/**
 * "Focus this beach" on the beach map (owner 2026-10-29: card pins open the map on the beach).
 *
 * Query parameters (built by `buildBeachFocusMapUrl()` in `beach-urls.ts`, also sent by the beach banner):
 * - `beach_id` (required): the beach id
 * - `lat`, `lng` (optional): its coordinates, so the map can center before the beach itself is loaded
 */
export interface BeachFocus {
  id: number;
  lat: number | null;
  lng: number | null;
}

interface ParamsLike {
  get(name: string): string | null;
}

/** Reads the focus parameters; null when `beach_id` is missing or not a positive integer. */
export function parseBeachFocus(params: ParamsLike | null | undefined): BeachFocus | null {
  const rawId = params?.get('beach_id')?.trim();
  if (!rawId || !/^\d+$/.test(rawId)) return null;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const lat = Number(params?.get('lat'));
  const lng = Number(params?.get('lng'));
  const hasCoords =
    params?.get('lat') != null && params?.get('lng') != null &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

  return { id, lat: hasCoords ? lat : null, lng: hasCoords ? lng : null };
}

/** Map center for the focused beach: the URL coordinates, otherwise the loaded beach's. */
export function focusCenter(
  focus: BeachFocus | null,
  beach: { latitude?: string | number | null; longitude?: string | number | null } | null | undefined,
): [number, number] | null {
  if (!focus) return null;
  if (focus.lat != null && focus.lng != null) return [focus.lat, focus.lng];
  const lat = Number(beach?.latitude);
  const lng = Number(beach?.longitude);
  if (beach?.latitude == null || beach?.longitude == null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

/**
 * The beaches the map shows, with the focused beach added first when the current result (viewport or filters)
 * does not contain it, so its marker and popup are always there.
 */
export function withFocusedBeach<T extends { id?: number | null }>(beaches: T[], focused: T | null | undefined): T[] {
  if (!focused || focused.id == null) return beaches;
  if (beaches.some((b) => b.id === focused.id)) return beaches;
  return [focused, ...beaches];
}

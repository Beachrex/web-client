/** Beach GPS position: parsing, display and the Google Maps navigation link (beach page, owner 2026-10-28). */

export interface LatLng {
  lat: number;
  lng: number;
}

/** API sends strings like "45.54170000". Null for anything that is not a real position (incl. 0,0). */
export function parseCoordinates(lat: unknown, lng: unknown): LatLng | null {
  const toNum = (v: unknown): number => (typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN);
  const la = toNum(lat);
  const lo = toNum(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return null;
  if (la === 0 && lo === 0) return null;
  return { lat: la, lng: lo };
}

/** "45.54170, 13.65600" — 5 decimals (~1 m), the form phones and Google Maps accept when pasted. */
export function formatCoordinates({ lat, lng }: LatLng): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Google Maps directions to the point (official Maps URL, no API key). On a phone it opens the Maps app
 * with navigation; on a computer the route planner. The start is the visitor's current location.
 */
export function googleMapsNavigationUrl({ lat, lng }: LatLng): string {
  const q = new URLSearchParams({ api: '1', destination: `${lat.toFixed(6)},${lng.toFixed(6)}`, travelmode: 'driving' });
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}

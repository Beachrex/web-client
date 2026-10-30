/**
 * Beach panel on the beach map (owner 2026-10-30): a beach opened from the map list or a marker shows in a
 * panel over the map page (desktop: left panel, phone: bottom sheet) instead of a new tab.
 *
 * URL state: the open beach is a query parameter on the map URL (`/si/zemljevid-plaz?country=HR&beach=989`),
 * added with `history.pushState` (Next.js 14.2 keeps `useSearchParams` in sync without a server round trip).
 * A direct load of that URL opens the map with the panel open; Back closes the panel. The beach page itself
 * keeps its own URL (SEO unchanged). The real beach pathname is not pushed: the map's filters live in the query
 * string and the filter sidebar writes them with `usePathname()`, so a beach pathname would clear the filters and
 * the next filter change would navigate to the beach page; the locale switcher would also translate the beach
 * instead of the map.
 */

/** Query parameter holding the id of the beach open in the panel. */
export const MAP_BEACH_PARAM = 'beach';

interface ParamsLike {
  get(name: string): string | null;
}

/** The beach id in the map URL, or null when the parameter is missing or not a positive integer. */
export function parseMapBeachParam(params: ParamsLike | null | undefined): number | null {
  const raw = params?.get(MAP_BEACH_PARAM)?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * The map URL (pathname + query + hash) with the panel parameter set to `beachId`, or removed when null.
 * Every other query parameter (filters, `beach_id` focus) is kept in its order.
 */
export function buildMapPanelUrl(
  location: { pathname: string; search: string; hash?: string },
  beachId: number | null,
): string {
  const params = new URLSearchParams(location.search);
  if (beachId == null) params.delete(MAP_BEACH_PARAM);
  else params.set(MAP_BEACH_PARAM, String(beachId));
  const query = params.toString();
  return `${location.pathname}${query ? `?${query}` : ''}${location.hash ?? ''}`;
}

/** The query parameters without the panel parameter: what the filter sidebar treats as filters. */
export function withoutPanelParam(params: { toString(): string } | null | undefined): URLSearchParams {
  const copy = new URLSearchParams(params?.toString() ?? '');
  copy.delete(MAP_BEACH_PARAM);
  return copy;
}

export interface ClickLike {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented?: boolean;
}

/**
 * Only a plain primary click opens the panel. Ctrl/Cmd/Shift/Alt clicks and the middle button keep the
 * browser's own behaviour for a link (new tab, new window, download), so the links stay real `<a href>`.
 */
export function isPlainPrimaryClick(e: ClickLike): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
}

/**
 * Whether a click on a beach link opens the panel: only on the map page (a panel exists), for a real beach id,
 * and only for a plain primary click. Everywhere else the link navigates as before.
 */
export function opensBeachPanel(hasPanel: boolean, beachId: number | null | undefined, e: ClickLike): boolean {
  return hasPanel && typeof beachId === 'number' && beachId > 0 && isPlainPrimaryClick(e);
}

/** Desktop panel width in px: the mockup's 720px, at most 55% of the window. */
export function panelWidth(viewportWidth: number): number {
  return Math.round(Math.min(720, viewportWidth * 0.55));
}

/**
 * Desktop panel width: exactly the filters + list columns (the map starts at `mapLeft`) when that is at most 62% of
 * the window, so no strip of the list shows between the panel and the map; otherwise `panelWidth()`.
 */
export function desktopPanelWidth(viewportWidth: number, mapLeft: number): number {
  if (mapLeft > 0 && mapLeft <= viewportWidth * 0.62) return Math.round(mapLeft);
  return panelWidth(viewportWidth);
}

/**
 * Pixels of the map hidden under the panel on the left: the panel covers the page from x=0 to its width,
 * the map starts at `mapLeft`.
 */
export function panelMapInset(panelRight: number, mapLeft: number): number {
  return Math.max(0, Math.round(panelRight - mapLeft));
}

/** Breadcrumb line of the panel header: continent › country › region › city (missing levels skipped). */
export function panelBreadcrumb(
  names: (string | null | undefined)[],
): string {
  return names
    .map((n) => n?.trim())
    .filter((n): n is string => Boolean(n))
    .filter((n, i, all) => all.indexOf(n) === i)
    .join(' › ');
}

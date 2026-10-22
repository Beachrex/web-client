/**
 * Beaches the map shows after a bounding-box response.
 * `response` is undefined while a new query is loading: keep the previous beaches (no empty flash).
 * An empty response is a real result (e.g. waterbody=pool with no matches) and must show 0 beaches;
 * keeping the previous list there showed every beach (owner report 2026-10-22).
 */
export function nextDisplayedBeaches<T>(previous: T[], response: T[] | undefined): T[] {
  return response ?? previous;
}

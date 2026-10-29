/** Saved beaches: error mapping kept free of React so the unit tests can cover it. */
export type FavoriteError = 'limit' | 'error';

/** 422 `favorites_limit` → the list is full; anything else is a generic failure. */
export function favoriteErrorKey(body: unknown): FavoriteError {
  return (body as { error?: string } | undefined)?.error === 'favorites_limit' ? 'limit' : 'error';
}

/** Ids after a save (newest first, no duplicates) or a removal. */
export function toggledIds(ids: number[], beachId: number, save: boolean): number[] {
  const rest = ids.filter((id) => id !== beachId);
  return save ? [beachId, ...rest] : rest;
}

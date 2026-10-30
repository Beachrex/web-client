'use client';

import type React from 'react';
import { createContext, useCallback, useContext } from 'react';
import { opensBeachPanel } from '@/lib/utils/map-beach-panel';

/**
 * Set only by the beach map page (`MapWithSidebar`). Beach links inside it (list cards, marker popups, nearby
 * beaches inside the panel) open the beach panel instead of navigating; everywhere else the context is null and
 * the same links behave as normal links.
 */
export interface MapBeachPanelApi {
  /** Opens (or swaps) the panel to this beach; `trigger` gets the focus back when the panel closes. */
  open: (beachId: number, trigger?: HTMLElement | null) => void;
}

export const MapBeachPanelContext = createContext<MapBeachPanelApi | null>(null);

export function useMapBeachPanel(): MapBeachPanelApi | null {
  return useContext(MapBeachPanelContext);
}

/**
 * Click handler for a beach link. On the map page a plain primary click opens the panel (the default navigation is
 * prevented); modified and middle clicks, and every click outside the map page, keep the link's own behaviour.
 */
export function useBeachPanelLinkClick(
  beachId: number | null | undefined,
): (e: React.MouseEvent<HTMLElement>) => void {
  const panel = useMapBeachPanel();
  return useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!panel || !beachId || !opensBeachPanel(true, beachId, e)) return;
      e.preventDefault();
      panel.open(beachId, e.currentTarget);
    },
    [panel, beachId],
  );
}

'use client';

import { createContext, useContext } from 'react';

/**
 * True while the beach page content renders inside the beach map's panel (≤ 720px wide even on a wide screen).
 * The beach page sections use it to keep their phone/tablet layout there: Tailwind's `lg:`/`xl:` classes follow the
 * window width, not the panel's, and would otherwise lay out a 1440px page inside 720px.
 */
export const BeachEmbedContext = createContext(false);

export function useBeachEmbedded(): boolean {
  return useContext(BeachEmbedContext);
}

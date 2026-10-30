'use client';

import { useQuery } from '@tanstack/react-query';
import { getBeachDetailsOptions } from '@/lib/api-client/@tanstack/react-query.gen';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { NOT_A_VIEW_HEADERS } from '@/lib/utils/beach-views';

/**
 * Beach details for the beach map panel. Same request as the beach page (generated SDK, `getBeachDetails` by id)
 * and, like the page, sent as "not a view": the panel content (`BeachDetailPage`) reports the visit once with
 * `POST /beaches/{id}/view`, so a refetch never counts twice. Cached for the session: re-renders, closing and
 * reopening the same beach and the map's marker highlight (same query key) reuse one response.
 */
export function beachPanelQueryOptions(beachId: number) {
  return {
    ...getBeachDetailsOptions({ path: { identifier: beachId }, headers: NOT_A_VIEW_HEADERS }),
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  } as const;
}

export function useBeachPanelDetails(beachId: number | null): {
  details: BeachDetailsSchema | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const query = useQuery({
    ...beachPanelQueryOptions(beachId ?? 0),
    enabled: beachId !== null && beachId > 0,
  });
  const data = query.data?.data ?? null;
  // Never show another beach's data while the new one loads (the key changes with the id, but be strict).
  const details = data && (data.basic_info?.id == null || data.basic_info.id === beachId) ? data : null;
  return {
    details,
    isLoading: beachId !== null && !details && !query.isError,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

import { env } from '@/env';

/**
 * Beach view counting (backend `beach_views`, "most visited").
 *
 * `GET /beach-details` counts a view unless the request says it is not one. The website serves beach pages from
 * its cache (ISR), so its own reads (server render, hover prefetch, language switch) are not visits; the browser
 * reports the real visit with `POST /beaches/{id}/view` (one per visitor and beach per 30 minutes, server-side).
 */
export const NOT_A_VIEW_HEADERS = { 'X-Beachrex-Client': 'web' } as const;

export function reportBeachView(beachId: number): void {
  if (typeof window === 'undefined') return;
  void fetch(`${env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/beaches/${beachId}/view`, {
    method: 'POST',
    keepalive: true,
    headers: { Accept: 'application/json' },
  }).catch(() => {
    // A missed view is not worth an error for the visitor.
  });
}

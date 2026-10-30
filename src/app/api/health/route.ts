/**
 * GET /api/health — liveness of this Next.js server, for the zero-downtime website deploy
 * (backend ADR 2026-10-29 "Zero-downtime deploys", `deploy/scripts/front-deploy.sh`).
 *
 * The deploy waits for 200 here before it sends traffic to a new container, and probes it through nginx
 * during the switch. It renders no page and calls no API, so it says only "this server is up".
 * `color` is the container's blue/green slot (BEACHREX_COLOR, set in the VPS compose file).
 * `cache` is the bounded page/fetch cache (`cache-handler.cjs`, backend ADR 2026-10-30 "Bounded Next.js cache"):
 * entries and compressed size against the budget, so its growth is visible; `null` before the first page render.
 * The locale/preview middleware does not run for /api (see the matcher in src/middleware.ts).
 */
import { readCacheStats, rssMb } from '@/lib/server/cache-stats';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json(
    {
      status: 'ok',
      color: process.env.BEACHREX_COLOR ?? null,
      cache: readCacheStats(),
      rssMb: rssMb(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

import { env } from '@/env';

/**
 * Base URL for API calls made by the website's SERVER (page renders, metadata, sitemaps).
 *
 * `API_INTERNAL_URL` (runtime env, backend `deploy/docker-compose.vps.yml`: `http://web_<env>`) reaches the API's
 * nginx inside the Docker network: no Cloudflare round trip, no public rate limit, no bot rules in between
 * (backend ADR 2026-10-30 "API performance"). Unset (local development, tests) = the public URL, as before.
 * Browsers always use `NEXT_PUBLIC_API_ENDPOINT`.
 */
export function serverApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.trim();
  return internal ? internal.replace(/\/+$/, '') : env.NEXT_PUBLIC_API_ENDPOINT;
}

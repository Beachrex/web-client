/**
 * Authenticated API Client for Internal Tooling
 *
 * DEV/STAGING ONLY - Provides Bearer token authentication for internal pages
 *
 * This module wraps the generated OpenAPI client and injects Bearer tokens
 * for authenticated endpoints. Token is sourced from environment variable
 * NEXT_PUBLIC_INTERNAL_API_TOKEN.
 *
 * SECURITY NOTES:
 * - Only use this for /internal/* routes
 * - Token must be a Laravel Sanctum personal access token
 * - Never commit tokens to git
 * - Production guard ensures this is never used in production
 *
 * @see docs/ai/implementation/INTERNAL_TOOLING_AUTH.md
 */

import { createClient, createConfig, type Config } from '@/lib/api-client/client';
import type { ClientOptions } from '@/lib/api-client/types.gen';

/**
 * Get Bearer token from environment variable
 *
 * Token should be set in .env.local:
 * NEXT_PUBLIC_INTERNAL_API_TOKEN=1|abc123def456...
 *
 * @returns Bearer token or null if not set
 */
export function getInternalApiToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  const token = process.env.NEXT_PUBLIC_INTERNAL_API_TOKEN;

  if (!token) {
    console.warn('[api-client-auth] NEXT_PUBLIC_INTERNAL_API_TOKEN not set. API calls will fail with 401.');
    return null;
  }

  return token;
}

/**
 * Create authenticated API client for internal tooling
 *
 * This client automatically injects Authorization header with Bearer token
 * from NEXT_PUBLIC_INTERNAL_API_TOKEN environment variable.
 *
 * Usage:
 * ```typescript
 * import { createAuthenticatedClient } from '@/lib/api-client-auth';
 *
 * const client = createAuthenticatedClient();
 * const response = await e3A9C3C756B5255539Aa1Ab9F3A2A6A8({ client });
 * ```
 *
 * @returns Authenticated API client instance
 */
export function createAuthenticatedClient() {
  const token = getInternalApiToken();

  const config: Config<ClientOptions> = createConfig({
    baseUrl: process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://dev-api.beachrex.com',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  return createClient(config);
}

/**
 * Check if internal API token is configured
 *
 * @returns true if token is set, false otherwise
 */
export function hasInternalApiToken(): boolean {
  return getInternalApiToken() !== null;
}

/**
 * Get auth status message for debugging
 *
 * @returns Human-readable auth status
 */
export function getAuthStatus(): string {
  const token = getInternalApiToken();

  if (!token) {
    return 'No token configured. Set NEXT_PUBLIC_INTERNAL_API_TOKEN in .env.local';
  }

  // Mask token for security (show first 10 chars only)
  const maskedToken = token.substring(0, 10) + '...';
  return `Token configured: ${maskedToken}`;
}

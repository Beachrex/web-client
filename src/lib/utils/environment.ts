/**
 * Production hostnames that search engines may index.
 *
 * Allowlist (not a dev./uat. denylist) so any new environment
 * defaults to noindex until it is explicitly added here.
 *
 * NOTE: next.config.js cannot import TS - keep its copy in sync.
 */
const PRODUCTION_HOSTS = ['beachrex.com', 'www.beachrex.com'];

export function isProductionSite(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false;
  try {
    // Tolerate a bare host (e.g. "beachrex.com") so prod never falls back to noindex
    const url = new URL(/^https?:\/\//.test(baseUrl) ? baseUrl : `https://${baseUrl}`);
    return PRODUCTION_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

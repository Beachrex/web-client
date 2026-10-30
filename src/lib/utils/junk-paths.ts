/**
 * Requests that can never be a Beachrex page: vulnerability scanners probing for secrets and admin panels
 * (`/.env`, `/api/proc/self/environ`, `/api/..;/.env`, `/wp-login.php`, `/.git/config` ...).
 *
 * Prod 2026-10-30 (backend ADR "Bounded Next.js cache"): such paths fell through to `[locale]/[...rest]`
 * (`/api/...` even became locale "api", because the middleware matcher skipped every path starting with "api").
 * Each one rendered the full 404 page, called the legacy-redirect API, and Next stored the page (~130 KB) and the
 * API response on disk forever: 178 000 page files in one day. The middleware now answers these with a tiny 404
 * before anything renders. No secret was ever served: they rendered the normal 404 page.
 *
 * Real pages are slug paths (letters, digits, dashes) without file extensions or dot segments; public files,
 * sitemaps, robots.txt and llms.txt never reach the middleware (see its matcher).
 */

/** File extensions of server-side scripts, configs, dumps and archives. */
const JUNK_EXTENSIONS = [
  'php\\d?', 'phtml', 'asp', 'aspx', 'ashx', 'jsp', 'jspx', 'cgi', 'pl', 'py', 'rb', 'sh',
  'env', 'ini', 'cfg', 'conf', 'config', 'cnf', 'bak', 'backup', 'old', 'orig', 'save', 'swp', 'tmp',
  'sql', 'db', 'sqlite', 'dump', 'log', 'ya?ml', 'toml', 'properties', 'key', 'pem', 'crt', 'p12', 'pfx',
  'htaccess', 'htpasswd', 'git', 'svn', 'ds_store', 'zip', 'tar', 'tgz', 'gz', 'bz2', 'rar', '7z', 'war', 'jar',
];
const JUNK_EXTENSION = new RegExp(`\\.(${JUNK_EXTENSIONS.join('|')})$`, 'i');

/** Whole path segments that only scanners ask for. */
const JUNK_SEGMENTS = new Set([
  'wp-admin',
  'wp-content',
  'wp-includes',
  'wp-login',
  'wp-json',
  'xmlrpc',
  'cgi-bin',
  'phpmyadmin',
  'actuator',
  'boaform',
  'autodiscover',
  'telescope',
  '_ignition',
  'server-status',
]);

/** The Next.js API routes that exist (src/app/api). */
const REAL_API_ROUTES = new Set(['/api/health']);

/** True for a path that should get a plain 404 without rendering a page. */
export function isJunkPath(pathname: string): boolean {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return true; // malformed percent-encoding
  }
  const lower = path.toLowerCase();

  // Next.js API routes: only the real ones. Anything else under /api is a probe (/api/.env, /api/graphql ...).
  if ((lower === '/api' || lower.startsWith('/api/')) && !REAL_API_ROUTES.has(lower.replace(/\/+$/, ''))) {
    return true;
  }
  if (lower.includes('/proc/self') || lower.includes('/etc/passwd')) return true;
  if (lower.includes('..') || lower.includes(';') || lower.includes('\\') || lower.includes('\0')) return true;

  const segments = lower.split('/').filter(Boolean);
  for (const segment of segments) {
    if (segment.startsWith('.') && segment !== '.well-known') return true; // .env, .git, .aws, .ssh ...
    if (JUNK_SEGMENTS.has(segment)) return true;
    if (segment.startsWith('wp-')) return true;
  }
  const last = segments[segments.length - 1] ?? '';
  return JUNK_EXTENSION.test(last);
}

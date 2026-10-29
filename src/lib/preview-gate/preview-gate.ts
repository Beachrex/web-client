import { locales } from '@/app/config/locales';
import { isProductionSite } from '@/lib/utils/environment';

/**
 * Closed dev/uat websites (owner 2026-10-29; backend ADR "Closed dev/uat websites behind an e-mail magic link").
 *
 * A visitor without a valid cookie is sent to `/preview-access`, asks for a one-time e-mail link (backend
 * `POST /api/v1/preview-access/request`), and the link's page sets an HttpOnly cookie signed with the server-only
 * `PREVIEW_GATE_SECRET`. The middleware checks that signature with Web Crypto (edge runtime).
 *
 * Off unless `PREVIEW_GATE_ENABLED=true` (runtime env of the front container, `.env.front.<env>`), and never on the
 * production website, whatever the env says. Kept free of `next/server` imports so unit specs can import it.
 */

export const PREVIEW_COOKIE_NAME = 'beachrex_preview';
/** 30 days */
export const PREVIEW_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
export const PREVIEW_ACCESS_PATH = '/preview-access';

export interface PreviewGateConfig {
  enabled: boolean;
  secret: string;
  baseUrl: string | undefined;
}

/**
 * Reads the runtime env. Non-`NEXT_PUBLIC_` variables are not inlined at build time: the middleware sandbox and the
 * route handlers read the container's `process.env` on each request (checked against Next 14.2's build output).
 */
export function readPreviewGateConfig(env: Record<string, string | undefined> = process.env): PreviewGateConfig {
  return {
    enabled: (env.PREVIEW_GATE_ENABLED ?? '').trim().toLowerCase() === 'true',
    secret: (env.PREVIEW_GATE_SECRET ?? '').trim(),
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
  };
}

/** The gate runs: switched on and not the production website. */
export function isPreviewGateActive(config: PreviewGateConfig): boolean {
  return config.enabled && !isProductionSite(config.baseUrl);
}

/** A usable secret: at least 32 characters (`openssl rand -hex 32` gives 64). */
export function hasUsableSecret(config: PreviewGateConfig): boolean {
  return config.secret.length >= 32;
}

const STATIC_FILE =
  /\.(?:png|jpe?g|gif|svg|webp|avif|ico|txt|xml|json|webmanifest|js|css|map|woff2?|ttf|otf|mp4|webm|pdf|zip)$/i;

/** Paths that never need the cookie: the gate's own pages, Next internals and static files. */
export function isPreviewGateExempt(pathname: string): boolean {
  return (
    pathname === PREVIEW_ACCESS_PATH ||
    pathname.startsWith(`${PREVIEW_ACCESS_PATH}/`) ||
    pathname.startsWith('/_next/') ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/favicon') ||
    STATIC_FILE.test(pathname)
  );
}

/**
 * A same-site path to return to: starts with one `/`, no `//`, no backslash or control characters, at most 512
 * characters. Anything else becomes `/` (no open redirect).
 */
export function sanitizeReturnPath(raw: string | null | undefined): string {
  if (!raw || raw.length > 512 || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  // eslint-disable-next-line no-control-regex
  if (raw.includes('\\') || /[\u0000-\u001f\u007f]/.test(raw)) return '/';
  if (isPreviewGateExempt(raw.split(/[?#]/)[0] ?? '')) return '/';
  try {
    const url = new URL(raw, 'https://gate.invalid');
    if (url.origin !== 'https://gate.invalid') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

// ---------- signed cookie: "v1.<expires unix seconds>.<nonce hex>.<HMAC-SHA256 base64url>" ----------

const encoder = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
  let binary = '';
  signature.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signPreviewCookie(
  secret: string,
  nowMs: number = Date.now(),
  maxAgeSeconds: number = PREVIEW_COOKIE_MAX_AGE,
): Promise<string> {
  const expires = Math.floor(nowMs / 1000) + maxAgeSeconds;
  const nonceBytes = crypto.getRandomValues(new Uint8Array(8));
  const nonce = Array.from(nonceBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const payload = `v1.${expires}.${nonce}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifyPreviewCookie(
  secret: string,
  value: string | undefined,
  nowMs: number = Date.now(),
): Promise<boolean> {
  if (!secret || !value) return false;
  const parts = value.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return false;
  const [version, expiresRaw, nonce, signature] = parts as [string, string, string, string];
  if (!/^\d{1,12}$/.test(expiresRaw) || !/^[0-9a-f]{16}$/.test(nonce)) return false;
  if (Number(expiresRaw) * 1000 <= nowMs) return false;
  const expected = await hmac(secret, `${version}.${expiresRaw}.${nonce}`);
  return constantTimeEqual(expected, signature);
}

export type PreviewGateDecision = 'open' | 'login' | 'misconfigured';

/** What the middleware does with a request. */
export async function previewGateDecision(
  config: PreviewGateConfig,
  pathname: string,
  cookieValue: string | undefined,
  nowMs: number = Date.now(),
): Promise<PreviewGateDecision> {
  if (!isPreviewGateActive(config)) return 'open';
  if (isPreviewGateExempt(pathname)) return 'open';
  if (!hasUsableSecret(config)) return 'misconfigured';
  return (await verifyPreviewCookie(config.secret, cookieValue, nowMs)) ? 'open' : 'login';
}

/** Plain page for "switched on but no secret": fail closed with a clear message, no crash loop. */
export const MISCONFIGURED_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">' +
  '<title>Beachrex test website</title></head><body style="font-family:Arial,sans-serif;padding:32px;color:#222">' +
  '<h1 style="color:#1A3C68">This test website is closed</h1>' +
  '<p>PREVIEW_GATE_ENABLED is true but PREVIEW_GATE_SECRET is missing or shorter than 32 characters. ' +
  'Set it in the front env file and redeploy.</p></body></html>';

// ---------- language of the gate pages (not localized URLs) ----------

const GATE_LOCALES: readonly string[] = locales;
/** Browser language codes that differ from the website's URL codes. */
const BROWSER_TO_SITE: Record<string, string> = { sl: 'si', uk: 'ua' };

/**
 * The website locale for the gate pages: the locale of the page the visitor wanted (`/si/plaze` → `si`), else the
 * browser's first supported language, else English.
 */
export function previewPageLocale(
  returnPath: string | null | undefined,
  acceptLanguage: string | null | undefined,
): string {
  const first = (returnPath ?? '').split(/[/?#]/)[1] ?? '';
  if (GATE_LOCALES.includes(first)) return first;
  for (const part of (acceptLanguage ?? '').split(',')) {
    const code = (part.split(';')[0] ?? '').trim().toLowerCase().split('-')[0] ?? '';
    const site = BROWSER_TO_SITE[code] ?? code;
    if (GATE_LOCALES.includes(site)) return site;
  }
  return 'en';
}

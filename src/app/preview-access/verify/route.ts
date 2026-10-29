import { NextResponse, type NextRequest } from 'next/server';
import {
  MISCONFIGURED_HTML,
  PREVIEW_ACCESS_PATH,
  PREVIEW_COOKIE_MAX_AGE,
  PREVIEW_COOKIE_NAME,
  hasUsableSecret,
  isPreviewGateActive,
  readPreviewGateConfig,
  sanitizeReturnPath,
  signPreviewCookie,
} from '@/lib/preview-gate/preview-gate';

export const dynamic = 'force-dynamic';

/** Relative `Location` (no absolute URL behind the proxy). 303: the browser follows with GET. */
function seeOther(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { location: path, 'cache-control': 'no-store' } });
}

/**
 * Uses up the e-mail token with the API (server side) and, when it is valid, sets the signed preview cookie
 * (HttpOnly, Secure, SameSite=Lax, 30 days).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const config = readPreviewGateConfig();
  if (!isPreviewGateActive(config)) return seeOther('/');
  if (!hasUsableSecret(config)) {
    return new NextResponse(MISCONFIGURED_HTML, {
      status: 503,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  const form = await request.formData().catch(() => null);
  const token = form?.get('token');
  if (typeof token !== 'string' || token.length === 0 || token.length > 128) {
    return seeOther(`${PREVIEW_ACCESS_PATH}?error=link`);
  }

  let returnPath: string | null = null;
  try {
    const api = (process.env.NEXT_PUBLIC_API_ENDPOINT ?? '').replace(/\/$/, '');
    const response = await fetch(`${api}/api/v1/preview-access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) {
      const body = (await response.json()) as { ok?: boolean; return_path?: string };
      if (body.ok === true) returnPath = sanitizeReturnPath(body.return_path);
    }
  } catch {
    returnPath = null;
  }
  if (returnPath === null) return seeOther(`${PREVIEW_ACCESS_PATH}?error=link`);

  const result = seeOther(returnPath);
  result.cookies.set(PREVIEW_COOKIE_NAME, await signPreviewCookie(config.secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: PREVIEW_COOKIE_MAX_AGE,
  });
  return result;
}

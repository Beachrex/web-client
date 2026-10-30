import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { createBeachesMiddleware } from './lib/i18n/beaches-middleware';
import { legacySlovenianPath } from './lib/utils/legacy-redirect';
import {
  MISCONFIGURED_HTML,
  PREVIEW_ACCESS_PATH,
  PREVIEW_COOKIE_NAME,
  previewGateDecision,
  readPreviewGateConfig,
} from './lib/preview-gate/preview-gate';
import { currentBeachSlug, oldBeachSlug, withBeachSlug } from './lib/utils/old-beach-slug';
import { isJunkPath } from './lib/utils/junk-paths';

const intlMiddleware = createMiddleware(routing);
const beachesMiddleware = createBeachesMiddleware(intlMiddleware, (url) => NextResponse.rewrite(url));

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  // The gate's own pages are not localized: keep them away from next-intl.
  const { pathname } = request.nextUrl;
  // Scanner probes (/.env, /api/proc/self/environ, /wp-login.php ...): a tiny 404 before anything renders or is
  // cached (prod 2026-10-30: 178 000 cached 404 pages in one day; backend ADR "Bounded Next.js cache").
  if (isJunkPath(pathname)) {
    return new NextResponse('Not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'noindex' },
    });
  }
  if (pathname === PREVIEW_ACCESS_PATH || pathname.startsWith(`${PREVIEW_ACCESS_PATH}/`)) {
    return NextResponse.next();
  }
  // Closed dev/uat websites (owner 2026-10-29): before anything else. Runtime env, read per request; never on prod.
  const gate = await previewGateDecision(
    readPreviewGateConfig({
      PREVIEW_GATE_ENABLED: process.env.PREVIEW_GATE_ENABLED,
      PREVIEW_GATE_SECRET: process.env.PREVIEW_GATE_SECRET,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    }),
    request.nextUrl.pathname,
    request.cookies.get(PREVIEW_COOKIE_NAME)?.value,
  );
  if (gate === 'misconfigured') {
    return new NextResponse(MISCONFIGURED_HTML, {
      status: 503,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
    });
  }
  if (gate === 'login') {
    const url = request.nextUrl.clone();
    url.pathname = PREVIEW_ACCESS_PATH;
    url.search = '';
    url.searchParams.set('return', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(url, 307);
    response.headers.set('cache-control', 'no-store');
    return response;
  }

  // Old beachrex.com Slovenian URLs used `/sl`; the locale is `si` now. One permanent hop,
  // then `[locale]/[...rest]` maps the rest of the old path (TASK-004 step 5b).
  const slovenian = legacySlovenianPath(request.nextUrl.pathname);
  if (slovenian) {
    const url = request.nextUrl.clone();
    url.pathname = slovenian;
    return NextResponse.redirect(url, 308);
  }
  // Former "beach-…" slugs move permanently to the current slug (owner 2026-10-23).
  const old = oldBeachSlug(request.nextUrl.pathname);
  if (old) {
    const current = await currentBeachSlug(process.env.NEXT_PUBLIC_API_ENDPOINT, old);
    if (current && current !== old) {
      const url = request.nextUrl.clone();
      url.pathname = withBeachSlug(request.nextUrl.pathname, current);
      return NextResponse.redirect(url, 301);
    }
  }
  return beachesMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (the only API route; any other /api/... is a probe and gets a 404 here)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon*, apple-touch-icon, android-chrome-*, site.webmanifest, og-image (icons and share image)
     * - sitemap*.xml, robots.txt, ads.txt, llms.txt (metadata files)
     * - images, brand/ (public files; brand/ is the media kit package)
     * - vendor/ (self-hosted third-party files, e.g. the Pannellum 360° viewer)
     */
    '/((?!api/health|_next/static|_next/image|favicon|apple-touch-icon|android-chrome|site\\.webmanifest|og-image|sitemap|robots\\.txt|ads\\.txt|llms\\.txt|images|brand/|vendor/).*)',
  ],
};

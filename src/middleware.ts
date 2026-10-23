import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { createBeachesMiddleware } from './lib/i18n/beaches-middleware';
import { legacySlovenianPath } from './lib/utils/legacy-redirect';
import { currentBeachSlug, oldBeachSlug, withBeachSlug } from './lib/utils/old-beach-slug';

const intlMiddleware = createMiddleware(routing);
const beachesMiddleware = createBeachesMiddleware(intlMiddleware, (url) => NextResponse.rewrite(url));

export default async function middleware(request: NextRequest): Promise<NextResponse> {
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon*, apple-touch-icon, android-chrome-*, site.webmanifest, og-image (icons and share image)
     * - sitemap*.xml, robots.txt, ads.txt, llms.txt (metadata files)
     * - images, brand/ (public files; brand/ is the media kit package)
     */
    '/((?!api|_next/static|_next/image|favicon|apple-touch-icon|android-chrome|site\\.webmanifest|og-image|sitemap|robots\\.txt|ads\\.txt|llms\\.txt|images|brand/).*)',
  ],
};

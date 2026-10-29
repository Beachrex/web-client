// src/lib/i18n/beaches-middleware.ts
import type { NextRequest, NextResponse } from 'next/server';
import { globalRoutes } from '@/i18n/routing';

type IntlMiddleware = (request: NextRequest) => NextResponse;
type Rewrite = (url: URL) => NextResponse;

/**
 * Wraps the next-intl middleware: any localized "beaches" word (from any locale) is rewritten to the
 * internal `/beaches/...` route, e.g. /si/plaze/evropa/... → /si/beaches/evropa/...
 * Kept free of runtime `next/server` imports so e2e/search-urls.unit.spec.ts can test it.
 */
export function createBeachesMiddleware(intlMiddleware: IntlMiddleware, rewrite: Rewrite) {
  const beachesWords = Object.values(globalRoutes.beaches);

  return function middleware(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    // First, let next-intl process the request for locale detection
    const intlResponse = intlMiddleware(request);

    // next-intl redirects e.g. /si/beaches/... to the localized /si/plaze/... — follow it.
    // Copying its `location` header onto a 200 rewrite (below) made Next serve an empty page
    // (QA #52, #53, #54).
    if (intlResponse.headers.has('location')) {
      return intlResponse;
    }

    // Handles a beaches word from a different locale too (e.g. /en/plaze/... after switching SI → EN)
    for (const beachesWord of beachesWords) {
      if (pathname.includes(`/${beachesWord}/`)) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.replace(`/${beachesWord}/`, '/beaches/');

        // Rewrite to the English folder structure, keeping the intl headers (locale, cookie)
        const rewriteResponse = rewrite(url);
        intlResponse.headers.forEach((value, key) => {
          rewriteResponse.headers.set(key, value);
        });
        return rewriteResponse;
      }
    }

    return intlResponse;
  };
}

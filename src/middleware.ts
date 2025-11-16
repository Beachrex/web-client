import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Locale-specific route translations for beaches
const beachesRoutes: Record<string, string> = {
  en: 'beaches',
  si: 'plaze',
  de: 'strande',
  hr: 'plaze',
  fr: 'plages',
  es: 'playas',
  it: 'spiagge',
  ua: 'plyazhi',
  ru: 'plyazhi',
  pl: 'plaze',
  cs: 'plaze',
  hu: 'strandok',
  bg: 'plyazhove',
  sk: 'plaze',
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname contains ANY of the localized beaches words
  // This handles cases where the URL has a beaches word from a different locale
  // (e.g., /en/plaze/... when switching from SI to EN)
  for (const beachesWord of Object.values(beachesRoutes)) {
    if (pathname.includes(`/${beachesWord}/`)) {
      // Rewrite ANY localized beaches word to 'beaches' for internal routing
      // e.g., /en/plaze/evropa/... -> /en/beaches/evropa/...
      // e.g., /si/plaze/evropa/... -> /si/beaches/evropa/...
      const rewrittenPath = pathname.replace(
        `/${beachesWord}/`,
        '/beaches/'
      );

      // Create a new URL with the rewritten path
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;

      // Rewrite the request to use the English folder structure
      return NextResponse.rewrite(url);
    }
  }

  // For all other routes, use the default next-intl middleware
  return intlMiddleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|sitemap.xml|robots.txt|images).*)',
    ],
};

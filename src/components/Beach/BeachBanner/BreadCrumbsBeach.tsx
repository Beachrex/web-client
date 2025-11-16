'use client';

import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';
import { buildBeachUrlFromNavigation } from '@/lib/utils/beach-urls';

interface BeachTopBarProps {
  /** Full pathname to render breadcrumbs, e.g. /en/beaches/europe/croatia/dalmatia/vodice/beach-hangar */
  pathname: string;
  /** Beach details from API (includes navigation data) */
  beachDetails?: BeachDetailsSchema;
  /** Show/hide the breadcrumbs row */
  showBreadcrumbs?: boolean;
  /** Optional right-side extras (share/save etc.) */
  rightExtras?: React.ReactNode;
}

export default function BeachTopBar({
  pathname,
  beachDetails,
  showBreadcrumbs = true,
  rightExtras,
}: BeachTopBarProps) {
  const locale = useLocale();

  // Build navigation URLs using location data from API
  const prevBeach = beachDetails?.navigation?.previous
    ? {
        name: beachDetails.navigation.previous.name ?? '',
        url: buildBeachUrlFromNavigation(beachDetails.navigation.previous, locale),
      }
    : null;

  const nextBeach = beachDetails?.navigation?.next
    ? {
        name: beachDetails.navigation.next.name ?? '',
        url: buildBeachUrlFromNavigation(beachDetails.navigation.next, locale),
      }
    : null;

  return (
    <div className="w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto">
        {showBreadcrumbs && (
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Left: Breadcrumbs */}
            <div className="min-w-0 flex-1">
              {/* Keep breadcrumbs responsive; allow wrapping on small screens */}
              <DynamicBreadcrumbs pathname={pathname} />
            </div>

              {/* Right side - Beach Pagination */}
              {(prevBeach?.url ?? nextBeach?.url) && (
              <div className="ml-8 flex items-center space-x-4 font-light">
                  {prevBeach ? (
                      <Link
                          href={prevBeach.url}
                          className="flex items-center text-sm text-variable-collection-mesto transition-opacity duration-200 hover:opacity-80"
                      >
                          <svg
                              className="mr-1 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                          >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                              />
                          </svg>
                          <span className="font-medium">{prevBeach.name}</span>
                      </Link>
                  ) : (
                      <span className="flex cursor-not-allowed items-center text-sm opacity-50">
                  <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </span>
                  )}

                  {nextBeach ? (
                      <Link
                          href={nextBeach.url}
                          className="flex items-center text-sm text-variable-collection-mesto transition-opacity duration-200 hover:opacity-80"
                      >
                          <span className="font-medium">{nextBeach.name}</span>
                          <svg
                              className="ml-1 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                          >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                              />
                          </svg>
                      </Link>
                  ) : (
                      <span className="flex cursor-not-allowed items-center text-sm opacity-50">
                  <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                  )}
              </div>
              )}

            {/* Right: Optional extras (share/like/user etc.) */}
            {rightExtras && (
              <div className="flex items-center gap-2">{rightExtras}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

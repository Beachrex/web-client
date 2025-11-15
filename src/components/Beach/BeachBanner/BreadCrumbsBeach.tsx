'use client';

import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import type { BeachDetailsSchema } from '@/lib/api-client/types.gen';

interface BeachTopBarProps {
  /** Full pathname to render breadcrumbs, e.g. /en/beaches/croatia/dalmatia/vodice/beach-hangar */
  pathname: string;
  /** Beach details from API (includes navigation data) */
  beachDetails?: BeachDetailsSchema;
  /** Show/hide the breadcrumbs row */
  showBreadcrumbs?: boolean;
  /** Optional right-side extras (share/save etc.) */
  rightExtras?: React.ReactNode;
}

/**
 * Build beach detail page URL from current URL params and new beach slug
 * Format: /[locale]/beaches/[country]/[region]/[city]/[beach-slug]
 */
function buildBeachUrl(
  locale: string,
  countrySlug: string,
  regionSlug: string,
  citySlug: string,
  beachSlug: string
): string {
  return `/${locale}/beaches/${countrySlug}/${regionSlug}/${citySlug}/${beachSlug}`;
}

export default function BeachTopBar({
  pathname,
  beachDetails,
  showBreadcrumbs = true,
  rightExtras,
}: BeachTopBarProps) {
  const t = useTranslations('BeachNavigation');
  const locale = useLocale();
  const params = useParams();

  // Extract URL params from current page (these are already slugs)
  const countrySlug = params?.continent as string;
  const regionSlug = params?.city as string;
  const citySlug = params?.region as string;

  // Build navigation URLs using current URL params and new beach slug
  const prevBeach = beachDetails?.navigation?.previous?.slug
    ? {
        name: beachDetails.navigation.previous.name ?? '',
        url: buildBeachUrl(
          locale,
          countrySlug,
          regionSlug,
          citySlug,
          beachDetails.navigation.previous.slug
        ),
      }
    : null;

  const nextBeach = beachDetails?.navigation?.next?.slug
    ? {
        name: beachDetails.navigation.next.name ?? '',
        url: buildBeachUrl(
          locale,
          countrySlug,
          regionSlug,
          citySlug,
          beachDetails.navigation.next.slug
        ),
      }
    : null;

  // Get translated labels with fallback
  const prevLabel = t('previousBeach', { defaultValue: 'Previous beach' });
  const nextLabel = t('nextBeach', { defaultValue: 'Next beach' });

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

            {/* Right: Optional extras (share/like/user etc.) */}
            {rightExtras && (
              <div className="flex items-center gap-2">{rightExtras}</div>
            )}
          </div>
        )}

        {/* Prev / Next beach controls */}
        {(prevBeach ?? nextBeach) && (
          <div className="flex items-center justify-between gap-3 pb-3">
            {/* Prev beach */}
            {prevBeach?.url ? (
              <Link
                href={prevBeach.url}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="whitespace-nowrap">{prevLabel}</span>
                {/* Show the beach name lightly, but allow it to wrap if long */}
                <span className="truncate text-[#0069AB]">
                  {prevBeach.name}
                </span>
              </Link>
            ) : (
              <button
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border px-3 py-2 text-sm opacity-50"
                disabled
                aria-disabled
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="whitespace-nowrap">{prevLabel}</span>
              </button>
            )}

            {/* Next beach */}
            {nextBeach?.url ? (
              <Link
                href={nextBeach.url}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <span className="whitespace-nowrap">{nextLabel}</span>
                {/* Show the beach name lightly, but allow it to wrap if long */}
                <span className="truncate text-[#0069AB]">
                  {nextBeach.name}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border px-3 py-2 text-sm opacity-50"
                disabled
                aria-disabled
              >
                <span className="whitespace-nowrap">{nextLabel}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


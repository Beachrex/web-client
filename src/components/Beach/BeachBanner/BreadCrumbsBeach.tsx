'use client';

import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BeachNavItem {
  name: string;
  url: string;
}

interface BeachTopBarProps {
  /** Full pathname to render breadcrumbs, e.g. /evropa/hrvaska/kvarner/otok-krk/malinska/plaza-haludovo */
  pathname: string;
  /** Show/hide the breadcrumbs row */
  showBreadcrumbs?: boolean;
  /** Previous beach (left control). If missing, button is disabled. */
  prevBeach?: BeachNavItem | null;
  /** Next beach (right control). If missing, button is disabled. */
  nextBeach?: BeachNavItem | null;
  /** Optional labels, default to “Ena plaža / Enedruga plaža” */
  prevLabel?: string;
  nextLabel?: string;
  /** Optional right-side extras (share/save etc.) */
  rightExtras?: React.ReactNode;
}

export default function BeachTopBar({
  pathname,
  showBreadcrumbs = true,
  prevBeach,
  nextBeach,
  prevLabel = 'Ena plaža',
  nextLabel = 'Enedruga plaža',
  rightExtras,
}: BeachTopBarProps) {
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
            {prevBeach ? (
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
            {nextBeach ? (
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

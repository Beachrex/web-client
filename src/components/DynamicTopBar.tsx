'use client';

import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs';
import DynamicPagination, {
    type NavigationData,
    type NavigationItem,
} from '@/components/DynamicPagination';
import type React from 'react';
import { VARIANT_ACCENT_COLOR, VARIANT_TEXT_CLASS, type PageVariant } from './ui/pageVariants';


interface DynamicTopBarProps {
  /** Full pathname including locale, used for breadcrumbs */
  pathname: string;
  /** Navigation block from API (previous/next) with pre-computed URLs */
  navigation?: NavigationData | null;
  /** URL builder for navigation items (optional, for backward compatibility with client components) */
  buildUrl?: (item: NavigationItem) => string;
  /** Show / hide breadcrumbs on the left */
  showBreadcrumbs?: boolean;
  variant: PageVariant;
  /** Optional extra content on the right (buttons, icons, etc.) */
  rightExtras?: React.ReactNode;
  /** Optional wrapper classes */
  className?: string;
}

export default function DynamicTopBar({
  pathname,
  navigation,
  buildUrl,
  variant,
  showBreadcrumbs = true,
  rightExtras,
  className = '',
}: DynamicTopBarProps) {
  // Has pagination if navigation exists and either has pre-computed URLs or buildUrl function
  const hasPagination = Boolean(
    navigation &&
    ((navigation.previous?.url != null) || (navigation.next?.url != null) || (buildUrl != null))
  );
  const hasRightSide = hasPagination || Boolean(rightExtras);

  if (!showBreadcrumbs && !hasRightSide) {
    return null;
  }

  const textClass = VARIANT_TEXT_CLASS[variant];
const accentColor = VARIANT_ACCENT_COLOR[variant];

  return (
    <div className={`w-full bg-white/80 backdrop-blur ${className}`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Left: Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="min-w-0 flex-1">
              <DynamicBreadcrumbs
  pathname={pathname}
  textClass={textClass}
  accentColor={accentColor}
              />

            </div>
          )}

          {/* Right: Pagination + extras */}
          {hasRightSide && (
            <div className="ml-4 flex items-center gap-4">
              {hasPagination && navigation && (
                <DynamicPagination
  navigation={navigation}
  buildUrl={buildUrl}
  textClass={textClass}
  accentColor={accentColor}
                />

              )}

              {rightExtras && (
                <div className="flex items-center gap-2">{rightExtras}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export interface NavigationItemLocation {
  continent_slug?: string | null;
  country_slug?: string | null;
  region_slug?: string | null;
  island_slug?: string | null;
  city_slug?: string | null;
}

export interface NavigationItem {
  id?: number | string;
  code?: string;
  name?: string | null;
  slug?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  main_image?: string | null;
  location?: NavigationItemLocation | null;
  // Allow extra fields from API
  [key: string]: unknown;
}

export interface NavigationData {
  previous?: NavigationItem | null;
  next?: NavigationItem | null;
}

interface DynamicPaginationProps {
  /** Navigation object returned from API (previous/next) */
  navigation?: NavigationData | null;
  /** URL builder for navigation items (depends on page type) */
  buildUrl: (item: NavigationItem) => string;
  /** Optional extra classes for outer wrapper */
  className?: string;
}

export default function DynamicPagination({
  navigation,
  buildUrl,
  className = '',
}: DynamicPaginationProps) {
  const prev = navigation?.previous ?? null;
  const next = navigation?.next ?? null;

  // Nothing to show
  if (!prev && !next) return null;

  const renderPrev = () => {
    if (!prev) return null;


    return (
      <Link
        href={buildUrl(prev)}
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
        <span className="font-medium">{prev.name}</span>
      </Link>
    );
  };

  const renderNext = () => {
    if (!next) return null;

    return (
      <Link
        href={buildUrl(next)}
        className="flex items-center text-sm text-variable-collection-mesto transition-opacity duration-200 hover:opacity-80"
      >
        <span className="font-medium">{next.name}</span>
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
    );
  };

  return (
    <div className={`flex items-center space-x-4 font-light ${className}`}>
      {renderPrev()}
      {renderNext()}
    </div>
  );
}

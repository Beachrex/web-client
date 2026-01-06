'use client';

import Link from 'next/link';
import React from 'react';

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
  url?: string; // Pre-computed URL (for server components)
  // Allow extra fields from API
  [key: string]: unknown;
}

export interface NavigationData {
  previous?: NavigationItem | null;
  next?: NavigationItem | null;
}

interface DynamicPaginationProps {
  /** Navigation object returned from API (previous/next) with pre-computed URLs */
  navigation?: NavigationData | null;
  /** URL builder for navigation items (optional, for backward compatibility with client components) */
  buildUrl?: (item: NavigationItem) => string;
  /** Optional extra classes for outer wrapper */
  className?: string;
  textClass?: string;
  accentColor?: string;
}

export default function DynamicPagination({
  navigation,
  buildUrl,
  className = '',
  textClass,
  accentColor,
}: DynamicPaginationProps) {

  const prev = navigation?.previous ?? null;
  const next = navigation?.next ?? null;

  // Nothing to show
  if (!prev && !next) return null;

const handleEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (accentColor) {
    e.currentTarget.style.color = accentColor;
  }
};

const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.color = '';
};

  const renderPrev = () => {
    if (!prev) return null;

    // Use pre-computed URL if available, otherwise use buildUrl function
    const href = prev.url ?? (buildUrl ? buildUrl(prev) : '#');

    return (
      <Link
        href={href}
       className={`flex items-center text-sm font-medium
  transition-colors duration-200 ease-out
  hover:underline hover:underline-offset-4
  ${textClass ?? 'text-variable-collection-mesto'}
`}

onMouseEnter={handleEnter}
onMouseLeave={handleLeave}

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

    // Use pre-computed URL if available, otherwise use buildUrl function
    const href = next.url ?? (buildUrl ? buildUrl(next) : '#');


    return (
      <Link
        href={href}
        className={`flex items-center text-sm font-medium
  transition-colors duration-200 ease-out
  hover:underline hover:underline-offset-4
  ${textClass ?? 'text-variable-collection-mesto'}
`}


onMouseEnter={handleEnter}
onMouseLeave={handleLeave}

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
    <div className={`flex items-center gap-8 font-light ${className}`}>
      {renderPrev()}
      {renderNext()}
    </div>
  );
}

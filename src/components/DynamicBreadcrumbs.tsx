'use client';

import { Link } from '@/i18n/routing';
import { Breadcrumb } from 'flowbite-react';
import { useLocale } from 'next-intl';
import { Home } from 'lucide-react';

interface DynamicBreadcrumbsProps {
  pathname: string;
}

function formatBreadcrumbSegment(segment: string): string {
  return segment
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function DynamicBreadcrumbs({
  pathname,
}: DynamicBreadcrumbsProps) {
  const locale = useLocale();

  const pathSegments = pathname.split('/').filter((s) => s.length > 0);
  const filteredSegments = pathSegments.filter((s) => s !== locale);

  const breadcrumbs = filteredSegments.map((segment, index) => {
    const href = `/${filteredSegments.slice(0, index + 1).join('/')}`;
    const formatted = formatBreadcrumbSegment(segment);
    const isCurrent = index === filteredSegments.length - 1;

    return (
      <Breadcrumb.Item key={index}>
        <Link
          href={href}
          className={`text-xs transition-colors duration-200 ${
            isCurrent
              ? 'font-medium text-variable-collection-mesto'
              : 'text-variable-collection-middle-grey hover:text-variable-collection-mesto'
          }`}
        >
          {formatted}
        </Link>
      </Breadcrumb.Item>
    );
  });

  return (
    <div className="w-full px-4 sm:px-6">
      {/* 📱 MOBILE: only home icon, centered */}
      <div className="flex justify-center py-1 sm:hidden">
        <Link
          href="/"
          className="text-variable-collection-middle-grey hover:text-variable-collection-mesto"
        >
          <Home className="h-5 w-5" />
        </Link>
      </div>

      {/* 🖥️ DESKTOP: normal breadcrumbs */}
      <div className="scrollbar-hide hidden max-w-full overflow-x-auto sm:block">
        <Breadcrumb
          aria-label="Dynamic breadcrumbs"
          className="flex items-center whitespace-nowrap"
        >
          <Breadcrumb.Item>
            <Link
              href="/"
              className="flex items-center justify-center text-variable-collection-middle-grey hover:text-variable-collection-mesto"
            >
              <Home className="h-4 w-4" />
            </Link>
          </Breadcrumb.Item>

          {breadcrumbs}
        </Breadcrumb>
      </div>
    </div>
  );
}

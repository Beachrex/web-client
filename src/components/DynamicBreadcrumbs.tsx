'use client';

import { Link } from '@/i18n/routing';
import { Breadcrumb } from 'flowbite-react';
import { useLocale, useTranslations } from 'next-intl';
import { getBeachesWord } from '@/lib/utils/beach-urls';
import { breadcrumbLabel } from '@/lib/utils/breadcrumb-labels';
import { Home } from 'lucide-react';

interface DynamicBreadcrumbsProps {
  pathname: string;
  textClass: string;
  accentColor: string;
  /** `slug → localized name` for the segments (see `breadcrumbLabels`); unknown slugs are title-cased. */
  labels?: Record<string, string>;
}


export default function DynamicBreadcrumbs({
  pathname,
  textClass,
  accentColor,
  labels = {},
}: DynamicBreadcrumbsProps) {
  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const segmentLabels = { [getBeachesWord(locale)]: tCommon('statsBeaches'), ...labels };
  const formatBreadcrumbSegment = (segment: string) => breadcrumbLabel(segment, segmentLabels);

  if (!pathname) {
    return null;
  }

  const pathSegments = pathname.split('/').filter(s => s.length > 0);
  const filteredSegments: string[] = pathSegments.filter(s => s !== locale);

 const lastSegment = filteredSegments.at(-1);

const currentSegment = lastSegment
  ? formatBreadcrumbSegment(lastSegment)
  : null;


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
              ? `font-medium ${textClass}`
              : 'text-variable-collection-middle-grey'
          }`}
          onMouseEnter={e => {
            if (!isCurrent) e.currentTarget.style.color = accentColor;
          }}
          onMouseLeave={e => {
            if (!isCurrent) e.currentTarget.style.color = '';
          }}
        >
          {formatted}
        </Link>
      </Breadcrumb.Item>
    );
  });

  return (
    <div className="w-full px-4 sm:px-6">
      {/* MOBILE: Home + current location */}
      <div className="flex items-center justify-start gap-2 py-1 sm:hidden">


        <Link
  href="/"
  style={{ '--accent': accentColor } as React.CSSProperties}
  className="
    flex items-center justify-center
    text-variable-collection-middle-grey
    transition-colors duration-200
    hover:text-[var(--accent)]
    active:text-[var(--accent)]
  "
        >
  <Home className="h-5 w-5 stroke-current" />
</Link>


 {currentSegment && (
  <>
    <span
      className={`text-xs font-medium ${textClass} max-w-[50vw] truncate`}
    >
      {currentSegment}
    </span>
  </>
)}


      </div>

      {/* DESKTOP: full breadcrumbs */}
      <div className="scrollbar-hide hidden max-w-full overflow-x-auto sm:block">
        <Breadcrumb
          aria-label="Dynamic breadcrumbs"
          className="flex items-center whitespace-nowrap"
        >
          <Breadcrumb.Item>
            <Link
  href="/"
  style={{ '--accent': accentColor } as React.CSSProperties}
  className="
    flex items-center justify-center
    text-variable-collection-middle-grey
    transition-colors duration-200
    hover:text-[var(--accent)]
    active:text-[var(--accent)]
  "
            >
  <Home className="h-4 w-4 stroke-current" />
</Link>


          </Breadcrumb.Item>

          {breadcrumbs}
        </Breadcrumb>
      </div>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useFooterStaticPages } from '@/hooks/useStaticPages';

export default function FooterInfoColumn() {
  const t = useTranslations('Footer.info');

  // CMS-managed footer pages (fully admin-managed, no hardcoded fallback). The column shows only
  // its heading if the API is unreachable.
  const dynamicPages = useFooterStaticPages();

  const sortedPages = [...(dynamicPages ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  return (
    <div className="space-y-3">
      <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
        {t('title')}
      </h2>

      <ul className="space-y-2">
        {sortedPages.map((page) => (
          <li key={page.id}>
            {/* `p` prefix is constant across locales; routing Link adds the locale prefix */}
            <Link
              href={`/p/${page.slug}`}
              className="font-figtree text-[14px] font-medium leading-none text-[#4D4D4D] transition hover:text-[#1A3C68] hover:underline"
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

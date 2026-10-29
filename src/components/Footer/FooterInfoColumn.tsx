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
    <div>
      <h2 className="mb-4 font-figtree text-[15px] font-bold leading-tight text-[#1A3C68]">
        {t('title')}
      </h2>

      <ul className="space-y-3">
        {sortedPages.map((page) => (
          <li key={page.id}>
            {/* `p` prefix is constant across locales; routing Link adds the locale prefix */}
            <Link
              href={`/p/${page.slug}`}
              className="font-figtree text-[14px] font-medium leading-5 text-[#4D4D4D] transition hover:text-[#1A3C68] hover:underline"
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

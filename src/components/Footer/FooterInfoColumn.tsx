'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/i18n/routing';
import { getStaticPagesForFooter } from '@/lib/api-client/sdk.gen';
import type {
  AcceptLanguage,
  StaticPageFooter,
} from '@/lib/api-client/types.gen';

export default function FooterInfoColumn() {
  const t = useTranslations('Footer.info');
  const locale = useLocale();

  // Fetch CMS-managed footer pages via the generated SDK. The links are fully
  // admin-managed now (no hardcoded fallback). The backend resolves
  // translations by Accept-Language (with EN fallback) and maps the frontend
  // `si` code to its internal `sl`. Returns [] on error so the column simply
  // shows its heading with no links if the API is unreachable.
  const { data: dynamicPages } = useQuery<StaticPageFooter[]>({
    queryKey: ['static-pages', 'footer', locale],
    queryFn: async () => {
      try {
        const { data } = await getStaticPagesForFooter({
          headers: { 'Accept-Language': locale as AcceptLanguage },
        });
        return data?.data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1h — matches backend cache + ISR
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });

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

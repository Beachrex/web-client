'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getBeachesForFooter } from '@/lib/api-client/sdk.gen';
import type { AcceptLanguage, BeachFooter } from '@/lib/api-client/types.gen';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';

export default function FooterMostViewedColumn() {
  const t = useTranslations('Footer.mostViewed');
  const locale = useLocale();

  // Fetch the 6 most visited beaches for the footer via the generated SDK.
  // The links are fully API-driven now (no hardcoded fallback). Returns [] on
  // error so the column just shows its heading with no links if the API is
  // unreachable. The backend resolves translations by Accept-Language (with EN
  // fallback).
  const { data: beaches } = useQuery<BeachFooter[]>({
    queryKey: ['beaches', 'footer', locale],
    queryFn: async () => {
      try {
        const { data } = await getBeachesForFooter({
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

  return (
    <div className="space-y-3">
      <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
        {t('title')}
      </h2>

      <ul className="space-y-2">
        {(beaches ?? []).map((beach) => {
          // buildBeachUrlFromSchema returns the full /{locale}/beaches/.../{slug}
          // URL (locale already included), so use plain next/link (not the
          // routing Link, which would prepend the locale again → /en/en/...).
          // Returns null if required slugs (continent/country/beach) are missing.
          const href = buildBeachUrlFromSchema(beach, locale);
          if (!href) return null;
          return (
            <li key={beach.id}>
              <Link
                href={href}
                className="font-figtree text-[14px] font-medium leading-none text-[#4D4D4D] hover:underline hover:text-[#1A3C68] transition"
              >
                {beach.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

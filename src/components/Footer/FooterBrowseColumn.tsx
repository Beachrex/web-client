'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { footerBrowseHrefs } from '@/lib/utils/footer-links';

interface LinkItem { label: string }

export default function FooterBrowseColumn() {
  const t = useTranslations('Footer.browse');
  const locale = useLocale();
  const labels = t.raw('links') as LinkItem[];
  const hrefs = footerBrowseHrefs(locale);

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
        {t('title')}
      </h2>

      {/* Links */}
      <ul className="space-y-2">
        {labels.map((item, idx) => {
          const href = hrefs[idx];
          if (!href) return null;
          return (
            <li key={idx}>
              <Link
                href={href}
                className="font-figtree text-[14px] font-medium leading-none text-[#4D4D4D] transition hover:text-[#1A3C68] hover:underline"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

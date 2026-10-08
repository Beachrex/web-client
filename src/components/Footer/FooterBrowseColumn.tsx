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
    <div>
      {/* Title */}
      <h2 className="mb-4 font-figtree text-[15px] font-bold leading-tight text-[#1A3C68]">
        {t('title')}
      </h2>

      {/* Links */}
      <ul className="space-y-3">
        {labels.map((item, idx) => {
          const href = hrefs[idx];
          if (!href) return null;
          return (
            <li key={idx}>
              <Link
                href={href}
                className="font-figtree text-[14px] font-medium leading-5 text-[#4D4D4D] transition hover:text-[#1A3C68] hover:underline"
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

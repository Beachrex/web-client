'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface LinkItem { label: string; href: string }

export default function FooterBrowseColumn() {
  const t = useTranslations('Footer.browse');
  const links = t.raw('links') as LinkItem[];

  return (
    <div className="space-y-3">
      {/* Title */}
      <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
        {t('title')}
      </h2>

      {/* Links */}
      <ul className="space-y-2">
        {links.map((item, idx) => (
          <li key={idx}>
            <Link
              href={item.href}
              className="font-figtree text-[14px] font-medium leading-none text-[#4D4D4D] transition hover:text-[#1A3C68] hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

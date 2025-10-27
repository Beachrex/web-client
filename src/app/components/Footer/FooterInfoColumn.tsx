'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface LinkItem { label: string; href: string }

export default function FooterInfoColumn() {
  const t = useTranslations('Footer.info');
  const links = t.raw('links') as LinkItem[];

  return (
    <div className="space-y-3">
      <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
        {t('title')}
      </h2>

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

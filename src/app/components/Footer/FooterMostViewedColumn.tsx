'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function FooterMostViewedColumn() {
  const t = useTranslations('Footer.mostViewed');


  const beaches = t.raw('links') as string[];

  return (
    <div className="space-y-3">

      <h2 className="font-figtree text-[14px] font-bold leading-none text-[#4D4D4D]">
        {t('title')}
      </h2>

      <ul className="space-y-2">
        {beaches.map((beach, idx) => (
          <li key={idx}>
            <Link
              href="#"
              className="font-figtree text-[14px] font-medium leading-none text-[#4D4D4D] hover:underline hover:text-[#1A3C68] transition"
            >
              {beach}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

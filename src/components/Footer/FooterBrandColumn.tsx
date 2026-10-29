'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { authorUrl } from '@/lib/constants/author';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';
import FooterAppBadges from './FooterAppBadges';
import FooterSocial from './FooterSocial';

/** Logo from the brand package (CGP v1.0, `public/brand/`). */
const FOOTER_LOGO = '/brand/BeachRex_CGP/01_Logo/Horizontal/SVG/beachrex_horizontal_color.svg';

export default function FooterBrandColumn() {
  const t = useTranslations('Footer.brand');
  const tAuthor = useTranslations('AuthorPage');
  // Locale-prefixed hrefs: a bare '/' or '/beach-map' let the NEXT_LOCALE cookie pick the language (QA #25, #74)
  const locale = useLocale();

  return (
    <div className="flex flex-col items-start gap-5">
      <Link href={`/${locale}`} aria-label="BeachRex">
        <Image
src={FOOTER_LOGO} alt="BeachRex" width={166}
height={32} className="h-8 w-auto"
        />
      </Link>

      <p className="max-w-xs font-figtree text-[14px] leading-6 text-[#4D4D4D]">{t('desc')}</p>

      {/* Author page (owner, 2026-10-08) */}
      <Link
        href={authorUrl(locale)}
        className="-mt-2 font-figtree text-[14px] font-semibold text-[#1A3C68] underline-offset-4 hover:underline"
      >
        {tAuthor('footerLink')} →
      </Link>

      <Link
        href={buildBeachMapUrl(locale)}
        className={[
          'inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-5 py-2.5',
          'font-figtree text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78]',
        ].join(' ')}
      >
        <Image
src="/images/map.png" alt="" width={20}
height={20}
        />
        <span>{t('cta')}</span>
      </Link>

      <FooterAppBadges />

      <FooterSocial />
    </div>
  );
}

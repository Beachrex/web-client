'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

/**
 * Error boundary inside the locale layout (header and footer stay): a page that throws while
 * rendering shows this localized message with a retry instead of the default Next.js error screen.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('ErrorPage');
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-figtree text-[14px] font-bold uppercase tracking-wide text-[#0069AB]">{t('subtitle')}</p>
      <h1 className="mt-3 font-figtree text-[30px] font-bold text-[#222222]">{t('title')}</h1>
      <p className="mt-4 max-w-xl font-figtree text-[16px] text-[#4D4D4D]">{t('description')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-[#1A3C68] px-5 py-3 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f]"
        >
          {t('retry')}
        </button>
        <Link
          href={`/${locale}`}
          className="rounded-md bg-[#F5F5F5] px-5 py-3 font-figtree text-[14px] font-bold text-[#4D4D4D] hover:bg-[#E7E7E7]"
        >
          {t('goHome')}
        </Link>
      </div>
    </section>
  );
}

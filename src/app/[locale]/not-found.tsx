import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { buildBeachMapUrl, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * 404 inside the locale layout (header and footer stay). Unknown URLs reach it through the
 * `[...rest]` catch-all; pages call `notFound()` for missing data.
 */
export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  return (
    <section className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-figtree text-[14px] font-bold uppercase tracking-wide text-[#0069AB]">404 · {t('subtitle')}</p>
      <h1 className="mt-3 font-figtree text-[30px] font-bold text-[#222222]">{t('title')}</h1>
      <p className="mt-4 max-w-xl font-figtree text-[16px] text-[#4D4D4D]">{t('description')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="rounded-md bg-[#1A3C68] px-5 py-3 font-figtree text-[14px] font-bold text-white hover:bg-[#162f4f]"
        >
          {t('goHome')}
        </Link>
        <Link
          href={`/${locale}/${getBeachesWord(locale)}`}
          className="rounded-md bg-[#F5F5F5] px-5 py-3 font-figtree text-[14px] font-bold text-[#4D4D4D] hover:bg-[#E7E7E7]"
        >
          {t('browseBeaches')}
        </Link>
        <Link
          href={buildBeachMapUrl(locale)}
          className="rounded-md bg-[#0069AB] px-5 py-3 font-figtree text-[14px] font-bold text-white hover:opacity-90"
        >
          {tCommon('mapButtonFilter')}
        </Link>
      </div>
    </section>
  );
}

/**
 * Author page — /{locale}/gregor-balazic (owner, 2026-10-08).
 *
 * A dedication to Gregor Balažic, who left his job and visited 2,445 beaches with a camera and a
 * van; the photos, spheres and details on Beachrex come from that journey. Follows the platform's
 * design (owner: "closer to the platform"): a photo banner with the faded category word behind the
 * title like the country pages, navy pill, light-blue cards, 10 px radii, Figtree headings in #222.
 * Text in all 19 locales (`AuthorPage`); Person structured data.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  AUTHOR_BEACH_PHOTO,
  AUTHOR_NAME,
  AUTHOR_PATH,
  AUTHOR_PHOTO,
  AUTHOR_ROUTE,
  AUTHOR_STATS,
  numberLocale,
} from '@/lib/constants/author';
import { buildBeachMapUrl } from '@/lib/utils/beach-urls';
import {
  buildCanonicalUrl,
  buildCompleteMetadata,
  buildLocalizedAlternates,
  getBaseUrl,
} from '@/lib/utils/metadata-helpers';
import { renderJsonLd } from '@/lib/utils/json-ld-helpers';

interface PageProps {
  params: { locale: string };
}

type ChapterKey = 'leap' | 'road' | 'database' | 'hardships';

// Page width like the listing pages; not `container` (globals.css overrides its padding)
const WRAP = 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AuthorPage' });
  return buildCompleteMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    path: AUTHOR_PATH,
    type: 'article',
    images: [`${getBaseUrl()}${AUTHOR_PHOTO}`],
    alternateLanguages: buildLocalizedAlternates(() => AUTHOR_PATH),
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { locale } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AuthorPage' });
  // Always group thousands: Slovenian (and others) would print 2445 while the text says 2.445
  const fmt = new Intl.NumberFormat(numberLocale(locale), { useGrouping: 'always' } as unknown as Intl.NumberFormatOptions);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    jobTitle: t('role'),
    description: t('metaDescription'),
    image: `${getBaseUrl()}${AUTHOR_PHOTO}`,
    url: buildCanonicalUrl(locale, AUTHOR_PATH),
    worksFor: { '@type': 'Organization', name: 'BeachRex', url: getBaseUrl() },
  };

  const chapter = (key: ChapterKey, n: number) => (
    <section key={key} aria-labelledby={`chapter-${key}`}>
      <p className="font-figtree text-[14px] font-bold text-[#FF8000]">{String(n).padStart(2, '0')}</p>
      <h2 id={`chapter-${key}`} className="mt-1 font-figtree text-[26px] font-bold leading-tight text-[#222222] sm:text-[30px]">
        {t(`chapters.${key}.title`)}
      </h2>
      <p className="mt-4 font-figtree text-[17px] leading-[1.75] text-[#4D4D4D]">{t(`chapters.${key}.text`)}</p>
    </section>
  );

  return (
    <article className="pb-16 font-figtree">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(personSchema) }} />

      {/* Banner like the country pages: photo, pill, faded word behind the name */}
      <header
        className={[
          'relative mx-auto h-[460px] w-full max-w-[1928px] overflow-hidden rounded-[10px]',
          'bg-cover bg-center sm:h-[560px] lg:h-[620px]',
        ].join(' ')}
        style={{ backgroundImage: `url(${AUTHOR_BEACH_PHOTO})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
        <div className="relative z-10 flex h-full flex-col p-4 sm:p-6 lg:p-8">
          <span className="inline-flex w-fit items-center rounded-full bg-[#1A3C68] px-4 py-1.5 text-[14px] font-bold text-white shadow">
            {t('eyebrow')}
          </span>

          <div className="flex flex-1 flex-col justify-center">
            <div className="relative">
              <span
                aria-hidden
                className={[
                  'block font-bold leading-[100%] text-white opacity-30',
                  'text-[72px] sm:text-[120px] md:text-[160px] lg:text-[200px]',
                ].join(' ')}
              >
                {t('bannerWord')}
              </span>
              <h1
                className={[
                  'absolute bottom-0 left-[20px] font-bold leading-[100%] text-white',
                  'text-[38px] sm:left-[50px] sm:text-[60px] md:left-[80px] md:text-[80px] lg:left-[100px] lg:text-[96px]',
                ].join(' ')}
              >
                {AUTHOR_NAME}
              </h1>
            </div>
            <p className="ml-[20px] mt-6 max-w-2xl text-[18px] font-semibold text-white sm:ml-[50px] sm:text-[22px] md:ml-[80px] lg:ml-[100px]">
              {t('role')}
            </p>
          </div>
        </div>
      </header>

      {/* Stats: platform cards */}
      <div className={`${WRAP} mt-10`}>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {AUTHOR_STATS.map((s) => (
            <div key={s.key} className="rounded-[10px] bg-[#E5F2FB] px-5 py-6 text-center shadow-sm">
              <dt className="sr-only">{t(`stats.${s.key}`)}</dt>
              <dd>
                <span className="block text-[32px] font-bold leading-none text-[#1A3C68] sm:text-[40px]">
                  {fmt.format(s.value)}
                  {s.plus && '+'}
                </span>
                <span className="mt-2 block text-[14px] font-medium text-[#4D4D4D] sm:text-[15px]">
                  {t(`stats.${s.key}`)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Story with the author card */}
      <div className={`${WRAP} mt-16 grid gap-12 lg:grid-cols-12`}>
        <div className="space-y-12 lg:col-span-7">
          <p className="text-[24px] font-semibold leading-snug text-[#1A3C68] sm:text-[28px]">{t('lead')}</p>
          {chapter('leap', 1)}
          {chapter('road', 2)}

          {/* Route along the coasts */}
          <div className="rounded-[10px] bg-[#F5F5F5] p-5 sm:p-6">
            <h3 className="text-[16px] font-bold text-[#222222]">{t('routeTitle')}</h3>
            <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3">
              {AUTHOR_ROUTE.map((c, i) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3.5 shadow-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A3C68] text-[12px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[14px] font-semibold text-[#222222]">{t(`countries.${c}`)}</span>
                  </span>
                  {i < AUTHOR_ROUTE.length - 1 && <span className="text-[#8D8D8D]" aria-hidden>›</span>}
                </li>
              ))}
            </ol>
          </div>

          {chapter('database', 3)}
          {chapter('hardships', 4)}
        </div>

        {/* Author card, like the platform's beach cards */}
        <aside className="lg:col-span-5">
          <figure className="overflow-hidden rounded-[10px] shadow-md lg:sticky lg:top-28">
            <Image
              src={AUTHOR_PHOTO}
              alt={t('photoAlt')}
              width={750}
              height={499}
              priority
              sizes="(min-width: 1024px) 520px, 92vw"
              className="w-full object-cover"
            />
            <figcaption className="bg-[#E5F2FB] px-5 py-4">
              <span className="block text-[20px] font-bold text-[#1A3C68]">{AUTHOR_NAME}</span>
              <span className="mt-1 block text-[14px] text-[#4D4D4D]">{t('role')}</span>
            </figcaption>
          </figure>
        </aside>
      </div>

      {/* Quote */}
      <div className={`${WRAP} mt-16`}>
        <figure className="rounded-[10px] bg-[#1A3C68] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <span className="block text-[64px] font-bold leading-none text-[#FF8000]" aria-hidden>“</span>
          <blockquote className="mx-auto -mt-2 max-w-3xl text-[22px] font-semibold leading-snug sm:text-[30px]">
            <p>{t('quote')}</p>
          </blockquote>
          <figcaption className="mt-6 text-[15px] font-bold text-white/80">— {AUTHOR_NAME}</figcaption>
        </figure>
      </div>

      {/* Call to action */}
      <div className={`${WRAP} mt-16 text-center`}>
        <h2 className="text-[26px] font-bold text-[#222222] sm:text-[30px]">{t('ctaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] text-[#4D4D4D]">{t('ctaText')}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={buildBeachMapUrl(locale)}
            className="inline-flex items-center gap-2 rounded-md bg-[#1A3C68] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#2a4c78]"
          >
            <Image
src="/images/map.png" alt="" width={20}
height={20} />
            {t('ctaMap')}
          </a>
          <a
            href="mailto:info@beachrex.com"
            className="inline-flex items-center rounded-md border border-[#1A3C68] px-5 py-2.5 text-[14px] font-bold text-[#1A3C68] transition-colors hover:bg-[#1A3C68] hover:text-white"
          >
            {t('ctaContact')}
          </a>
        </div>
      </div>
    </article>
  );
}

/** Static text and images; refresh daily. */
export const revalidate = 86400;

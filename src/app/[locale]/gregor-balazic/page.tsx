/**
 * Author page — /{locale}/gregor-balazic (owner, 2026-10-08).
 *
 * A dedication to Gregor Balažic, who left his job and visited 2,445 beaches with a camera and a
 * van; the photos, spheres and details on Beachrex come from that journey. Designed as a feature
 * story, not a CMS text page: hero with his photo, stats band, chapters, the route along the coasts,
 * a pull quote and a call to action. Text in all 19 locales (`AuthorPage`); Person structured data.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
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
import { buildCanonicalUrl, buildCompleteMetadata, buildLocalizedAlternates, getBaseUrl } from '@/lib/utils/metadata-helpers';
import { renderJsonLd } from '@/lib/utils/json-ld-helpers';

interface PageProps {
  params: { locale: string };
}

const CHAPTERS = ['leap', 'road', 'database', 'hardships'] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
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

/** Decorative sun from the logo: rays fanning up from the horizon. */
function SunRays({ className }: { className?: string }) {
  const angles = Array.from({ length: 13 }, (_, i) => 12 + i * 13);
  return (
    <svg
viewBox="0 0 400 210" className={className} aria-hidden
fill="none"
    >
      {angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={200 + 80 * Math.cos(rad)}
            y1={200 - 80 * Math.sin(rad)}
            x2={200 + 190 * Math.cos(rad)}
            y2={200 - 190 * Math.sin(rad)}
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
          />
        );
      })}
      <rect
x="0" y="198" width="400"
height="12" rx="6" fill="currentColor"
      />
    </svg>
  );
}

export default async function AuthorPage({ params }: PageProps) {
  const { locale } = params;
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

  return (
    <article className="font-figtree text-[#0F3B45]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(personSchema) }} />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#0F3B45] text-white">
        <SunRays className="pointer-events-none absolute -right-24 -top-10 w-[520px] text-[#EB8751] opacity-[0.12] lg:w-[720px]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="lg:col-span-6">
            <p className="inline-flex rounded-full bg-[#00B2C9]/15 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-[#5FD6E6]">
              {t('eyebrow')}
            </p>
            <h1 className="mt-6 text-[44px] font-bold leading-[1.05] sm:text-[56px] lg:text-[72px]">{AUTHOR_NAME}</h1>
            <p className="mt-4 text-lg text-white/80 sm:text-xl">{t('role')}</p>
            <p className="mt-8 max-w-xl text-2xl font-semibold leading-snug text-[#F6B48F] sm:text-[28px]">{t('lead')}</p>
            <a
              href="#zgodba"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#EB8751] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#d9773f]"
            >
              {t('heroCta')}
              <span aria-hidden>↓</span>
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:col-span-6">
            <div className="absolute -bottom-4 -right-4 h-full w-full rounded-[28px] bg-[#EB8751]" aria-hidden />
            <Image
              src={AUTHOR_PHOTO}
              alt={t('photoAlt')}
              width={750}
              height={499}
              priority
              sizes="(min-width: 1024px) 560px, 92vw"
              className="relative w-full rounded-[28px] object-cover shadow-2xl"
            />
          </div>
        </div>
      </header>

      {/* Stats band, overlapping the hero */}
      <section aria-label={t('eyebrow')} className="relative z-10 mx-auto -mt-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-[#E5EEF0] shadow-xl lg:grid-cols-4">
          {AUTHOR_STATS.map((s) => (
            <div key={s.key} className="bg-white px-6 py-7 text-center sm:py-9">
              <dt className="sr-only">{t(`stats.${s.key}`)}</dt>
              <dd>
                <span className="block text-[34px] font-bold leading-none text-[#00B2C9] sm:text-[44px]">
                  {fmt.format(s.value)}
                  {s.plus && <span className="text-[#EB8751]">+</span>}
                </span>
                <span className="mt-2 block text-[14px] font-medium text-[#4D5F64] sm:text-[15px]">{t(`stats.${s.key}`)}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Story */}
      <section id="zgodba" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl space-y-16">
          {CHAPTERS.slice(0, 2).map((key, i) => (
            <Chapter
              key={key}
              n={i + 1}
              title={t(`chapters.${key}.title`)}
              text={t(`chapters.${key}.text`)}
              dropCap={i === 0}
            />
          ))}

          {/* Route along the coasts */}
          <div className="rounded-3xl bg-[#FFF4E8] px-6 py-8 sm:px-10">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#EB8751]">{t('routeTitle')}</h3>
            <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3">
              {AUTHOR_ROUTE.map((c, i) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00B2C9] text-[12px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[15px] font-semibold text-[#0F3B45]">{t(`countries.${c}`)}</span>
                  </span>
                  {i < AUTHOR_ROUTE.length - 1 && <span className="text-[#EB8751]" aria-hidden>→</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Wide photo */}
        <figure className="mx-auto mt-16 max-w-5xl">
          <Image
            src={AUTHOR_BEACH_PHOTO}
            alt={t('beachAlt')}
            width={750}
            height={498}
            sizes="(min-width: 1024px) 1000px, 92vw"
            className="w-full rounded-[28px] object-cover shadow-xl"
          />
          <figcaption className="mt-4 text-center text-[14px] italic text-[#4D5F64]">{t('beachCaption')}</figcaption>
        </figure>

        <div className="mx-auto mt-16 max-w-3xl space-y-16">
          {CHAPTERS.slice(2).map((key, i) => (
            <Chapter
              key={key}
              n={i + 3}
              title={t(`chapters.${key}.title`)}
              text={t(`chapters.${key}.text`)}
            />
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section className="relative overflow-hidden bg-[#00B2C9] text-white">
        <SunRays className="pointer-events-none absolute -bottom-24 left-1/2 w-[640px] -translate-x-1/2 text-white opacity-10" />
        <figure className="mx-auto w-full max-w-7xl relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="block text-[96px] font-bold leading-none text-[#0F3B45]/30" aria-hidden>“</span>
          <blockquote className="-mt-6 text-[26px] font-semibold leading-snug sm:text-[34px]">
            <p>{t('quote')}</p>
          </blockquote>
          <figcaption className="mt-8 text-[15px] font-bold uppercase tracking-[0.14em] text-[#0F3B45]">
            — {AUTHOR_NAME}
          </figcaption>
        </figure>
      </section>

      {/* Call to action */}
      <section className="bg-[#FFF4E8]">
        <div className="mx-auto w-full max-w-7xl mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <h2 className="text-[30px] font-bold leading-tight sm:text-[38px]">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#4D5F64]">{t('ctaText')}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={buildBeachMapUrl(locale)}
              className="inline-flex items-center rounded-full bg-[#0F3B45] px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#164f5c]"
            >
              {t('ctaMap')}
            </a>
            <a
              href="mailto:info@beachrex.com"
              className="inline-flex items-center rounded-full border-2 border-[#0F3B45] px-7 py-3 text-[15px] font-bold text-[#0F3B45] transition hover:bg-[#0F3B45] hover:text-white"
            >
              {t('ctaContact')}
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}

function Chapter({ n, title, text, dropCap = false }: { n: number; title: string; text: string; dropCap?: boolean }) {
  return (
    <div>
      <p className="text-[14px] font-bold tracking-[0.2em] text-[#EB8751]">{String(n).padStart(2, '0')}</p>
      <h2 className="mt-2 text-[28px] font-bold leading-tight sm:text-[34px]">{title}</h2>
      <p
        className={[
          'mt-5 text-[18px] leading-[1.75] text-[#3B4D52]',
          dropCap
            ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[64px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#00B2C9]'
            : '',
        ].join(' ')}
      >
        {text}
      </p>
    </div>
  );
}

/** Static text and images; refresh daily. */
export const revalidate = 86400;

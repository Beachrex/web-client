'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import BeachMediaContent from '@/components/Beach/BeachMediaContent';
import MediaOverlay from '@/components/Beach/MediaOverlay';
import type { BeachMediaKind, BeachMediaSources, ShowcaseCard } from '@/lib/utils/beach-media';

interface BeachMediaShowcaseProps {
  /** Section title from admin (`beach_views`). */
  title: string;
  beachName: string;
  /** "Izola, Slovenia" — may be empty. */
  place: string;
  /** Localized beach page URL, or null when it cannot be built. */
  beachUrl: string | null;
  sources: BeachMediaSources;
  cards: ShowcaseCard[];
}

const ICONS: Record<BeachMediaKind, string> = {
  gallery: '/images/beachmedia/gallery-icon.svg',
  video: '/images/beachmedia/play-button-arrowhead.svg',
  sphere: '/images/beachmedia/360-degree.svg',
  live: '/images/beachmedia/play-button-arrowhead.svg',
};

const LABEL_KEYS: Record<BeachMediaKind, 'beachMediaGallery' | 'beachMediaVideo' | 'beachMedia360' | 'beachMediaLiveCam'> = {
  gallery: 'beachMediaGallery',
  video: 'beachMediaVideo',
  sphere: 'beachMedia360',
  live: 'beachMediaLiveCam',
};

/**
 * TASK-008: "View beaches from all angles" on one real beach. Each card uses that beach's own photo; a click
 * opens the real gallery, video, 360° tour or live webcam in the beach page's popup. No iframe loads before a click.
 */
export default function BeachMediaShowcase(
  { title, beachName, place, beachUrl, sources, cards }: BeachMediaShowcaseProps,
) {
  const t = useTranslations('BeachDetails');
  const tHome = useTranslations('HomePage');
  const [active, setActive] = React.useState<BeachMediaKind | null>(null);
  const close = React.useCallback(() => setActive(null), []);

  const example = place ? `${beachName}, ${place}` : beachName;

  return (
    <section className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20" data-testid="beach-media-showcase">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[30px] font-bold text-[#0A2342]">{title}</h2>
            <p className="mt-2 font-figtree text-[15px] text-gray-600">
              {tHome('showcaseExample', { beach: example })}
            </p>
          </div>
          {beachUrl && (
            <Link
              href={beachUrl}
              className="font-figtree text-[15px] font-bold text-[#1A3C68] underline-offset-4 hover:underline"
            >
              {tHome('showcaseOpenBeach', { beach: beachName })} →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const label = t(LABEL_KEYS[card.kind]);
            return (
              <button
                key={card.kind}
                type="button"
                onClick={() => setActive(card.kind)}
                aria-label={`${label}: ${beachName}`}
                className="group relative flex h-[233px] w-full items-center justify-center overflow-hidden rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00B2C9]"
              >
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
                {card.kind === 'live' && (
                  <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 font-figtree text-[12px] font-bold uppercase text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    {tHome('showcaseLiveBadge')}
                  </span>
                )}
                <span className="relative z-10 flex h-[45px] items-center gap-[10px] rounded-[8px] bg-white px-[16px] py-[9px] font-figtree text-[14px] font-bold leading-none text-gray-700 shadow transition-transform group-hover:scale-105">
                  <Image
src={ICONS[card.kind]} alt="" width={20}
height={20}
                  />
                  <span>{label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <MediaOverlay label={`${t(LABEL_KEYS[active])}: ${beachName}`} closeLabel={t('closeMedia')} onClose={close}>
          <BeachMediaContent kind={active} sources={sources} beachName={beachName} />
        </MediaOverlay>
      )}
    </section>
  );
}

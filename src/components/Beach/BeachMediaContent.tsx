'use client';

import { Carousel } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

import type { BeachMediaKind, BeachMediaSources } from '@/lib/utils/beach-media';

interface BeachMediaContentProps {
  kind: BeachMediaKind;
  sources: BeachMediaSources;
  beachName?: string | null;
}

/**
 * Body of the media popup (`MediaOverlay`): gallery carousel, YouTube video, 360° tour or the Windy live player.
 * Shared by the beach page and the homepage example (TASK-008), so both show exactly the same thing.
 */
export default function BeachMediaContent({ kind, sources, beachName }: BeachMediaContentProps) {
  const t = useTranslations('BeachDetails');
  const tUi = useTranslations('UI');
  const alt = beachName ?? 'Beach gallery image';

  if (kind === 'gallery' && sources.galleryImages.length > 0) {
    const images = sources.galleryImages;
    return (
      <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black">
        {images.length > 1 ? (
          <Carousel slide={false} className="h-full w-full">
            {images.map((src, i) => (
              <div key={`${i}-${src}`} className="relative h-[75vh] w-full">
                <Image
src={src} alt={alt} fill
className="rounded-xl object-contain"
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <Image
            src={images[0] ?? ''}
            alt={alt}
            width={1600}
            height={900}
            className="h-[75vh] w-full rounded-xl object-contain"
          />
        )}
      </div>
    );
  }

  if (kind === 'video' && sources.videoEmbedUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl">
        <div className="relative w-full pt-[56.25%]">
          <iframe
            src={sources.videoEmbedUrl}
            title={tUi('videoTitle')}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (kind === 'sphere' && sources.sphereTourUrl) {
    return (
      <div className="relative h-[75vh] w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={sources.sphereTourUrl}
          title={tUi('virtualTourTitle')}
          className="h-full w-full border-0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  const cam = sources.webcams[0];
  if (kind === 'live' && cam) {
    return (
      <figure className="m-0 w-full">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={cam.playerUrl}
            title={t('webcamIframeTitle', { name: cam.title ?? beachName ?? '' })}
            allow="fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 font-figtree text-[13px] text-gray-200">
          <span>{cam.title}</span>
          <a
href={cam.pageUrl} target="_blank" rel="noopener noreferrer"
className="underline hover:text-white"
          >
            {t('webcamCredit')}
          </a>
        </figcaption>
      </figure>
    );
  }

  return null;
}

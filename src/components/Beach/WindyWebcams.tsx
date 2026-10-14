'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import type { WindyWebcam } from '@/lib/utils/webcam';

interface WindyWebcamsProps {
  webcams: WindyWebcam[];
  beachName?: string | null;
}

/**
 * TASK-006: verified Windy webcams on the beach page. Renders Windy's public player iframe
 * (the same iframe Windy's embed script creates — no third-party script on our page) and
 * only once the section is near the viewport. Nothing is rendered without a webcam.
 */
const WindyWebcams: React.FC<WindyWebcamsProps> = ({ webcams, beachName }) => {
  const t = useTranslations('BeachDetails');
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  if (webcams.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="beach-webcam-heading"
      className="bg-white py-8 sm:py-12"
      data-testid="windy-webcams"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <h2
            id="beach-webcam-heading"
            className="mb-4 font-figtree text-[22px] font-bold text-[#1A3C68]"
          >
            {t('webcamHeading')}
          </h2>

          <div className="flex flex-col gap-6">
            {webcams.map((cam) => (
              <figure key={cam.windyId} className="m-0">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  {visible ? (
                    <iframe
                      src={cam.playerUrl}
                      title={t('webcamIframeTitle', { name: cam.title ?? beachName ?? '' })}
                      loading="lazy"
                      allow="fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : null}
                </div>
                <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 font-figtree text-[13px] text-gray-600">
                  <span>{cam.title}</span>
                  <a
                    href={cam.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-900"
                  >
                    {t('webcamCredit')}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WindyWebcams;

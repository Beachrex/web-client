'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export type BeachMediaMode = 'gallery' | 'sphere' | 'video' | 'webcam';

interface BeachViewToggleProps {
  mode: BeachMediaMode;
  onChange: (mode: BeachMediaMode) => void;
  /** Webcam button is disabled when no beach in the list has a webcam (unless webcam view is already on). */
  webcamAvailable: boolean;
}

const BUTTONS: { mode: BeachMediaMode; icon: string; labelKey: string }[] = [
  { mode: 'gallery', icon: '/images/beachmedia/photo.png', labelKey: 'beachMediaGallery' },
  { mode: 'video', icon: '/images/beachmedia/play-button-arrowhead-white.png', labelKey: 'beachMediaVideo' },
  { mode: 'sphere', icon: '/images/beachmedia/360-degree-white.png', labelKey: 'beachMedia360' },
  { mode: 'webcam', icon: '/images/beachmedia/video-icon-white.png', labelKey: 'beachMediaLiveCam' },
];

/**
 * Same order and labels as the media switch on the beach page (BeachPageView, `BeachDetails.beachMedia*`).
 * "Beach view:" switch (photos / video / 360° / webcam) for a list of beach cards.
 * Cards read the mode from `PropertyMediaContext`; a beach without the medium shows its own empty state.
 * Used by "Most visited" (PropertySection) and "Browse all beaches" (DynamicSearchBeaches).
 */
export default function BeachViewToggle({ mode, onChange, webcamAvailable }: BeachViewToggleProps) {
  const t = useTranslations('PropertySection');
  const tMedia = useTranslations('BeachDetails');

  return (
    <div
      role="group"
      aria-label={t('displayLabel')}
      className="flex items-center gap-[10px] rounded-[6px] bg-[#E7E7E7] px-[8px] py-[6px]"
    >
      <span className="font-figtree text-[14px] font-semibold text-[#4D4D4D]">{t('displayLabel')}</span>

      <div className="flex items-center gap-[10px]">
        {BUTTONS.map((b, i) => {
          const active = mode === b.mode;
          const disabled = b.mode === 'webcam' && !webcamAvailable && !active;

          return (
            <div key={b.mode} className="flex items-center gap-[10px]">
              {i > 0 && <div className="h-[25px] w-[1px] bg-white" />}
              <button
                type="button"
                disabled={disabled}
                aria-pressed={active}
                aria-label={tMedia(b.labelKey)}
                title={tMedia(b.labelKey)}
                // Clicking the active non-photo view goes back to photos (as before).
                onClick={() => onChange(active && b.mode !== 'gallery' ? 'gallery' : b.mode)}
                className={`relative rounded-[6px] p-1 transition-all duration-150 ${
                  active
                    ? 'bg-[#D9EBF6] shadow-inner'
                    : disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={b.icon}
                  width={24}
                  height={24}
                  alt=""
                />
                {active && (
                  <span className="absolute -bottom-[3px] left-0 right-0 mx-auto h-[2px] w-[14px] rounded-full bg-[#1A3C68]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

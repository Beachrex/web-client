'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { createPortal } from 'react-dom';

import { windyPageUrl, windyPlayerUrl } from '@/lib/utils/webcam';

interface WebcamModalProps {
  windyId: number;
  beachName: string;
  onClose: () => void;
}

/**
 * Owner 2026-10-22: a webcam on a beach card opens here, on our page, instead of Windy in a new tab.
 * Same Windy player iframe as the beach page section (built from the id; no third-party script).
 * Closes on Escape, the close button or a click outside; focus moves to the dialog and back.
 */
export default function WebcamModal({ windyId, beachName, onClose }: WebcamModalProps) {
  const t = useTranslations('BeachDetails');
  const tCard = useTranslations('PropertyCard');
  const closeRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // The close button and the Windy link are the only focusable elements outside the iframe: keep focus inside.
        const dialog = closeRef.current?.closest('[role="dialog"]');
        const items = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], iframe')) : [];
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const title = t('webcamIframeTitle', { name: beachName });

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-3 sm:p-6"
      // A portal still bubbles React events to the card: stop them here so nothing behind navigates.
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      data-testid="webcam-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-4xl overflow-hidden rounded-[12px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="truncate font-figtree text-[16px] font-bold text-[#1A3C68] sm:text-[18px]">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tCard('webcamClose')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="relative aspect-video w-full bg-gray-900">
          <iframe
            src={windyPlayerUrl(windyId)}
            title={title}
            allow="fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <div className="px-4 py-2 text-right font-figtree text-[12px] text-gray-600">
          <a
            href={windyPageUrl(windyId)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            {t('webcamCredit')}
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

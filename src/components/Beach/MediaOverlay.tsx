'use client';

import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Layer above the sticky site header (`Layout.tsx`, z-[1050]). Owner 2026-10-23: the header covered the gallery,
 * 360° and video popups, so their close button could not be reached. Every full-screen overlay uses this layer.
 */
export const OVERLAY_Z_CLASS = 'z-[1100]';

interface MediaOverlayProps {
  /** Accessible name of the dialog. */
  label: string;
  /** Accessible name of the close button. */
  closeLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Full-screen popup for the beach page media (gallery, 360°, video): rendered into <body> above the header,
 * closes on the ✕ button, a click outside the content and Escape; page scroll is locked while it is open.
 */
export default function MediaOverlay({ label, closeLabel, onClose, children }: MediaOverlayProps) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  React.useEffect(() => {
    if (mounted) closeRef.current?.focus();
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${OVERLAY_Z_CLASS} flex items-center justify-center bg-black/80 px-4`}
      onClick={(e) => {
        // Only a click on the backdrop itself closes (not clicks inside the content)
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="media-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative w-full max-w-6xl rounded-xl bg-[#111] shadow-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-lg \
font-medium text-white transition hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

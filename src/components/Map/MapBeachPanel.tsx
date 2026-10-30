'use client';

import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { BeachEmbedContext } from '@/components/Beach/BeachEmbedContext';
import ShareMenu from '@/components/Beach/BeachBanner/ShareMenu';
import { FavoriteButton } from '@/components/Favorites/FavoriteButton';
import BeachDetailPage from '@/components/Pages/BeachDetailPage';
import { useBeachPanelDetails } from '@/hooks/useBeachPanelDetails';
import type { BeachDetailsSchema, BeachSchema } from '@/lib/api-client/types.gen';
import { FEATURES } from '@/lib/constants/features';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { buildBeachUrl, buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { googleMapsNavigationUrl, parseCoordinates } from '@/lib/utils/geo';
import { desktopPanelWidth, panelBreadcrumb } from '@/lib/utils/map-beach-panel';

/**
 * Beach page over the beach map (owner 2026-10-30, approved variant A):
 * - desktop (lg+): a non-modal panel sliding in from the left over the filters and the list; the map stays usable;
 * - phone/tablet: a modal bottom sheet over the dimmed map (focus trap, body scroll locked, drag down to close).
 * Sticky header (close, place line, name, save, share, open in a new tab) and footer (full page, directions);
 * the body is the real beach page (`BeachDetailPage embedded`).
 */
interface MapBeachPanelProps {
  beachId: number;
  /** The beach from the map list/markers, if loaded: header and links before the details arrive. */
  preview?: BeachSchema | null;
  /** lg+ window: side panel; otherwise the bottom sheet. */
  desktop: boolean;
  onClose: () => void;
  /** Desktop: the map page area (below the site header) the panel covers on the left. */
  areaRef?: React.RefObject<HTMLElement>;
  /** Desktop: the map column; the panel covers the filters and the list up to it when that fits. */
  mapRef?: React.RefObject<HTMLElement>;
}

interface DesktopBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Desktop panel box: over the map area, but never below the window's bottom edge (the map page scrolls by the
 * header's height, and the sticky footer must stay on screen).
 */
function useDesktopBox(
  enabled: boolean,
  areaRef?: React.RefObject<HTMLElement>,
  mapRef?: React.RefObject<HTMLElement>,
): DesktopBox | null {
  const [box, setBox] = useState<DesktopBox | null>(null);
  useLayoutEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const area = areaRef?.current?.getBoundingClientRect();
      if (!area) return;
      const top = Math.max(0, area.top);
      const bottom = Math.min(window.innerHeight, area.bottom);
      const mapLeft = mapRef?.current ? mapRef.current.getBoundingClientRect().left - area.left : 0;
      const next = {
        top,
        left: area.left,
        width: desktopPanelWidth(window.innerWidth, mapLeft),
        height: Math.max(0, bottom - top),
      };
      const same = (a: DesktopBox) =>
        a.top === next.top && a.left === next.left && a.width === next.width && a.height === next.height;
      setBox((prev) => (prev && same(prev) ? prev : next));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled, areaRef, mapRef]);
  return enabled ? box : null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, summary, [tabindex]:not([tabindex="-1"])';

/** Another modal (gallery, webcam, sign-in) is open above the panel: Escape belongs to it. */
function otherModalOpen(): boolean {
  return document.querySelector('[aria-modal="true"]:not([data-beach-panel])') !== null;
}

function placeNames(details: BeachDetailsSchema | null, preview?: BeachSchema | null) {
  if (details) {
    const l = details.location;
    return {
      full: panelBreadcrumb([l?.continent?.name, l?.country?.name, l?.region?.name, l?.city?.name]),
      short: panelBreadcrumb([l?.city?.name ?? l?.island?.name ?? l?.region?.name, l?.country?.name]).replace(' › ', ' · '),
    };
  }
  return {
    full: panelBreadcrumb([preview?.country_name, preview?.city_name]),
    short: panelBreadcrumb([preview?.city_name, preview?.country_name]).replace(' › ', ' · '),
  };
}

/**
 * Shown until the details arrive. With the beach from the map list (`preview`) the photo and name show at once
 * (owner 2026-10-30: the first open looked like a long wait on a grey box); the rest pulses.
 */
function PanelSkeleton({ imageUrl, name }: { imageUrl?: string | null; name?: string }) {
  return (
    <div aria-hidden="true">
      {imageUrl ? (
        <div className="relative h-[270px] w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover"
            priority
          />
          {name && (
            <span className="absolute bottom-5 left-6 right-6 font-figtree text-[30px] font-bold leading-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
              {name}
            </span>
          )}
        </div>
      ) : (
        <div className="h-[270px] w-full animate-pulse bg-gray-200" />
      )}
      <div className="flex animate-pulse flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-2">
          {[64, 80, 120, 72].map((w) => (
            <div key={w} className="h-8 rounded-full bg-gray-200" style={{ width: w }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-11/12 rounded bg-gray-200" />
        <div className="h-4 w-4/5 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function MapBeachPanel({ beachId, preview, desktop, onClose, areaRef, mapRef }: MapBeachPanelProps) {
  const t = useTranslations('MapBeachPanel');
  const tDetails = useTranslations('BeachDetails');
  const locale = useLocale();
  const { details, isLoading, isError, refetch } = useBeachPanelDetails(beachId);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartRef = useRef<number | null>(null);
  const box = useDesktopBox(desktop, areaRef, mapRef);

  const name = details?.basic_info?.name ?? (preview?.id === beachId ? preview?.name : undefined) ?? '';
  const previewOk = preview?.id === beachId ? preview : null;
  const beachUrl = details
    ? buildBeachUrl(details, locale)
    : previewOk
      ? buildBeachUrlFromSchema(previewOk, locale)
      : null;
  const fullUrl = beachUrl && beachUrl !== '#' ? beachUrl : null;
  const places = placeNames(details, previewOk);
  const position = parseCoordinates(
    details?.basic_info?.latitude ?? previewOk?.latitude,
    details?.basic_info?.longitude ?? previewOk?.longitude,
  );

  // Focus moves into the panel when it opens and when it switches to another beach; the body starts at the top.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    bodyRef.current?.scrollTo({ top: 0 });
  }, [beachId]);

  // Escape closes (unless a menu or modal inside handled it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || otherModalOpen()) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Phone sheet: modal — the page behind does not scroll and Tab stays inside.
  useEffect(() => {
    if (desktop) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [desktop]);

  const trapFocus = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (desktop || e.key !== 'Tab' || !rootRef.current) return;
      const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === rootRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [desktop],
  );

  // Phone sheet: drag the handle/header down to close.
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (desktop || (e.target as HTMLElement).closest('a, button')) return;
    dragStartRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStartRef.current));
  };
  const onDragEnd = () => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    if (dragY > 110) onClose();
    else setDragY(0);
  };

  const label = name || t('dialogLabel');

  const newTabLink = fullUrl ? (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('openInNewTab')}
      title={t('openInNewTab')}
      className={
        desktop
          ? 'flex h-11 shrink-0 items-center gap-2 rounded-lg border border-[#1A3C68] px-3.5 font-figtree text-[14px] font-bold text-[#1A3C68] hover:bg-[#F1F4F8]'
          : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DADADA] text-[#1A3C68] hover:bg-[#F1F4F8]'
      }
    >
      <ExternalLink size={18} strokeWidth={2.2} aria-hidden />
      {desktop && <span>{t('newTab')}</span>}
    </a>
  ) : null;

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label={t('close')}
      title={t('close')}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0F3F7] text-[#1A3C68] hover:bg-[#E2E8F0]"
    >
      <X size={20} strokeWidth={2.4} aria-hidden />
    </button>
  );

  const header = desktop ? (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#E7E7E7] bg-white px-4">
      {closeButton}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {places.full && <span className="truncate font-figtree text-[12px] text-[#6B6B6B]">{places.full}</span>}
        <h2 className="truncate font-figtree text-[18px] font-extrabold leading-tight text-[#1A3C68]">{name}</h2>
      </div>
      {FEATURES.favorites && <FavoriteButton beachId={beachId} variant="panel" />}
      {fullUrl && <ShareMenu url={fullUrl} title={name} compact />}
      {newTabLink}
    </div>
  ) : (
    <div
      className="shrink-0 touch-none select-none border-b border-[#EFEFEF] bg-white"
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
      data-testid="beach-sheet-handle"
    >
      <div className="flex h-[18px] items-center justify-center" aria-hidden="true">
        <span className="h-[5px] w-10 rounded-full bg-[#CFCFCF]" />
      </div>
      <div className="flex h-14 items-center gap-2 pl-4 pr-3">
        <div className="flex min-w-0 flex-1 flex-col">
          {places.short && <span className="truncate font-figtree text-[11px] text-[#6B6B6B]">{places.short}</span>}
          <h2 className="truncate font-figtree text-[18px] font-extrabold leading-tight text-[#1A3C68]">{name}</h2>
        </div>
        {newTabLink}
        {closeButton}
      </div>
    </div>
  );

  const footer = (
    <div
      className={
        desktop
          ? 'flex h-[72px] shrink-0 items-center gap-3 border-t border-[#E7E7E7] bg-white px-6'
          : 'flex shrink-0 gap-2 border-t border-[#EFEFEF] bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-2.5'
      }
    >
      {fullUrl && (
        <Link
          href={fullUrl}
          prefetch={false}
          className={[
            'flex h-[46px] items-center justify-center gap-2.5 rounded-lg bg-[#1A3C68] px-5 font-figtree font-bold text-white hover:bg-[#214a7f]',
            desktop ? 'text-[15px]' : 'flex-1 rounded-[10px] text-[14px]',
          ].join(' ')}
        >
          {desktop ? t('openFullPage') : t('openFullPageShort')}
        </Link>
      )}
      {position && (
        <a
          href={googleMapsNavigationUrl(position)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tDetails('navigationAria', { name })}
          className={[
            'flex h-[46px] items-center justify-center rounded-lg border border-[#DADADA] px-[18px] font-figtree font-bold text-[#1A3C68] hover:bg-[#F1F4F8]',
            desktop ? 'text-[15px]' : 'flex-1 rounded-[10px] text-[14px]',
          ].join(' ')}
        >
          {t('directions')}
        </a>
      )}
      {desktop && (
        <span className="ml-auto hidden font-figtree text-[12px] text-[#6B6B6B] xl:inline">{t('escHint')}</span>
      )}
    </div>
  );

  const body = (
    <div
      ref={bodyRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-white"
      aria-busy={isLoading}
    >
      {details ? (
        <BeachEmbedContext.Provider value={true}>
          <BeachDetailPage key={beachId} beachDetails={details} embedded />
        </BeachEmbedContext.Provider>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center" role="alert">
          <p className="font-figtree text-[16px] text-[#4D4D4D]">{t('loadError')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={refetch}
              className="h-11 rounded-lg border border-[#DADADA] px-4 font-figtree text-[14px] font-bold text-[#1A3C68]"
            >
              {t('retry')}
            </button>
            {fullUrl && (
              <a
                href={fullUrl}
                className="flex h-11 items-center rounded-lg bg-[#1A3C68] px-4 font-figtree text-[14px] font-bold text-white"
              >
                {t('openFullPage')}
              </a>
            )}
          </div>
        </div>
      ) : (
        <>
          <span className="sr-only" role="status">{t('loading')}</span>
          <PanelSkeleton
            imageUrl={previewOk?.main_image ? buildCdnUrl(previewOk.main_image, 'hero') : null}
            name={name}
          />
        </>
      )}
    </div>
  );

  if (desktop) {
    return (
      <div
        ref={rootRef}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        data-beach-panel="desktop"
        data-testid="beach-panel"
        className={[
          'beach-panel-slide-left z-[1001] flex flex-col bg-white shadow-[6px_0_24px_rgba(0,0,0,0.18)] outline-none',
          box ? 'fixed' : 'absolute bottom-0 left-0 top-0 w-[min(720px,55vw)]',
        ].join(' ')}
        style={box ? { top: box.top, left: box.left, width: box.width, height: box.height } : undefined}
      >
        {header}
        {body}
        {footer}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1070]" data-testid="beach-sheet">
      <div
        className="beach-sheet-backdrop absolute inset-0 bg-[rgba(10,25,45,0.5)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        data-beach-panel="sheet"
        onKeyDown={trapFocus}
        className="beach-sheet-slide-up absolute inset-x-0 bottom-0 top-[52px] flex flex-col overflow-hidden rounded-t-[18px] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.3)] outline-none"
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        {header}
        {body}
        {footer}
      </div>
    </div>
  );
}

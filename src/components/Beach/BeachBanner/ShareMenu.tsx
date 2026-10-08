'use client';

/**
 * Beach page share menu (owner, 2026-10-08): the share button opens a panel with the page link
 * and a copy button, buttons for X, Facebook, LinkedIn, WhatsApp, Telegram and e-mail, and "…"
 * for the system share sheet (Web Share API, shown only where the browser has it).
 */

import { Check, Mail, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { SHARE_NETWORK_NAMES, SHARE_NETWORKS, buildShareLink, type ShareNetwork } from '@/lib/utils/share-links';
import { SHARE_ICON_PATHS } from './shareIcons';

const iconButton = [
  'flex h-11 w-11 items-center justify-center rounded-lg border border-[#E7E7E7] bg-white text-[#1A3C68]',
  'transition-colors hover:border-[#1A3C68] hover:bg-[#F1F4F8]',
].join(' ');

function NetworkIcon({ network }: { network: ShareNetwork }) {
  if (network === 'email') return <Mail size={20} aria-hidden />;
  return (
    <svg
viewBox="0 0 24 24" width={20} height={20}
fill="currentColor" aria-hidden
    >
      <path d={SHARE_ICON_PATHS[network]} />
    </svg>
  );
}

export default function ShareMenu() {
  const t = useTranslations('Common');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState({ url: '', title: '' });
  const [canNativeShare, setCanNativeShare] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // The URL without query or hash, read when the panel opens (client only)
  const openPanel = () => {
    setPage({ url: `${window.location.origin}${window.location.pathname}`, title: document.title });
    setCanNativeShare(typeof navigator.share === 'function');
    setCopied(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(page.url);
      setCopied(true);
    } catch {
      // Clipboard blocked (e.g. insecure context): the link stays selectable in the field
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ url: page.url, title: page.title });
      setOpen(false);
    } catch {
      // Cancelled by the user
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={[
          'flex cursor-pointer items-center gap-[8px] rounded-full bg-[#F5F5F5] px-[18px] py-[8px]',
          'text-[14px] shadow-sm transition-all hover:bg-[#E8E8E8]',
        ].join(' ')}
      >
        <span className="font-figtree text-[14px] font-semibold leading-[100%] text-[#4D4D4D]">{t('share')}</span>
        <Image
src="/images/share.png" alt="" width={22}
height={22} className="object-contain"
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('share')}
          className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,380px)] rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5"
        >
          <div className="flex items-stretch overflow-hidden rounded-lg border border-[#E7E7E7]">
            <input
              readOnly
              value={page.url}
              aria-label={t('share')}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 font-figtree text-[13px] text-[#4D4D4D] outline-none"
            />
            <button
              type="button"
              onClick={() => void copy()}
              className={[
                'flex shrink-0 items-center gap-1.5 bg-[#1A3C68] px-4 font-figtree text-[13px] font-bold text-white',
                'transition-colors hover:bg-[#2a4c78]',
              ].join(' ')}
            >
              {copied && <Check size={16} aria-hidden />}
              {copied ? t('linkCopied') : t('copyLink')}
            </button>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {SHARE_NETWORKS.map((network) => {
              const label = network === 'email'
                ? t('shareByEmail')
                : t('shareOn', { network: SHARE_NETWORK_NAMES[network] });
              return (
                <li key={network}>
                  <a
                    href={buildShareLink(network, page.url, page.title)}
                    target={network === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={iconButton}
                    onClick={() => setOpen(false)}
                  >
                    <NetworkIcon network={network} />
                  </a>
                </li>
              );
            })}
            {canNativeShare && (
              <li>
                <button
                  type="button"
                  aria-label={t('moreShareOptions')}
                  title={t('moreShareOptions')}
                  className={iconButton}
                  onClick={() => void nativeShare()}
                >
                  <MoreHorizontal size={20} aria-hidden />
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Maximize2, MessageCircle, RotateCcw, X } from 'lucide-react';

import { useAiChat } from '@/contexts/AiChatContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { isAiChatWidgetVisible } from '@/lib/utils/ai-chat-widget';
import { CHAT_SHEET_MEDIA, chatSheetRect, lockBodyScroll } from '@/lib/utils/chat-viewport';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';

/**
 * TASK-010 (owner 2026-10-29): the AI beach guide as a floating widget on every page.
 *
 * - Renders nothing while the admin AI switch is off (TASK-009, fail-closed) and on the full /ai/chat page.
 * - Phones (and phones in landscape): a full-screen sheet above the sticky header (z-[1080]) that follows the
 *   visual viewport, so the header stays visible and the composer sits on the keyboard; the page behind it does
 *   not scroll (owner 2026-10-29, chat-viewport.ts). Desktop: a 400px panel bottom right (`.ai-chat-panel` in
 *   globals.css).
 *   Media overlay / webcam modal / search overlay (z-[1100]) stay above it.
 * - The conversation lives in AiChatProvider (survives navigation, tab close and browser restart).
 */
export default function AiChatWidget() {
  const { aiAssistantEnabled } = useSiteSettings();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('AI.chat');
  const chat = useAiChat();
  const { isOpen, setOpen } = chat;

  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  // Focus: the input when the panel opens (desktop; on phones the sheet itself, so the keyboard does not
  // cover the conversation right away), the button again when it closes.
  useEffect(() => {
    if (isOpen) {
      if (window.matchMedia(CHAT_SHEET_MEDIA).matches) panelRef.current?.focus({ preventScroll: true });
      else inputRef.current?.focus();
    } else if (wasOpen.current) buttonRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Phones: the sheet follows the visual viewport (keyboard) and the page behind it is locked.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!isOpen || !panel) return;
    const media = window.matchMedia(CHAT_SHEET_MEDIA);
    const vv = window.visualViewport;
    let unlock: (() => void) | null = null;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = media.matches
        ? chatSheetRect(
          vv ? { height: vv.height, offsetTop: vv.offsetTop, scale: vv.scale } : null,
          document.documentElement.clientHeight,
        )
        : null;
      if (rect) {
        panel.style.setProperty('--ai-chat-top', `${rect.top}px`);
        panel.style.setProperty('--ai-chat-height', `${rect.height}px`);
        panel.toggleAttribute('data-keyboard', rect.keyboardOpen);
      } else {
        panel.style.removeProperty('--ai-chat-top');
        panel.style.removeProperty('--ai-chat-height');
        panel.removeAttribute('data-keyboard');
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const syncLock = () => {
      if (media.matches && !unlock) unlock = lockBodyScroll();
      else if (!media.matches && unlock) {
        unlock();
        unlock = null;
      }
    };
    const onMediaChange = () => {
      syncLock();
      schedule();
    };

    syncLock();
    apply();
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    media.addEventListener('change', onMediaChange);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', onMediaChange);
      unlock?.();
    };
  }, [isOpen]);

  // Esc closes the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setOpen]);

  if (!isAiChatWidgetVisible(aiAssistantEnabled, pathname)) return null;

  const beachName = chat.pageInfo?.pageType === 'beach' ? chat.pageInfo.title?.trim() : '';
  const welcome = beachName ? t('widget.greetingBeach', { name: beachName }) : t('widget.greeting');
  const placeholder = beachName ? t('widget.placeholderBeach', { name: beachName }) : t('placeholder');

  return (
    <div className="print:hidden">
      {!isOpen && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('widget.open')}
          aria-expanded={false}
          className="fixed bottom-4 right-4 z-[1040] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 [body[data-map-page]_&]:bottom-20 sm:bottom-6 sm:right-6"
        >
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
          {chat.messages.length > 0 && (
            <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" aria-hidden="true" />
          )}
        </button>
      )}

      {isOpen && (
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          tabIndex={-1}
          data-testid="ai-chat-panel"
          className="ai-chat-panel focus:outline-none"
        >
          {/* Phones: 44px touch targets, "new conversation" as an icon (its text stays for screen readers). */}
          <header className="flex shrink-0 items-center gap-1 border-b border-gray-200 py-1 pl-3 pr-1 sm:gap-2 sm:px-4 sm:py-2">
            <MessageCircle className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <h2 id={titleId} className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
              {t('widget.title')}
            </h2>
            <button
              type="button"
              onClick={() => {
                chat.reset();
                inputRef.current?.focus();
              }}
              disabled={chat.messages.length === 0 || chat.isLoading}
              title={t('widget.newConversation')}
              className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 sm:h-8 sm:min-w-0 sm:px-2"
            >
              <RotateCcw className="h-5 w-5 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{t('widget.newConversation')}</span>
            </button>
            <Link
              href={`/${locale}/ai/chat`}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 sm:h-8 sm:w-8"
              aria-label={t('widget.openFullPage')}
              title={t('widget.openFullPage')}
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 sm:h-8 sm:w-8"
              aria-label={t('widget.close')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <ChatMessageList
            messages={chat.messages}
            welcome={welcome}
            isLoading={chat.isLoading}
            onSuggestion={(text) => void chat.send(text)}
            compact
            className="min-h-0 flex-1 p-3"
          />

          {chat.error && (
            <div role="alert" className="mx-3 mb-2 flex shrink-0 items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-800">
              <span className="flex-1">{t(chat.error)}</span>
              <button
type="button" onClick={() => chat.setError(null)} aria-label={t('widget.close')}
className="shrink-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="ai-chat-composer shrink-0 border-t border-gray-200 px-3 pt-2 sm:pt-3">
            <ChatComposer
              ref={inputRef}
              onSend={(text) => void chat.send(text)}
              isLoading={chat.isLoading}
              placeholder={placeholder}
              locationOn={chat.location !== null}
              onRequestLocation={chat.requestLocation}
              compact
            />
          </div>
        </section>
      )}
    </div>
  );
}

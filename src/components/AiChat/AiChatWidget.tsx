'use client';

import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Maximize2, MessageCircle, RotateCcw, X } from 'lucide-react';

import { useAiChat } from '@/contexts/AiChatContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { isAiChatWidgetVisible } from '@/lib/utils/ai-chat-widget';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';

/**
 * TASK-010 (owner 2026-10-29): the AI beach guide as a floating widget on every page.
 *
 * - Renders nothing while the admin AI switch is off (TASK-009, fail-closed) and on the full /ai/chat page.
 * - Phones: full-screen panel above the sticky header (z-[1080]); desktop: a 400px panel bottom right.
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
  const wasOpen = useRef(false);

  // Focus: the input when the panel opens, the button again when it closes.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else if (wasOpen.current) buttonRef.current?.focus();
    wasOpen.current = isOpen;
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
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[1080] flex flex-col bg-white sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100dvh-7rem))] sm:w-[400px] sm:rounded-xl sm:border sm:border-gray-200 sm:shadow-2xl"
        >
          <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
            <MessageCircle className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <h2 id={titleId} className="flex-1 truncate text-base font-semibold text-gray-900">
              {t('widget.title')}
            </h2>
            <button
              type="button"
              onClick={() => {
                chat.reset();
                inputRef.current?.focus();
              }}
              disabled={chat.messages.length === 0 || chat.isLoading}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t('widget.newConversation')}
            </button>
            <Link
              href={`/${locale}/ai/chat`}
              onClick={() => setOpen(false)}
              className="hidden rounded-md p-1.5 text-gray-500 hover:bg-gray-100 sm:inline-flex"
              aria-label={t('widget.openFullPage')}
              title={t('widget.openFullPage')}
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
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
            <div role="alert" className="mx-3 mb-2 flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-800">
              <span className="flex-1">{t(chat.error)}</span>
              <button
type="button" onClick={() => chat.setError(null)} aria-label={t('widget.close')}
className="shrink-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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

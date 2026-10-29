'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { env } from '@/env';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { linkBeachNames, parseAgentMarkdown } from '@/lib/utils/ai-chat';
import type { ChatMessage } from '@/lib/utils/ai-chat-widget';
import { chatScrollTarget, distanceFromBottom, shouldAutoScroll } from '@/lib/utils/chat-scroll';

/**
 * Message list of the AI chat, shared by the full /ai/chat page and the widget on every page (TASK-010).
 * The list is its own scroll container (see chat-scroll.ts): it never scrolls the window.
 */
export default function ChatMessageList({
  messages,
  welcome,
  isLoading,
  onSuggestion,
  compact = false,
  className = '',
}: {
  messages: ChatMessage[];
  /** First assistant bubble (not stored). */
  welcome: string;
  isLoading: boolean;
  onSuggestion: (text: string) => void;
  /** Widget: smaller bubbles and cards. */
  compact?: boolean;
  className?: string;
}) {
  const t = useTranslations('AI.chat');
  const locale = useLocale();

  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Follow new content only while the reader is near the bottom (or has just sent a message).
  const followRef = useRef(true);

  const scrollToNewest = useCallback(() => {
    const container = scrollRef.current;
    const list = listRef.current;
    if (!container || !list) return;
    const last = list.lastElementChild as HTMLElement | null;
    const lastTop = last
      ? last.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
      : null;
    container.scrollTop = chatScrollTarget(
      { scrollHeight: container.scrollHeight, clientHeight: container.clientHeight },
      lastTop,
    );
  }, []);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (container) followRef.current = shouldAutoScroll(distanceFromBottom(container));
  };

  // A new user message always brings the reader back to the newest message.
  const lastRole = messages[messages.length - 1]?.role;
  useLayoutEffect(() => {
    if (lastRole === 'user') followRef.current = true;
  }, [messages.length, lastRole]);

  // After a message (or the typing indicator) is rendered, before paint.
  useLayoutEffect(() => {
    if (followRef.current) scrollToNewest();
  }, [messages.length, isLoading, scrollToNewest]);

  // Beach card images and fonts change the height after render, and the on-screen keyboard shrinks the list
  // (widget on phones): keep following while the reader follows.
  useEffect(() => {
    const list = listRef.current;
    const container = scrollRef.current;
    if (!list || !container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (followRef.current) scrollToNewest();
    });
    observer.observe(list);
    observer.observe(container);
    return () => observer.disconnect();
  }, [scrollToNewest]);

  const all: ChatMessage[] = [{ role: 'assistant', content: welcome, timestamp: '' }, ...messages];
  // min-w-0 + overflow-wrap:anywhere: long words and URLs wrap instead of widening the bubble (phones).
  const bubble = `min-w-0 [overflow-wrap:anywhere] ${compact ? 'max-w-[88%] rounded-lg p-3 text-sm' : 'max-w-[80%] rounded-lg p-4'}`;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      data-testid="chat-scroll"
      className={`overflow-y-auto overflow-x-hidden overscroll-contain ${className}`}
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div ref={listRef} className={compact ? 'space-y-3' : 'space-y-4'}>
        {all.map((message, index) => {
          const urlLocale = message.locale ?? locale;
          return (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`${bubble} ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.format === 'markdown' ? (
                  <div className="space-y-1">
                    {parseAgentMarkdown(message.content, env.NEXT_PUBLIC_BASE_URL).map((line, li) => (
                      <p key={li} className="min-h-[0.5rem]">
                        {line.map((part, pi) =>
                          part.href ? (
                            <Link key={pi} href={part.href} className="font-semibold text-blue-700 underline">
                              {part.text}
                            </Link>
                          ) : part.bold ? (
                            <strong key={pi}>{part.text}</strong>
                          ) : (
                            <span key={pi}>{part.text}</span>
                          ),
                        )}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {linkBeachNames(message.content, message.beaches).map((part, i) => {
                      const href = part.beach ? buildBeachUrlFromSchema(part.beach, urlLocale) : null;
                      return href ? (
                        <Link key={i} href={href} className="font-semibold text-blue-700 underline">
                          {part.text}
                        </Link>
                      ) : (
                        <span key={i}>{part.text}</span>
                      );
                    })}
                  </p>
                )}

                {message.beaches && message.beaches.length > 0 && (
                  <div className={compact ? 'mt-3 space-y-2' : 'mt-4 space-y-3'}>
                    {message.beaches.map((beach) => {
                      const beachUrl = buildBeachUrlFromSchema(beach, urlLocale);
                      const imageUrl = buildCdnUrl(beach.main_image, 'list');

                      return (
                        <div key={beach.id} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                          {imageUrl && (
                            <div className={`relative w-full ${compact ? 'h-24' : 'h-32'}`}>
                              <Image
                                src={imageUrl}
                                alt={beach.name}
                                fill
                                className="object-cover"
                                sizes={compact ? '360px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                              />
                            </div>
                          )}
                          <div className={compact ? 'p-2' : 'p-3'}>
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-blue-600">
                                  {beachUrl ? (
                                    <Link href={beachUrl} className="hover:underline">
                                      {beach.name}
                                    </Link>
                                  ) : (
                                    beach.name
                                  )}
                                </h4>
                                {beach.city && (
                                  <p className="text-sm text-gray-600">
                                    {beach.city}, {beach.country_code}
                                  </p>
                                )}
                                {beach.type && <p className="text-sm text-gray-500">{beach.type}</p>}
                                {!compact && beach.facilities && beach.facilities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {beach.facilities.map((facility) => (
                                      <span key={facility} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        {facility}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {(beach.distance_km !== undefined && beach.distance_km !== null)
                              || typeof beach.match_score === 'number' ? (
                                <div className="ml-2 shrink-0 text-right">
                                  {beach.distance_km !== undefined && beach.distance_km !== null && (
                                    <p className="text-sm font-medium text-gray-700">{beach.distance_km.toFixed(1)} km</p>
                                  )}
                                  {typeof beach.match_score === 'number' && (
                                    <p className="text-xs text-gray-500">
                                      {t('match', { percent: Math.round(beach.match_score * 100) })}
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                            {beachUrl && (
                              <Link href={beachUrl} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                {t('viewDetails')}
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-600">{t('suggestions')}</p>
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSuggestion(suggestion)}
                        disabled={isLoading}
                        className="block text-sm text-blue-600 hover:underline text-left"
                      >
                        • {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {message.timestamp && (
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString(locale === 'si' ? 'sl' : locale === 'ua' ? 'uk' : locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4" aria-label={t('sending')}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

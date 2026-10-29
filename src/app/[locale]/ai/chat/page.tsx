'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Textarea, Alert } from 'flowbite-react';
import { SignInOptions, UserProfile, LogoutButton } from '@/components/Auth';
import { Send } from 'lucide-react';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';
import { buildCdnUrl } from '@/lib/utils/beach-images';
import { linkBeachNames, parseAgentMarkdown, sendChatMessage, type ChatBeach, type ChatErrorKey } from '@/lib/utils/ai-chat';
import { env } from '@/env';
import { chatScrollTarget, distanceFromBottom, shouldAutoScroll } from '@/lib/utils/chat-scroll';

// Disable static generation for this page (uses client-side auth)
export const dynamic = 'force-dynamic';

/**
 * AI Chat Page
 *
 * Public chat interface with AI assistant.
 * Works anonymously, but shows user info if authenticated.
 *
 * Features:
 * - Anonymous chat (no auth required)
 * - Shows user profile if authenticated
 * - Simple message history
 * - Calls POST /ai/chat endpoint
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Store as ISO string to avoid hydration issues
  beaches?: ChatBeach[]; // Recommended beaches (database data in the page language)
  suggestions?: string[]; // Optional suggestions
  format?: 'markdown' | 'text';
}

export default function AIChatPage() {
  const { isAuthenticated, user, token } = useAuth();
  const t = useTranslations('AI.chat');
  const locale = useLocale();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('welcome'),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatErrorKey | 'locationDenied' | null>(null);
  // The conversation id from the API: sent with every message so follow-up questions work.
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // The message list is its own scroll container. Without this it never scrolled: new questions and
  // answers were appended below the visible area and only the scrollbar thumb moved.
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

  // After a message (or the typing indicator) is rendered, before paint.
  useLayoutEffect(() => {
    if (followRef.current) scrollToNewest();
  }, [messages.length, isLoading, scrollToNewest]);

  // Beach card images and fonts change the height after render: keep following while the reader follows.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (followRef.current) scrollToNewest();
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [scrollToNewest]);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('locationDenied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setError('locationDenied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    followRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const result = await sendChatMessage({ message: content, sessionId, locale, token, location });
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSessionId(result.reply.session_id);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: result.reply.message,
        timestamp: new Date().toISOString(),
        beaches: result.reply.beaches,
        suggestions: result.reply.suggestions,
        format: result.reply.format,
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 mt-1">{t('subtitle')}</p>
            </div>
            <div>
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <UserProfile showEmail={false} />
                  <LogoutButton variant="link" />
                </div>
              ) : (
                <SignInOptions />
              )}
            </div>
          </div>

          {!isAuthenticated && (
            <Alert color="info" className="mb-4">
              <span className="font-medium">{t('anonymousNote')}</span>
            </Alert>
          )}
        </div>

        {/* Chat Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          data-testid="chat-scroll"
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 h-[min(600px,60dvh)] min-h-[280px] overflow-y-auto overscroll-contain"
        >
          <div ref={listRef} className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.format === 'markdown' ? (
                    <div className="space-y-1">
                      {parseAgentMarkdown(message.content, env.NEXT_PUBLIC_BASE_URL).map((line, li) => (
                        <p key={li} className="min-h-[0.5rem]">
                          {line.map((part, pi) =>
                            part.href ? (
                              <Link
                                key={pi}
                                href={part.href}
                                target="_blank"
                                className="font-semibold text-blue-700 underline"
                              >
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
                        const href = part.beach ? buildBeachUrlFromSchema(part.beach, locale) : null;
                        return href ? (
                          <Link
                            key={i}
                            href={href}
                            target="_blank"
                            className="font-semibold text-blue-700 underline"
                          >
                            {part.text}
                          </Link>
                        ) : (
                          <span key={i}>{part.text}</span>
                        );
                      })}
                    </p>
                  )}

                  {/* Render beaches if present */}
                  {message.beaches && message.beaches.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.beaches.map((beach) => {
                        const beachUrl = buildBeachUrlFromSchema(beach, locale);
                        const imageUrl = buildCdnUrl(beach.main_image, 'list');

                        return (
                          <div
                            key={beach.id}
                            className="bg-white rounded-lg overflow-hidden border border-gray-200"
                          >
                            {/* Beach Image */}
                            {imageUrl && (
                              <div className="relative w-full h-32">
                                <Image
                                  src={imageUrl}
                                  alt={beach.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                            )}

                            {/* Beach Details */}
                            <div className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-blue-600">
                                    {beachUrl ? (
                                      <Link
                                        href={beachUrl}
                                        target="_blank"
                                        className="hover:underline"
                                      >
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
                                  {beach.type && (
                                    <p className="text-sm text-gray-500">{beach.type}</p>
                                  )}
                                  {beach.facilities && beach.facilities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {beach.facilities.map((facility) => (
                                        <span
                                          key={facility}
                                          className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                                        >
                                          {facility}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {(beach.distance_km !== undefined && beach.distance_km !== null)
                                || typeof beach.match_score === 'number' ? (
                                  <div className="ml-2 text-right">
                                    {beach.distance_km !== undefined && beach.distance_km !== null && (
                                      <p className="text-sm font-medium text-gray-700">
                                        {beach.distance_km.toFixed(1)} km
                                      </p>
                                    )}
                                    {typeof beach.match_score === 'number' && (
                                      <p className="text-xs text-gray-500">
                                        {t('match', { percent: Math.round(beach.match_score * 100) })}
                                      </p>
                                    )}
                                  </div>
                                ) : null}
                              </div>

                              {/* Beach Link */}
                              {beachUrl && (
                                <a
                                  href={beachUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  {t('viewDetails')}
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Render suggestions if present */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-gray-600">
                        {t('suggestions')}
                      </p>
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => void handleSend(suggestion)}
                          disabled={isLoading}
                          className="block text-sm text-blue-600 hover:underline text-left"
                        >
                          • {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString(locale === 'si' ? 'sl' : locale === 'ua' ? 'uk' : locale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-4" onDismiss={() => setError(null)}>
            {t(error)}
          </Alert>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="mb-2">
            {location ? (
              <span className="text-sm text-green-700">📍 {t('locationOn')}</span>
            ) : (
              <button
                type="button"
                onClick={requestLocation}
                className="text-sm text-blue-600 hover:underline"
              >
                📍 {t('useLocation')}
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('placeholder')}
              rows={2}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => void handleSend()}
              disabled={!input.trim() || isLoading}
              color="blue"
              className="self-end"
            >
              {isLoading ? (
                <>{t('sending')}</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('send')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

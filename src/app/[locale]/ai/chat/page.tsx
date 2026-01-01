'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Textarea, Alert } from 'flowbite-react';
import { GoogleLoginButton, UserProfile, LogoutButton } from '@/components/Auth';
import { Send } from 'lucide-react';
import { buildBeachUrlFromSchema } from '@/lib/utils/beach-urls';

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

interface Beach {
  id: number;
  name: string;
  slug: string;
  country_code: string;
  city?: string;
  surface?: string;
  facilities?: string[];
  distance_km?: number | null;
  match_score?: number;
  main_image?: string | null;
  // Location slugs needed for buildBeachUrlFromSchema
  continent_slug?: string | null;
  country_slug?: string | null;
  region_slug?: string | null;
  island_slug?: string | null;
  city_slug?: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Store as ISO string to avoid hydration issues
  beaches?: Beach[]; // Optional beaches array
  suggestions?: string[]; // Optional suggestions
}

export default function AIChatPage() {
  const { isAuthenticated, user } = useAuth();
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
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://dev-api.beachrex.com'}/api/v1/ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json() as {
        message: string;
        beaches?: Beach[];
        suggestions?: string[];
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        beaches: data.beaches,
        suggestions: data.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[AIChatPage] Failed to send message:', err);
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex items-center justify-between mb-4">
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
                <GoogleLoginButton />
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4 min-h-[500px] max-h-[600px] overflow-y-auto">
          <div className="space-y-4">
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
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Render beaches if present */}
                  {message.beaches && message.beaches.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.beaches.map((beach) => {
                        const beachUrl = buildBeachUrlFromSchema(beach, locale);
                        const imagorEndpoint = process.env.NEXT_PUBLIC_IMAGOR_ENDPOINT ?? '';
                        const imageUrl = beach.main_image
                          ? `${imagorEndpoint}/unsafe/fit-in/400x200/filters:quality(85)/${beach.main_image}`
                          : null;

                        return (
                          <div
                            key={beach.id}
                            className="bg-white rounded-lg overflow-hidden border border-gray-200"
                          >
                            {/* Beach Image */}
                            {imageUrl && (
                              <img
                                src={imageUrl}
                                alt={beach.name}
                                className="w-full h-32 object-cover"
                              />
                            )}

                            {/* Beach Details */}
                            <div className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-blue-600">
                                    {beach.name}
                                  </h4>
                                  {beach.city && (
                                    <p className="text-sm text-gray-600">
                                      {beach.city}, {beach.country_code}
                                    </p>
                                  )}
                                  {beach.surface && (
                                    <p className="text-sm text-gray-500">
                                      Surface: {beach.surface}
                                    </p>
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
                                || beach.match_score !== undefined ? (
                                  <div className="ml-2 text-right">
                                    {beach.distance_km !== undefined && beach.distance_km !== null && (
                                      <p className="text-sm font-medium text-gray-700">
                                        {beach.distance_km.toFixed(1)} km
                                      </p>
                                    )}
                                    {beach.match_score !== undefined && (
                                      <p className="text-xs text-gray-500">
                                        {(beach.match_score * 100).toFixed(0)}% match
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
                                  View details →
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
                        Suggestions:
                      </p>
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(suggestion)}
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
                    {new Date(message.timestamp).toLocaleTimeString([], {
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
            {error}
          </Alert>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
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
              onClick={handleSend}
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

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Button, Textarea, Alert } from 'flowbite-react';
import { GoogleLoginButton, UserProfile, LogoutButton } from '@/components/Auth';
import { Send } from 'lucide-react';

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
  timestamp: Date;
}

export default function AIChatPage() {
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations('AI.chat');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('welcome'),
      timestamp: new Date(),
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
      timestamp: new Date(),
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

      const data = await response.json() as { response: string };

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
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
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
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

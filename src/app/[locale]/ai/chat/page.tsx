'use client';

import { useTranslations } from 'next-intl';
import { Alert } from 'flowbite-react';
import { RotateCcw } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useAiChat } from '@/contexts/AiChatContext';
import { SignInOptions, UserProfile, LogoutButton } from '@/components/Auth';
import ChatComposer from '@/components/AiChat/ChatComposer';
import ChatMessageList from '@/components/AiChat/ChatMessageList';

// Disable static generation for this page (uses client-side auth)
export const dynamic = 'force-dynamic';

/**
 * AI Chat Page
 *
 * Full-page view of the same conversation as the chat widget on every page (TASK-010): both read
 * `AiChatProvider`, so the history (kept in localStorage) is shared. Works anonymously; shows the user if signed in.
 */
export default function AIChatPage() {
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations('AI.chat');
  const chat = useAiChat();

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

        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={chat.reset}
            disabled={chat.messages.length === 0 || chat.isLoading}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('widget.newConversation')}
          </button>
        </div>

        {/* Chat Messages */}
        <ChatMessageList
          messages={chat.messages}
          welcome={t('welcome')}
          isLoading={chat.isLoading}
          onSuggestion={(text) => void chat.send(text)}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 h-[min(600px,60dvh)] min-h-[280px]"
        />

        {/* Error Alert */}
        {chat.error && (
          <Alert color="failure" className="mb-4" onDismiss={() => chat.setError(null)}>
            {t(chat.error)}
          </Alert>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <ChatComposer
            onSend={(text) => void chat.send(text)}
            isLoading={chat.isLoading}
            placeholder={t('placeholder')}
            locationOn={chat.location !== null}
            onRequestLocation={chat.requestLocation}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { forwardRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';

/**
 * Input row of the AI chat (shared by the /ai/chat page and the widget, TASK-010).
 * Enter sends, Shift+Enter adds a line.
 */
const ChatComposer = forwardRef<HTMLTextAreaElement, {
  onSend: (text: string) => void;
  isLoading: boolean;
  placeholder: string;
  locationOn: boolean;
  onRequestLocation: () => void;
  compact?: boolean;
}>(function ChatComposer({ onSend, isLoading, placeholder, locationOn, onRequestLocation, compact = false }, ref) {
  const t = useTranslations('AI.chat');
  const [input, setInput] = useState('');

  const submit = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput('');
  };

  return (
    <div>
      <div className="mb-2">
        {locationOn ? (
          <span className="text-sm text-green-700">📍 {t('locationOn')}</span>
        ) : (
          <button type="button" onClick={onRequestLocation} className="text-sm text-blue-600 hover:underline">
            📍 {t('useLocation')}
          </button>
        )}
      </div>
      <form
        className="flex items-end gap-2 sm:gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          aria-label={t('widget.inputLabel')}
          rows={2}
          maxLength={500}
          className={`flex-1 resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 ${compact ? 'text-sm' : 'text-sm sm:text-base'}`}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="inline-flex shrink-0 items-center rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('send')}
        >
          {isLoading ? (
            <>{t('sending')}</>
          ) : (
            <>
              <Send className={`w-4 h-4 ${compact ? '' : 'sm:mr-2'}`} aria-hidden="true" />
              {!compact && <span className="hidden sm:inline">{t('send')}</span>}
            </>
          )}
        </button>
      </form>
    </div>
  );
});

export default ChatComposer;

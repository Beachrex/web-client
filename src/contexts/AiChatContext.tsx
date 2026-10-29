'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { sendChatMessage, type ChatErrorKey } from '@/lib/utils/ai-chat';
import {
  AI_CHAT_STORAGE_KEY,
  buildPageContext,
  capMessages,
  restoreChat,
  serializeChat,
  type AiChatPageInfo,
  type ChatMessage,
} from '@/lib/utils/ai-chat-widget';

export type AiChatError = ChatErrorKey | 'locationDenied';

interface AiChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: AiChatError | null;
  setError: (error: AiChatError | null) => void;
  location: { latitude: number; longitude: number } | null;
  requestLocation: () => void;
  send: (text: string) => Promise<void>;
  /** "New conversation": forgets the messages and the server session, here and in storage. */
  reset: () => void;
  /** What the current page registered about itself (see `AiChatPageMarker`). */
  pageInfo: AiChatPageInfo | null;
  setPageInfo: React.Dispatch<React.SetStateAction<AiChatPageInfo | null>>;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const AiChatContext = React.createContext<AiChatState | null>(null);

const readStorage = (): string | null => {
  try {
    return window.localStorage.getItem(AI_CHAT_STORAGE_KEY);
  } catch {
    return null;
  }
};
const writeStorage = (value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(AI_CHAT_STORAGE_KEY);
    else window.localStorage.setItem(AI_CHAT_STORAGE_KEY, value);
  } catch {
    // Private mode, blocked storage or quota: the conversation still works for this page view.
  }
};

/**
 * TASK-010: one conversation for the whole site (the widget on every page and the full /ai/chat page).
 * Mounted above the pages, so it survives client navigation; kept in localStorage (last 50 messages, 7 days)
 * so it also survives closing the tab or the browser, and synced between tabs with the `storage` event.
 */
export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const { aiAssistantEnabled } = useSiteSettings();
  const { token } = useAuth();
  const locale = useLocale();
  const pathname = usePathname() ?? '/';

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AiChatError | null>(null);
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [pageInfo, setPageInfo] = React.useState<AiChatPageInfo | null>(null);
  const [isOpen, setOpen] = React.useState(false);
  // Storage is read after mount (no hydration mismatch) and written only after that first read.
  const [restored, setRestored] = React.useState(false);
  // State that came from another tab is not written back (that would bounce between tabs forever).
  const fromOtherTabRef = React.useRef(false);

  React.useEffect(() => {
    if (!aiAssistantEnabled) return;
    const stored = restoreChat(readStorage(), Date.now());
    if (stored) {
      setMessages(stored.messages);
      setSessionId(stored.sessionId);
    } else {
      writeStorage(null); // expired or corrupt
    }
    setRestored(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AI_CHAT_STORAGE_KEY && event.key !== null) return;
      const other = restoreChat(event.newValue ?? readStorage(), Date.now());
      fromOtherTabRef.current = true;
      setMessages(other?.messages ?? []);
      setSessionId(other?.sessionId ?? null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [aiAssistantEnabled]);

  React.useEffect(() => {
    if (!restored) return;
    if (fromOtherTabRef.current) {
      fromOtherTabRef.current = false;
      return;
    }
    writeStorage(messages.length > 0 ? serializeChat(sessionId, messages, Date.now()) : null);
  }, [messages, sessionId, restored]);

  const requestLocation = React.useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('locationDenied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setError('locationDenied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }, []);

  const loadingRef = React.useRef(false);
  const send = React.useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || loadingRef.current) return;
    loadingRef.current = true;
    setMessages((prev) => capMessages([...prev, { role: 'user', content, timestamp: new Date().toISOString() }]));
    setIsLoading(true);
    setError(null);

    const pageContext = buildPageContext(pathname, pageInfo, typeof document !== 'undefined' ? document.title : null);
    const result = await sendChatMessage({ message: content, sessionId, locale, token, location, pageContext });
    loadingRef.current = false;
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSessionId(result.reply.session_id);
    setMessages((prev) => capMessages([
      ...prev,
      {
        role: 'assistant',
        content: result.reply.message,
        timestamp: new Date().toISOString(),
        beaches: result.reply.beaches,
        suggestions: result.reply.suggestions,
        format: result.reply.format,
        locale,
      },
    ]));
  }, [pathname, pageInfo, sessionId, locale, token, location]);

  const reset = React.useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    writeStorage(null);
  }, []);

  const value = React.useMemo<AiChatState>(() => ({
    messages, isLoading, error, setError, location, requestLocation, send, reset,
    pageInfo, setPageInfo, isOpen, setOpen,
  }), [messages, isLoading, error, location, requestLocation, send, reset, pageInfo, isOpen]);

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
}

export function useAiChat(): AiChatState {
  const value = React.useContext(AiChatContext);
  if (!value) throw new Error('useAiChat must be used inside AiChatProvider');
  return value;
}

/** Optional variant for components that may render outside the provider. */
export function useOptionalAiChat(): AiChatState | null {
  return React.useContext(AiChatContext);
}

'use client';

import { useEffect } from 'react';

import { useOptionalAiChat } from '@/contexts/AiChatContext';
import type { AiChatPageType } from '@/lib/utils/ai-chat-widget';

/**
 * TASK-010: tells the chat widget what the current page is (rendered by server pages, renders nothing).
 * Beach pages pass the beach id; the backend resolves the beach itself and never trusts the title for it.
 */
export default function AiChatPageMarker({
  pageType,
  beachId,
  title,
}: {
  pageType: AiChatPageType;
  beachId?: number | null;
  title?: string | null;
}) {
  const chat = useOptionalAiChat();
  const setPageInfo = chat?.setPageInfo;

  useEffect(() => {
    if (!setPageInfo) return;
    const mine = { pageType, beachId: beachId ?? null, title: title ?? null };
    setPageInfo(mine);
    // Clear only our own info: the next page's marker may already have registered.
    return () => setPageInfo((current) => (current === mine ? null : current));
  }, [setPageInfo, pageType, beachId, title]);

  return null;
}

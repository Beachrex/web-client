import { notFound } from 'next/navigation';

import { fetchSiteSettings } from '@/lib/site-settings';

/** TASK-009: the chat page exists only while the admin switch "AI chat" is on. */
export default async function AiChatLayout({ children }: { children: React.ReactNode }) {
  const { aiAssistantEnabled } = await fetchSiteSettings();
  if (!aiAssistantEnabled) notFound();
  return children;
}

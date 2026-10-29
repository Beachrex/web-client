import { notFound } from 'next/navigation';

import { fetchSiteSettings } from '@/lib/site-settings';

/** TASK-009: the AI guide pages exist only while the admin switch "AI guide on" is on. */
export default async function AiLayout({ children }: { children: React.ReactNode }) {
  const { aiAssistantEnabled } = await fetchSiteSettings();
  if (!aiAssistantEnabled) notFound();
  return children;
}

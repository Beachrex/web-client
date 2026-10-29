import { notFound } from 'next/navigation';

import { fetchSiteSettings } from '@/lib/site-settings';

/** TASK-009: payment pages are only for AI credits; they exist only while the admin switch "AI guide on" is on. */
export default async function PaymentLayout({ children }: { children: React.ReactNode }) {
  const { aiAssistantEnabled } = await fetchSiteSettings();
  if (!aiAssistantEnabled) notFound();
  return children;
}

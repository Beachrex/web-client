import { notFound } from 'next/navigation';

import { anyAiFeatureEnabled, fetchSiteSettings } from '@/lib/site-settings';

/**
 * TASK-009: the `/ai` hub exists while the AI chat or the AI trip planner is on (admin, System → Site settings).
 * Each feature's pages are gated again by their own layout (`chat/layout.tsx`, `itinerary/layout.tsx`).
 */
export default async function AiLayout({ children }: { children: React.ReactNode }) {
  if (!anyAiFeatureEnabled(await fetchSiteSettings())) notFound();
  return children;
}

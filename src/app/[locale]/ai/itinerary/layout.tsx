import { notFound } from 'next/navigation';

import { fetchSiteSettings } from '@/lib/site-settings';

/** TASK-009: the paid trip planner (and "My plans") exists only while the admin switch "AI trip planner" is on. */
export default async function AiItineraryLayout({ children }: { children: React.ReactNode }) {
  const { aiTripPlannerEnabled } = await fetchSiteSettings();
  if (!aiTripPlannerEnabled) notFound();
  return children;
}

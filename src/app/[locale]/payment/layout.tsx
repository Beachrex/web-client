import { notFound } from 'next/navigation';

import { fetchSiteSettings } from '@/lib/site-settings';

/** TASK-009: payment pages are only for trip planner credits; they exist only while "AI trip planner" is on. */
export default async function PaymentLayout({ children }: { children: React.ReactNode }) {
  const { aiTripPlannerEnabled } = await fetchSiteSettings();
  if (!aiTripPlannerEnabled) notFound();
  return children;
}

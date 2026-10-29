import type { SiteSettings } from '@/lib/site-settings';

/** TASK-009: llms.txt lists only the AI features switched on in admin (one line each, '' when both are off). */
export function llmsAiLines(base: string, settings: SiteSettings): string {
  const lines: string[] = [];
  if (settings.aiAssistantEnabled) {
    lines.push(`- [AI beach chat](${base}/en/ai/chat): ask about beaches in any language`);
  }
  if (settings.aiTripPlannerEnabled) {
    lines.push(`- [AI trip planner](${base}/en/ai/itinerary): multi-day beach trip plans`);
  }
  return lines.map((line) => `\n${line}`).join('');
}

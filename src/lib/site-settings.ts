import { serverApiBaseUrl } from '@/lib/server/api-base';

/**
 * TASK-009: site switches the owner sets in admin (System → Site settings), per environment.
 * Read server-side from `GET /api/v1/site-settings`; the website reflects a change within REVALIDATE_SECONDS.
 */
export interface SiteSettings {
  /** AI beach chat: chat page, chat widget, menu entry (API key `ai_assistant_enabled`). */
  aiAssistantEnabled: boolean;
  /** Paid AI trip planner: planner pages, payment pages, menu entry (API key `ai_trip_planner_enabled`). */
  aiTripPlannerEnabled: boolean;
  /** Google ads (AdSense) on the production site (API key `ads_enabled`, default off). */
  adsEnabled: boolean;
}

export const REVALIDATE_SECONDS = 300;

/**
 * Fail closed: if the API cannot be read or the answer is malformed (or a key is missing), that feature is treated
 * as off, so a production site never shows a feature the owner switched off (owner 2026-10-29: the paid trip planner
 * stays off on prod until Stripe is set up; Google ads are off on prod until switched on in admin).
 */
export const SITE_SETTINGS_FALLBACK: SiteSettings = {
  aiAssistantEnabled: false,
  aiTripPlannerEnabled: false,
  adsEnabled: false,
};

export function parseSiteSettings(json: unknown): SiteSettings {
  const data = json && typeof json === 'object' ? (json as { data?: unknown }).data : undefined;
  const values = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  return {
    aiAssistantEnabled: values.ai_assistant_enabled === true,
    aiTripPlannerEnabled: values.ai_trip_planner_enabled === true,
    adsEnabled: values.ads_enabled === true,
  };
}

/** The `/ai` hub and the "AI Beach Assistant" menu group exist while at least one AI feature is on. */
export function anyAiFeatureEnabled(settings: SiteSettings): boolean {
  return settings.aiAssistantEnabled || settings.aiTripPlannerEnabled;
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${serverApiBaseUrl()}/api/v1/site-settings`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['site-settings'] },
    });
    if (!res.ok) return SITE_SETTINGS_FALLBACK;
    return parseSiteSettings(await res.json());
  } catch {
    return SITE_SETTINGS_FALLBACK;
  }
}

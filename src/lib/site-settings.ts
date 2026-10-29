import { env } from '@/env';

/**
 * TASK-009: site switches the owner sets in admin (System → Site settings), per environment.
 * Read server-side from `GET /api/v1/site-settings`; the website reflects a change within REVALIDATE_SECONDS.
 */
export interface SiteSettings {
  /** AI beach guide (chat, trip planner, buying credits). */
  aiAssistantEnabled: boolean;
}

export const REVALIDATE_SECONDS = 300;

/**
 * Fail closed: if the API cannot be read or the answer is malformed, the AI guide is treated as off, so a
 * production site never shows a guide that the owner switched off (owner 2026-10-29: no Stripe on prod yet).
 */
export const SITE_SETTINGS_FALLBACK: SiteSettings = { aiAssistantEnabled: false };

export function parseSiteSettings(json: unknown): SiteSettings {
  const data = json && typeof json === 'object' ? (json as { data?: unknown }).data : undefined;
  const ai = data && typeof data === 'object' ? (data as Record<string, unknown>).ai_assistant_enabled : undefined;
  return { aiAssistantEnabled: ai === true };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/site-settings`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['site-settings'] },
    });
    if (!res.ok) return SITE_SETTINGS_FALLBACK;
    return parseSiteSettings(await res.json());
  } catch {
    return SITE_SETTINGS_FALLBACK;
  }
}

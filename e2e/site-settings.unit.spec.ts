import { test, expect } from '@playwright/test';
import { parseSiteSettings, SITE_SETTINGS_FALLBACK } from '@/lib/site-settings';
import { buildMenuItems } from '@/lib/utils/menu-items';

/** TASK-009 (owner 2026-10-29): the AI guide can be switched off in admin, e.g. on prod before Stripe. */
test.describe('site settings', () => {
  test('reads the admin switch from GET /api/v1/site-settings', () => {
    expect(parseSiteSettings({ success: true, data: { ai_assistant_enabled: true } })).toEqual({ aiAssistantEnabled: true });
    expect(parseSiteSettings({ success: true, data: { ai_assistant_enabled: false } })).toEqual({ aiAssistantEnabled: false });
  });

  test('anything unexpected means off (fail closed)', () => {
    for (const json of [null, undefined, {}, { data: null }, { data: {} }, { data: { ai_assistant_enabled: 'true' } }, { data: { ai_assistant_enabled: 1 } }, 'x']) {
      expect(parseSiteSettings(json).aiAssistantEnabled, JSON.stringify(json)).toBe(false);
    }
    expect(SITE_SETTINGS_FALLBACK.aiAssistantEnabled).toBe(false);
  });

  test('the burger menu shows the AI guide only when it is on', () => {
    const labels = {
      browseBeaches: 'Beaches', topCountries: 'Top', aiAssistant: 'AI beach assistant', aiChat: 'Chat',
      aiItinerary: 'Trip planner', about: 'About', contact: 'Contact',
    };
    const base = { locale: 'en', continents: [], countries: [], aboutUrl: '/en/p/about-us', contactUrl: null, labels };
    const hasAi = (items: ReturnType<typeof buildMenuItems>) => items.some((i) => i.href === '/en/ai');

    expect(hasAi(buildMenuItems(base))).toBe(true);
    expect(hasAi(buildMenuItems({ ...base, showAi: true }))).toBe(true);
    expect(hasAi(buildMenuItems({ ...base, showAi: false }))).toBe(false);
    expect(buildMenuItems({ ...base, showAi: false }).some((i) => i.label === 'About')).toBe(true);
  });
});

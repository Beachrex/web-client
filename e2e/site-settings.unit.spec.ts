import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { anyAiFeatureEnabled, parseSiteSettings, SITE_SETTINGS_FALLBACK } from '@/lib/site-settings';
import { buildMenuItems } from '@/lib/utils/menu-items';
import { llmsAiLines } from '@/lib/utils/llms-ai-lines';

/**
 * TASK-009 (owner 2026-10-29): two independent admin switches, AI chat and the paid AI trip planner
 * (the owner switches only the planner off on prod).
 */
test.describe('site settings', () => {
  test('reads both admin switches from GET /api/v1/site-settings', () => {
    expect(parseSiteSettings({ success: true, data: { ai_assistant_enabled: true, ai_trip_planner_enabled: true } })).toEqual({
      aiAssistantEnabled: true,
      aiTripPlannerEnabled: true,
    });
    expect(parseSiteSettings({ success: true, data: { ai_assistant_enabled: true, ai_trip_planner_enabled: false } })).toEqual({
      aiAssistantEnabled: true,
      aiTripPlannerEnabled: false,
    });
    expect(parseSiteSettings({ success: true, data: { ai_assistant_enabled: false, ai_trip_planner_enabled: true } })).toEqual({
      aiAssistantEnabled: false,
      aiTripPlannerEnabled: true,
    });
  });

  test('anything unexpected means off (fail closed), per switch', () => {
    for (const json of [null, undefined, {}, { data: null }, { data: {} }, 'x',
      { data: { ai_assistant_enabled: 'true', ai_trip_planner_enabled: 1 } }]) {
      expect(parseSiteSettings(json), JSON.stringify(json)).toEqual({ aiAssistantEnabled: false, aiTripPlannerEnabled: false });
    }
    // An older API without the planner key: chat follows its switch, the planner stays hidden.
    expect(parseSiteSettings({ data: { ai_assistant_enabled: true } })).toEqual({ aiAssistantEnabled: true, aiTripPlannerEnabled: false });
    expect(SITE_SETTINGS_FALLBACK).toEqual({ aiAssistantEnabled: false, aiTripPlannerEnabled: false });
  });

  test('the /ai hub exists while at least one feature is on', () => {
    expect(anyAiFeatureEnabled({ aiAssistantEnabled: true, aiTripPlannerEnabled: true })).toBe(true);
    expect(anyAiFeatureEnabled({ aiAssistantEnabled: true, aiTripPlannerEnabled: false })).toBe(true);
    expect(anyAiFeatureEnabled({ aiAssistantEnabled: false, aiTripPlannerEnabled: true })).toBe(true);
    expect(anyAiFeatureEnabled({ aiAssistantEnabled: false, aiTripPlannerEnabled: false })).toBe(false);
  });

  test('the burger menu shows each AI entry by its own switch, the group only while one is on', () => {
    const labels = {
      browseBeaches: 'Beaches', topCountries: 'Top', aiAssistant: 'AI beach assistant', aiChat: 'Chat',
      aiItinerary: 'Trip planner', about: 'About', contact: 'Contact',
    };
    const base = { locale: 'en', continents: [], countries: [], aboutUrl: '/en/p/about-us', contactUrl: null, labels };
    const aiLinks = (items: ReturnType<typeof buildMenuItems>) =>
      items.find((i) => i.href === '/en/ai')?.subItems?.map((s) => s.href) ?? null;

    expect(aiLinks(buildMenuItems(base))).toEqual(['/en/ai/chat', '/en/ai/itinerary']);
    expect(aiLinks(buildMenuItems({ ...base, showAiChat: true, showAiPlanner: true }))).toEqual(['/en/ai/chat', '/en/ai/itinerary']);
    expect(aiLinks(buildMenuItems({ ...base, showAiChat: true, showAiPlanner: false }))).toEqual(['/en/ai/chat']);
    expect(aiLinks(buildMenuItems({ ...base, showAiChat: false, showAiPlanner: true }))).toEqual(['/en/ai/itinerary']);
    expect(aiLinks(buildMenuItems({ ...base, showAiChat: false, showAiPlanner: false }))).toBeNull();
    expect(buildMenuItems({ ...base, showAiChat: false, showAiPlanner: false }).some((i) => i.label === 'About')).toBe(true);
  });

  test('llms.txt lists only the AI features that are on', () => {
    const b = 'https://beachrex.com';
    const both = llmsAiLines(b, { aiAssistantEnabled: true, aiTripPlannerEnabled: true });
    expect(both).toContain(`${b}/en/ai/chat`);
    expect(both).toContain(`${b}/en/ai/itinerary`);
    const chatOnly = llmsAiLines(b, { aiAssistantEnabled: true, aiTripPlannerEnabled: false });
    expect(chatOnly).toContain('/en/ai/chat');
    expect(chatOnly).not.toContain('itinerary');
    const plannerOnly = llmsAiLines(b, { aiAssistantEnabled: false, aiTripPlannerEnabled: true });
    expect(plannerOnly).toContain('/en/ai/itinerary');
    expect(plannerOnly).not.toContain('/ai/chat');
    expect(llmsAiLines(b, { aiAssistantEnabled: false, aiTripPlannerEnabled: false })).toBe('');
  });

  test('each AI route segment is gated by its own switch (layout sources)', () => {
    const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
    expect(read('src/app/[locale]/ai/layout.tsx')).toContain('anyAiFeatureEnabled(');
    expect(read('src/app/[locale]/ai/chat/layout.tsx')).toMatch(/if \(!aiAssistantEnabled\) notFound\(\)/);
    expect(read('src/app/[locale]/ai/itinerary/layout.tsx')).toMatch(/if \(!aiTripPlannerEnabled\) notFound\(\)/);
    expect(read('src/app/[locale]/payment/layout.tsx')).toMatch(/if \(!aiTripPlannerEnabled\) notFound\(\)/);
    expect(read('src/components/Payment/PaymentResult.tsx')).toContain('success && aiAssistantEnabled && (');
  });
});

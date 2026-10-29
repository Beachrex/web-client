import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import {
  CLARITY_PROJECT_ID,
  analyticsConsentFromUpdate,
  clarityConsentOptions,
  hasAnalyticsConsent,
  shouldLoadClarity,
} from '@/lib/analytics/clarity';

/** Microsoft Clarity: production only, and only after CookieYes analytics consent (owner, 2026-10-29). */
test.describe('Microsoft Clarity', () => {
  test('loads only on the production site', () => {
    expect(shouldLoadClarity('https://beachrex.com')).toBe(true);
    expect(shouldLoadClarity('https://www.beachrex.com/')).toBe(true);
    expect(shouldLoadClarity('https://dev.beachrex.com')).toBe(false);
    expect(shouldLoadClarity('https://uat.beachrex.com')).toBe(false);
    expect(shouldLoadClarity('http://localhost:3000')).toBe(false);
    expect(shouldLoadClarity('http://localhost:9')).toBe(false);
    expect(shouldLoadClarity(undefined)).toBe(false);
  });

  test('needs the CookieYes analytics category', () => {
    expect(hasAnalyticsConsent({ categories: { necessary: true, analytics: true } })).toBe(true);
    expect(hasAnalyticsConsent({ categories: { necessary: true, analytics: false } })).toBe(false);
    expect(hasAnalyticsConsent({ categories: { necessary: true, advertisement: true } })).toBe(false);
    expect(hasAnalyticsConsent({})).toBe(false);
    expect(hasAnalyticsConsent(null)).toBe(false);
    expect(hasAnalyticsConsent(undefined)).toBe(false);
  });

  test('reads accept and withdrawal from the consent update event', () => {
    expect(analyticsConsentFromUpdate({ accepted: ['necessary', 'analytics'], rejected: [] })).toBe(true);
    expect(analyticsConsentFromUpdate({ accepted: ['necessary'], rejected: ['analytics'] })).toBe(false);
    expect(analyticsConsentFromUpdate({ rejected: ['analytics'] })).toBe(false);
    expect(analyticsConsentFromUpdate({})).toBeNull();
    expect(analyticsConsentFromUpdate(null)).toBeNull();
  });

  test('consent v2 signal never grants ad storage', () => {
    expect(clarityConsentOptions(true)).toEqual({ ad_Storage: 'denied', analytics_Storage: 'granted' });
    expect(clarityConsentOptions(false)).toEqual({ ad_Storage: 'denied', analytics_Storage: 'denied' });
  });

  test('layout mounts Clarity behind the production check, without identify', () => {
    const layout = readFileSync(join(process.cwd(), 'src', 'app', '[locale]', 'layout.tsx'), 'utf8');
    expect(layout).toContain('shouldLoadClarity(env.NEXT_PUBLIC_BASE_URL) && <MicrosoftClarity');
    const component = readFileSync(
      join(process.cwd(), 'src', 'components', 'Analytics', 'MicrosoftClarity.tsx'),
      'utf8',
    );
    expect(component).not.toContain('Clarity.identify');
    expect(CLARITY_PROJECT_ID).toBe('z5cgzffcp2');
  });
});

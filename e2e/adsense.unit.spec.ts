import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { ADSENSE_SCRIPT_URL, buildTagLoaderScript, shouldLoadAdsense } from '@/lib/analytics/adsense';
import { parseSiteSettings, SITE_SETTINGS_FALLBACK } from '@/lib/site-settings';

/** Google ads (AdSense): production only AND the admin switch `ads_enabled` (default off, owner 2026-10-29). */
test.describe('Google ads (AdSense) switch', () => {
  const on = { adsEnabled: true };
  const off = { adsEnabled: false };

  test('loads only on the production site with the switch on', () => {
    expect(shouldLoadAdsense('https://beachrex.com', on)).toBe(true);
    expect(shouldLoadAdsense('https://www.beachrex.com/', on)).toBe(true);
    expect(shouldLoadAdsense('https://beachrex.com', off)).toBe(false);
    for (const base of ['https://dev.beachrex.com', 'https://uat.beachrex.com', 'http://localhost:9', undefined]) {
      expect(shouldLoadAdsense(base, on), String(base)).toBe(false);
    }
  });

  test('fails closed: a missing key or an unreadable API means no ads', () => {
    expect(SITE_SETTINGS_FALLBACK.adsEnabled).toBe(false);
    expect(shouldLoadAdsense('https://beachrex.com', SITE_SETTINGS_FALLBACK)).toBe(false);
    for (const json of [null, {}, { data: {} }, { data: { ads_enabled: 'true' } }, { data: { ads_enabled: 1 } },
      { data: { ai_assistant_enabled: true, ai_trip_planner_enabled: true } }]) {
      expect(parseSiteSettings(json).adsEnabled, JSON.stringify(json)).toBe(false);
    }
    expect(parseSiteSettings({ success: true, data: { ads_enabled: true } }).adsEnabled).toBe(true);
    expect(shouldLoadAdsense('https://beachrex.com', parseSiteSettings({ data: { ads_enabled: true } }))).toBe(true);
  });

  test('the tag loader adds the AdSense script only when ads are on; Analytics always', () => {
    const withAds = buildTagLoaderScript({ adsEnabled: true });
    const withoutAds = buildTagLoaderScript({ adsEnabled: false });
    expect(withAds).toContain(ADSENSE_SCRIPT_URL);
    expect(withAds).toContain('ca-pub-5133469552990533');
    expect(withoutAds).not.toContain('googlesyndication');
    expect(withoutAds).not.toContain('ca-pub-');
    for (const script of [withAds, withoutAds]) {
      expect(script).toContain('https://www.googletagmanager.com/gtag/js?id=');
    }
  });

  test('the layout passes the switch and no other file loads AdSense; ads.txt stays published', () => {
    const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
    expect(read('src/app/[locale]/layout.tsx')).toContain('adsEnabled={shouldLoadAdsense(env.NEXT_PUBLIC_BASE_URL, siteSettings)}');
    expect(read('src/components/Analytics/ThirdPartyScripts.tsx')).not.toContain('googlesyndication');
    expect(read('src/components/Analytics/ThirdPartyScripts.tsx')).toContain('buildTagLoaderScript({ adsEnabled })');
    expect(read('public/ads.txt')).toContain('google.com, pub-5133469552990533, DIRECT');
  });
});

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import { FEATURES } from '../src/lib/constants/features';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../src/lib/constants/mobile-apps';

/** Owner 2026-10-10: Google Play link in the footer; the App Store badge exists but stays hidden. */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('Google Play points to the published app', () => {
  expect(GOOGLE_PLAY_URL).toBe('https://play.google.com/store/apps/details?id=com.datavallis.beachrex');
  const badges = read('src/components/Footer/FooterAppBadges.tsx');
  expect(badges).toContain('href={GOOGLE_PLAY_URL}');
  expect(read('src/components/Footer/FooterBrandColumn.tsx')).toContain('<FooterAppBadges />');
});

test('the App Store badge is hidden until the iOS app is published', () => {
  expect(FEATURES.iosAppBadge).toBe(false);
  expect(APP_STORE_URL).toBe('');
  expect(read('src/components/Footer/FooterAppBadges.tsx'))
    .toContain("const showAppStore = FEATURES.iosAppBadge && APP_STORE_URL !== '';");
});

test('badge texts exist in all 19 languages', () => {
  const files = readdirSync(join(process.cwd(), 'messages')).filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(19);
  for (const file of files) {
    const app = (JSON.parse(read(`messages/${file}`)) as { Footer: { app?: Record<string, string> } }).Footer.app;
    for (const key of ['title', 'googlePlayTop', 'appStoreTop']) {
      expect(app?.[key], `${file} Footer.app.${key}`).toBeTruthy();
    }
  }
});

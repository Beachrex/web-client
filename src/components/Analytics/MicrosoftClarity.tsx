'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import {
  CLARITY_PROJECT_ID,
  analyticsConsentFromUpdate,
  clarityConsentOptions,
  hasAnalyticsConsent,
  type CookieYesConsent,
  type CookieYesConsentUpdate,
} from '@/lib/analytics/clarity';

declare global {
  interface Window {
    getCkyConsent?: () => CookieYesConsent;
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Microsoft Clarity (heatmaps, session recordings). Mounted once in the locale layout and only on
 * the production site (the layout checks `shouldLoadClarity`).
 *
 * Clarity sets analytics cookies, so the tag is not loaded at all until the visitor accepts the
 * CookieYes "analytics" category (on this visit or an earlier one). It is then injected async,
 * after the browser is idle, with the Clarity consent v2 signal set to granted. If the visitor
 * later withdraws analytics consent, Clarity gets the denied signal and stops using cookies.
 * Nothing personal is sent (no `identify`); only the page locale as a tag.
 */
export default function MicrosoftClarity({ locale }: { locale: string }) {
  useEffect(() => {
    let started = false;
    let cancelIdle: (() => void) | undefined;

    const start = () => {
      if (started) return;
      started = true;
      const run = () => {
        Clarity.init(CLARITY_PROJECT_ID);
        Clarity.consentV2(clarityConsentOptions(true));
        Clarity.setTag('locale', locale);
      };
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(run, { timeout: 4000 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(run, 1500);
        cancelIdle = () => window.clearTimeout(id);
      }
    };

    const apply = (granted: boolean) => {
      if (granted) {
        start();
      } else if (started && typeof window.clarity === 'function') {
        Clarity.consentV2(clarityConsentOptions(false));
      }
    };

    // Earlier choice (CookieYes runs synchronously in <head>, so its API exists by now)
    try {
      apply(hasAnalyticsConsent(window.getCkyConsent?.()));
    } catch {
      // CookieYes blocked (ad blocker): no consent, no Clarity
    }

    const onUpdate = (event: Event) => {
      const decision = analyticsConsentFromUpdate((event as CustomEvent<CookieYesConsentUpdate>).detail);
      if (decision !== null) apply(decision);
    };
    const onBannerLoad = () => {
      try {
        apply(hasAnalyticsConsent(window.getCkyConsent?.()));
      } catch {
        // ignore
      }
    };
    document.addEventListener('cookieyes_consent_update', onUpdate);
    document.addEventListener('cookieyes_banner_load', onBannerLoad);
    return () => {
      document.removeEventListener('cookieyes_consent_update', onUpdate);
      document.removeEventListener('cookieyes_banner_load', onBannerLoad);
      cancelIdle?.();
    };
  }, [locale]);

  return null;
}

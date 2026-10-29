import { isProductionSite } from '@/lib/utils/environment';

/**
 * Microsoft Clarity (owner, 2026-10-29: "samo na PROD"). Public project id, not a secret: it is
 * visible in the tag URL of every page.
 */
export const CLARITY_PROJECT_ID = 'z5cgzffcp2';

/** Clarity runs only on the production site (beachrex.com), never on dev, uat, local or tests. */
export function shouldLoadClarity(baseUrl: string | undefined): boolean {
  return isProductionSite(baseUrl);
}

/** The part of CookieYes `getCkyConsent()` we read. */
export interface CookieYesConsent {
  categories?: Partial<Record<string, boolean>>;
}

/** The `detail` of the CookieYes `cookieyes_consent_update` event. */
export interface CookieYesConsentUpdate {
  accepted?: string[];
  rejected?: string[];
}

/** True only when the visitor has accepted the CookieYes "analytics" category. */
export function hasAnalyticsConsent(consent: CookieYesConsent | null | undefined): boolean {
  return consent?.categories?.analytics === true;
}

/**
 * Consent decision from a `cookieyes_consent_update` event: `true` when analytics was accepted,
 * `false` when it was rejected (or not in the accepted list), `null` when the event has no detail.
 */
export function analyticsConsentFromUpdate(detail: CookieYesConsentUpdate | null | undefined): boolean | null {
  if (!detail || (!Array.isArray(detail.accepted) && !Array.isArray(detail.rejected))) return null;
  return Array.isArray(detail.accepted) && detail.accepted.includes('analytics');
}

/** Clarity consent API v2 payload; Clarity sets no cookies while analytics storage is denied. */
export function clarityConsentOptions(granted: boolean): {
  ad_Storage: 'granted' | 'denied';
  analytics_Storage: 'granted' | 'denied';
} {
  // Clarity is not used for ads, so ad storage stays denied in both cases
  return { ad_Storage: 'denied', analytics_Storage: granted ? 'granted' : 'denied' };
}

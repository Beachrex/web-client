import { ADSENSE_CLIENT, GOOGLE_ANALYTICS_ID } from '@/lib/constants/third-party';
import type { SiteSettings } from '@/lib/site-settings';
import { isProductionSite } from '@/lib/utils/environment';

/**
 * Google ads (AdSense). Owner 2026-10-29: "izklopi mi Google ads na produkciji … da bi jih lahko prek admina
 * vklapljali ali izklapljali". The site uses Auto ads (Google places the ads itself, there are no ad slots in our
 * markup), so loading the script is the only switch: without it no ad and no empty ad space appears.
 */
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/**
 * AdSense loads only on the production site AND when the admin switch `ads_enabled` is on. The switch comes from
 * `fetchSiteSettings()`, which fails closed: an unreadable API means no ads. Consent rules are unchanged (Consent
 * Mode defaults + CookieYes, see ThirdPartyScripts).
 */
export function shouldLoadAdsense(baseUrl: string | undefined, settings: Pick<SiteSettings, 'adsEnabled'>): boolean {
  return isProductionSite(baseUrl) && settings.adsEnabled === true;
}

/** Inline loader for the Google tags (runs after the consent defaults). AdSense is added only when `adsEnabled`. */
export function buildTagLoaderScript({ adsEnabled }: { adsEnabled: boolean }): string {
  return `
(function(){
  function add(src, cross){
    var s = document.createElement('script');
    s.async = true; s.src = src;
    if (cross) s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }
  add('https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}');${
    adsEnabled ? `\n  add('${ADSENSE_SCRIPT_URL}', true);` : ''
  }
})();
`;
}

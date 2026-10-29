import { COOKIEYES_SCRIPT, GOOGLE_ANALYTICS_ID } from '@/lib/constants/third-party';
import { buildTagLoaderScript } from '@/lib/analytics/adsense';

/**
 * Cookie consent, analytics and ads (TASK-004, owner decision 2026-10-08). Rendered in <head>
 * on the production site only, so dev and uat stay out of the statistics.
 *
 * Order matters:
 * 1. Google Consent Mode v2 defaults: everything denied until the visitor chooses.
 * 2. CookieYes banner; it updates the consent (enable "Google Consent Mode" in the CookieYes
 *    dashboard) and lists the cookies on the cookie policy page.
 * 3. Google Analytics and AdSense; they respect the consent state (no cookies while denied).
 *
 * AdSense (Auto ads: Google places the ads itself, the site has no ad slots) is added only when
 * `adsEnabled` — the admin switch "Google ads (AdSense)", default off (owner 2026-10-29).
 */
export default function ThirdPartyScripts({ adsEnabled }: { adsEnabled: boolean }) {
  const consentDefaults = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 2000
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
gtag('js', new Date());
gtag('config', '${GOOGLE_ANALYTICS_ID}');
`;

  // Injected from an inline script, not as async script tags: React hoists async scripts to the
  // top of <head>, ahead of the consent defaults, and a cached tag could then run first.
  const tagLoader = buildTagLoaderScript({ adsEnabled });

  return (
    <>
      {/* eslint-disable-next-line react/no-danger -- static, no user input */}
      <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: consentDefaults }} />
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- the banner must run before the tags below */}
      <script id="cookieyes" type="text/javascript" src={COOKIEYES_SCRIPT} />
      {/* eslint-disable-next-line react/no-danger -- static, no user input */}
      <script id="tag-loader" dangerouslySetInnerHTML={{ __html: tagLoader }} />
    </>
  );
}

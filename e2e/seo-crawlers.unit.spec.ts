import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { test, expect } from '@playwright/test';
import robots from '@/app/robots';
import { AI_SEARCH_BOTS, AI_TRAINING_BOTS } from '@/lib/constants/crawlers';
import { ADSENSE_CLIENT } from '@/lib/constants/third-party';

/**
 * TASK-004 SEO: a static public/robots.txt ("Disallow: /") shadowed app/robots.ts, so production
 * would have blocked every search engine. Owner decision 2026-10-08: AI search bots yes,
 * AI training bots no. AdSense needs /ads.txt.
 */

const root = process.cwd();

function withBaseUrl<T>(url: string, fn: () => T): T {
  const old = process.env.NEXT_PUBLIC_BASE_URL;
  process.env.NEXT_PUBLIC_BASE_URL = url;
  try {
    return fn();
  } finally {
    process.env.NEXT_PUBLIC_BASE_URL = old;
  }
}

type Rule = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] };
const rulesOf = (r: ReturnType<typeof robots>): Rule[] => (Array.isArray(r.rules) ? r.rules : [r.rules]);

test('no static robots.txt shadows the robots route', () => {
  expect(existsSync(join(root, 'public/robots.txt'))).toBe(false);
});

test('production: search engines and AI search bots allowed, AI training bots blocked, sitemap listed', () => {
  const r = withBaseUrl('https://beachrex.com', () => robots());
  const rules = rulesOf(r);
  expect(rules.find((x) => x.userAgent === '*')).toMatchObject({ allow: '/' });
  expect(rules.find((x) => x.userAgent === '*')?.disallow).not.toContain('/_next/');
  expect(rules.find((x) => x.userAgent === AI_SEARCH_BOTS)).toMatchObject({ allow: '/' });
  expect(rules.find((x) => x.userAgent === AI_TRAINING_BOTS)).toMatchObject({ disallow: '/' });
  expect(AI_SEARCH_BOTS).toEqual(expect.arrayContaining(['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot']));
  expect(AI_TRAINING_BOTS).toEqual(expect.arrayContaining(['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot']));
  expect(AI_SEARCH_BOTS.filter((b) => AI_TRAINING_BOTS.includes(b))).toEqual([]);
  expect(r.sitemap).toBe('https://beachrex.com/sitemap.xml');
});

for (const url of ['https://dev.beachrex.com', 'https://uat.beachrex.com', 'http://localhost:3000']) {
  test(`${url}: everything blocked`, () => {
    const rules = rulesOf(withBaseUrl(url, () => robots()));
    expect(rules).toEqual([{ userAgent: '*', disallow: '/' }]);
  });
}

test('ads.txt names the AdSense publisher, and the middleware leaves it alone', () => {
  const ads = readFileSync(join(root, 'public/ads.txt'), 'utf8');
  expect(ads).toContain(`google.com, ${ADSENSE_CLIENT.replace('ca-', '')}, DIRECT, f08c47fec0942fa0`);
  const middleware = readFileSync(join(root, 'src/middleware.ts'), 'utf8');
  expect(middleware).toMatch(/ads\\\\\.txt/);
  expect(middleware).toMatch(/llms\\\\\.txt/);
});

test('consent defaults load before CookieYes, Analytics and AdSense, on production only', () => {
  const scripts = readFileSync(join(root, 'src/components/Analytics/ThirdPartyScripts.tsx'), 'utf8');
  // The tags are injected by the inline loader; React would hoist async script tags above the defaults.
  expect(scripts).not.toMatch(/<script\s+async/);
  const order = ['id="consent-defaults"', 'id="cookieyes"', 'id="tag-loader"'].map((s) => scripts.indexOf(s));
  // The loader text lives in src/lib/analytics/adsense.ts; AdSense only behind the admin switch (2026-10-29).
  expect(scripts).toContain('buildTagLoaderScript({ adsEnabled })');
  const loader = readFileSync(join(root, 'src/lib/analytics/adsense.ts'), 'utf8');
  expect(loader).toMatch(/googletagmanager\.com\/gtag\/js/);
  expect(loader).toMatch(/adsbygoogle\.js\?client=/);
  expect(order.every((i) => i >= 0)).toBe(true);
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  expect(scripts).toMatch(/analytics_storage: 'denied'/);
  expect(scripts).toMatch(/ad_storage: 'denied'/);
  const layout = readFileSync(join(root, 'src/app/[locale]/layout.tsx'), 'utf8');
  expect(layout).toMatch(/isProductionSite\(env\.NEXT_PUBLIC_BASE_URL\) && \(\s*<ThirdPartyScripts adsEnabled=\{shouldLoadAdsense\(/);
});

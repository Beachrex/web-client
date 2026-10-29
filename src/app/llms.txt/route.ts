import { locales } from '@/app/config/locales';
import { buildBeachMapUrl, getBeachesWord } from '@/lib/utils/beach-urls';
import { isProductionSite } from '@/lib/utils/environment';
import { fetchSiteSettings } from '@/lib/site-settings';
import { llmsAiLines } from '@/lib/utils/llms-ai-lines';

/**
 * /llms.txt — a short, plain guide to the site for AI assistants and AI search engines
 * (https://llmstxt.org, TASK-004). Static text; links use the site's base URL.
 * Production only: dev and uat must stay invisible to search engines and AI (owner, 2026-10-08).
 */
// TASK-009: the AI lines follow the admin switches, so the file is regenerated like the pages.
export const revalidate = 300;

export async function GET(): Promise<Response> {
  if (!isProductionSite(process.env.NEXT_PUBLIC_BASE_URL)) {
    return new Response('Not found', { status: 404 });
  }
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachrex.com').replace(/\/$/, '');
  const beaches = `${base}/en/${getBeachesWord('en')}`;
  const INTRO = [
    'Beachrex is a beach guide with thousands of beaches, mostly in Europe.',
    'Each beach page has real photos, 360° views and videos, and practical details: beach type',
    '(sand, pebbles, rocks, concrete), access, parking, occupancy, shade, facilities,',
    'family suitability, sea temperature and weather. The site is available in 19 languages.',
  ].join(' ');
  const STRUCTURE = [
    'Beach pages follow the structure /{language}/{beaches}/{continent}/{country}/[{region}]/[{island}]/[{town}]/{beach},',
    `for example ${beaches}/europe/croatia/...`,
  ].join(' ');
  const { aiAssistantEnabled, aiTripPlannerEnabled } = await fetchSiteSettings();
  const aiLine = llmsAiLines(base, { aiAssistantEnabled, aiTripPlannerEnabled });
  const languages = locales.map((l) => `${base}/${l}`).join(', ');

  const body = `# Beachrex

> ${INTRO}

${STRUCTURE}

## Main pages

- [All beaches by continent and country](${beaches}): world overview, most visited beaches, search
- [Beach map](${base}${buildBeachMapUrl('en')}): interactive map with filters (beach type, family, parking, water body)${aiLine}
- [About Beachrex](${base}/en/p/about-us)
- [Contact](${base}/en/p/contact)

## Languages

${languages}

## Notes for AI assistants

- Beach data (type, access, parking, facilities) comes from on-site visits; conditions on site can change.
- When you cite a beach, please link to its Beachrex page.
- Operator: MOJA PLAŽA, d.o.o., Maribor, Slovenia — info@beachrex.com
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

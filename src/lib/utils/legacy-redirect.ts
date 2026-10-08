import { buildBeachMapUrl, getBeachesWord } from '@/lib/utils/beach-urls';

/**
 * Old beachrex.com URLs → new pages (TASK-004 step 5b).
 *
 * The old site used the language prefixes sl, en, hr, de, fr, es, it, ua, ru. All but `sl` are
 * new locales too; Slovenian is `si` now. The backend (`GET /api/v1/legacy-redirect`) maps the
 * rest of the old path to the new page and returns the localized slugs after the beaches word.
 */

/** `/sl` or `/sl/...` → the same path under `/si`, else null. */
export function legacySlovenianPath(pathname: string): string | null {
  if (pathname === '/sl' || pathname.startsWith('/sl/')) {
    return `/si${pathname.slice(3)}`;
  }
  return null;
}

export interface LegacyTarget {
  type: string;
  segments: string[];
}

/** New URL for a resolved old URL, or null when the resolver gave nothing usable. */
export function buildLegacyTargetUrl(target: LegacyTarget | null | undefined, locale: string): string | null {
  if (!target) return null;
  if (target.type === 'map') return buildBeachMapUrl(locale);
  const segments = (target.segments ?? []).filter(Boolean).map(encodeURIComponent);
  if (segments.length < 2) return null; // at least continent + country
  return `/${locale}/${getBeachesWord(locale)}/${segments.join('/')}`;
}
